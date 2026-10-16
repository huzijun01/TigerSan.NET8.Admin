export class PathHelper {
    /** 组合 */
    static Combine(path1: string, path2: string): string {
        if (!path1) return path2
        if (!path2) return path1

        // 统一使用 '/'
        const p1 = path1.replace(/\\/g, '/')
        const p2 = path2.replace(/\\/g, '/')

        // 如果 path2 是绝对路径（以 / 或盘符如 C: 开头），则直接返回 path2
        if (p2.startsWith('/') || /^[a-zA-Z]:/.test(p2)) {
            return p2
        }

        // 确保 path1 末尾没有斜杠，path2 开头没有斜杠，然后拼接
        const cleanP1 = p1.replace(/\/+$/, '')
        const cleanP2 = p2.replace(/^\/+/, '')

        // 如果 cleanP1 为空（例如 path1 仅为 "/"），则直接返回 "/" + cleanP2
        if (!cleanP1) {
            return '/' + cleanP2
        }

        return `${cleanP1}/${cleanP2}`
    }

    /**
     * 获取路径的上一级目录
     * @returns 上级路径。如果路径没有上级目录（如 'abc' 或根目录），返回 ''
     */
    static GetParent(path: string): string {
        if (!path || path.trim() === '') {
            return ''
        }

        // 统一分隔符为 '/'
        let normalizedPath = path.replace(/\\/g, '/')

        // 去除末尾多余的斜杠，除非它是根目录 '/'
        if (normalizedPath !== '/') {
            normalizedPath = normalizedPath.replace(/\/+$/, '')
        }

        // 查找最后一个斜杠的位置
        const lastSlashIndex = normalizedPath.lastIndexOf('/')

        // 没有找到斜杠，直接返回 ''
        if (lastSlashIndex === -1) {
            return ''
        }

        // 斜杠在索引 0
        if (lastSlashIndex === 0) {
            if (normalizedPath === '/') {
                return ''
            }
            return '/'
        }

        // 普通多层路径,截取从开头到最后一个斜杠之前的部分
        return normalizedPath.substring(0, lastSlashIndex)
    }
}
