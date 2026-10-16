export class ArrayHelper {
    /** 修改源数据 */
    static Set<T>(src: T[], dest: T[]) {
        src.splice(0)
        src.push(...dest)
    }

    /** 删除元素 */
    static Delete<T>(arr: T[], item: T) {
        const index = arr.findIndex(i => i === item)
        if (index != -1) {
            arr.splice(index, 1)
        }
    }

    /** 获取“首个元素” */
    static GetFirst<T>(arr: T[]): T | undefined {
        if (arr.length < 1) return undefined
        return arr[0]
    }

    /** 获取“末尾元素” */
    static GetLast<T>(arr: T[]): T | undefined {
        if (arr.length < 1) return undefined
        return arr[arr.length - 1]
    }

    /** 过滤元素（修改源数据） */
    static Filter<T>(arr: T[], fn: (item: T) => boolean) {
        const filter = arr.filter(fn)
        arr.splice(0)
        arr.push(...filter)
    }

    /** 是否“为空” */
    static IsEmpty<T>(arr?: T[]) {
        return !arr || arr.length < 1
    }

    /** 是否“不为空” */
    static IsNotEmpty<T>(arr?: T[]) {
        return arr && arr.length > 0
    }

    /** 排序 */
    static Sort<T extends object>(
        arr: T[],
        propName: string,
        ascending: boolean = true,
        isBigger?: (a: T, b: T) => boolean
    ): T[] {
        const source = arr

        source.sort((a: T, b: T) => {
            let result: number

            if (isBigger) {
                if (isBigger(a, b)) {
                    result = 1
                } else if (isBigger(b, a)) {
                    result = -1
                } else {
                    result = 0
                }
            } else {
                const valA = (a as any)[propName]
                const valB = (b as any)[propName]

                if (valA === undefined || valA === null) return 1
                if (valB === undefined || valB === null) return -1

                if (valA < valB) {
                    result = -1
                } else if (valA > valB) {
                    result = 1
                } else {
                    result = 0
                }
            }

            return ascending ? result : -result
        })

        return source
    }
}