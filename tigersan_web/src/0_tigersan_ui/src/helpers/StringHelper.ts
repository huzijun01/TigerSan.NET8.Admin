import DOMPurify from 'dompurify'

export class StringHelper {
    /** 过滤所有DOM标签 */
    static StringXSS(str: string) {
        return DOMPurify.sanitize(str, {
            ALLOWED_TAGS: [],       // 禁止所有HTML标签
            ALLOWED_ATTR: [],       // 禁止所有属性
            RETURN_DOM: false,      // 返回纯文本而非DOM节点
            RETURN_DOM_FRAGMENT: false,
            SANITIZE_DOM: true,     // 启用DOM净化
            KEEP_CONTENT: true      // 保留标签内的文本内容
        });
    }

    /** 将“普通文本”转为“HTML文本” */
    static StringToHtml(str: string, strEnter: string = '<br>') {
        return str.replace(/\r\n|\r|\n/g, strEnter)
            .replace(/ {2}/g, '&nbsp;&nbsp;')
    }

    /** 是否“不为空” */
    static IsNotEmpty(str?: string): boolean {
        try {
            if (!str) return false
            const str1 = str.toString().trim()
            return str1 != ''
        } catch (error) {
            console.error(error)
            return true
        }
    }

    /** 是否“模糊包含” */
    static IsFuzzyIncludes(str: string, search: string): boolean {
        if (search === '') return true
        return str.toLowerCase().includes(search.toLowerCase())
    }
}