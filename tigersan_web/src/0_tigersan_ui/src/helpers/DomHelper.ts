import { ClassObserver } from "./ClassObserver"

export class DomHelper {
    /** 添加“样式” */
    static AddCss(url: string) {
        const exist = document.head.querySelector(`link[href="${url}"]`)
        if (exist) return

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.type = 'text/css'
        link.href = url
        document.head.appendChild(link)
    }

    /** 移除“样式” */
    static RemoveCss(url: string) {
        const links = document.head.querySelectorAll(`link[href="${url}"]`)

        links.forEach(link => {
            link.remove()
        })
    }

    /** 添加“类” */
    static AddClass(name: string, dom: HTMLElement = document.documentElement) {
        dom.classList.add(name)
    }

    /** 移除“类” */
    static RemoveClass(name: string, dom: HTMLElement = document.documentElement) {
        dom.classList.remove(name)
    }

    /** 是否“包含类” */
    static IsIncludeClass(name: string, dom: HTMLElement = document.documentElement): boolean {
        const classes = ClassObserver.GetClassList(dom)
        return classes.includes(name)
    }
}