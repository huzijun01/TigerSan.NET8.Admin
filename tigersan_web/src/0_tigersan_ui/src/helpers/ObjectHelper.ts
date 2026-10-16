export class ObjectHelper {
    /** 浅复制“字段值” */
    static ShallowSet<TSource extends object, TTarget extends object>(src: TSource, dest: TTarget): void {
        for (const [k, v] of Object.entries(src)) {
            if (k in dest) {
                dest[k as keyof TTarget] = v as TTarget[keyof TTarget]
            }
        }
    }

    /** 浅复制 */
    static ShallowCopy<TSource extends object>(obj: TSource): TSource {
        // 处理基本类型直接返回
        if (obj === null || typeof obj != 'object') {
            return obj as TSource
        }

        // 获取原型并创建新对象
        const proto = Object.getPrototypeOf(obj)
        const copy = Object.create(proto)

        // 复制所有自身字段（包括不可枚举字段和 Symbol）
        const keys = Reflect.ownKeys(obj)
        for (const key of keys) {
            copy[key as keyof TSource] = obj[key as keyof TSource]
        }

        return copy
    }

    /** 深复制 */
    static DeepCopy<TSource extends object>(obj: TSource): TSource {
        const hash = new WeakMap<object, any>()

        function _copy(obj: any): any {
            // 处理基本类型和函数
            if (obj === null || typeof obj != 'object') {
                return obj
            }

            // 处理循环引用
            if (hash.has(obj)) {
                return hash.get(obj)
            }

            // 处理特殊类型
            switch (true) {
                case obj instanceof Date:
                    return new Date(obj.getTime())
                case obj instanceof RegExp:
                    return new RegExp(obj)
                // case ArrayBuffer.isView(obj): // 处理 TypedArray
                //     return obj.slice()
                case obj instanceof ArrayBuffer:
                    return obj.slice(0)
                case obj instanceof Map:
                    const mapCopy = new Map()
                    hash.set(obj, mapCopy)
                    obj.forEach((value, key) => {
                        mapCopy.set(_copy(key), _copy(value))
                    })
                    return mapCopy
                case obj instanceof Set:
                    const setCopy = new Set()
                    hash.set(obj, setCopy)
                    obj.forEach(value => {
                        setCopy.add(_copy(value))
                    })
                    return setCopy
            }

            // 处理数组
            if (Array.isArray(obj)) {
                const arrCopy = [...obj]
                hash.set(obj, arrCopy)
                for (let i = 0; i < arrCopy.length; i++) {
                    arrCopy[i] = _copy(arrCopy[i]);
                }
                return arrCopy
            }

            // 处理普通对象
            const proto = Object.getPrototypeOf(obj)
            const objCopy = Object.create(proto)
            hash.set(obj, objCopy)

            // 复制所有自身字段（包括不可枚举和 Symbol）
            const keys = Reflect.ownKeys(obj)
            for (const key of keys) {
                objCopy[key] = _copy(obj[key])
            }

            return objCopy
        }

        return _copy(obj)
    }

    /** 修改“字段值”默认方法 */
    static DefaultTGetter<TValue>(obj: object, propName: string, defaultValue?: TValue): TValue | undefined {
        return (obj as Record<string, TValue>)[propName] ?? defaultValue
    }

    /** 修改“字段值”默认方法 */
    static DefaultTSetter<TValue>(obj: object, propName: string, value: TValue): void {
        (obj as Record<string, TValue>)[propName] = value;
    }

    /** 默认“对象行为”  */
    static DefaultObjectAction() { return {} }

    /** 获取“字段文本”默认方法 */
    static DefaultStringGetter(obj: object, propName: string): string {
        const value = (obj as Record<string, unknown>)[propName]
        if (value === undefined || value === null) return ''
        return String(value)
    }

    /** 获取“数字值”默认方法 */
    static DefaultNumberGetter(obj: object, propName: string): number {
        const value = (obj as Record<string, unknown>)[propName]

        // 处理 null/undefined 和其他类型的转换
        return value != null ? Number(value) : 0
    }

    /** 获取“日期文本”默认方法 */
    static DefaultDateStringGetter(obj: object, propName: string): string {
        const value = (obj as Record<string, unknown>)[propName]
        if (!(value instanceof Date || typeof value === 'string' || typeof value === 'number')) {
            console.warn('The value type is incorrect!')
            return ''
        }
        return this.GetDateString(value)
    }

    /** 获取“日期文本” */
    static GetDateString(
        value?: Date | number | string,
        isSeparate: boolean = true,
        isShowTime: boolean = true): string {
        let date: Date

        // 处理输入值
        if (value === undefined || value === null) {
            return ''
        } else if (value instanceof Date) {
            date = value
        } else if (typeof value === 'number' || typeof value === 'string') {
            date = new Date(value)
        } else {
            console.warn('Invalid parameter type!')
            return ''
        }

        // 验证日期有效性
        if (isNaN(date.getTime())) {
            console.warn('Incorrect date format!')
            return ''
        }

        // 格式化各部分并补零
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')
        if (isShowTime) {
            return isSeparate
                ? `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
                : `${year}${month}${day}${hours}${minutes}${seconds}`
        } else {
            return isSeparate
                ? `${year}-${month}-${day}`
                : `${year}${month}${day}`
        }
    }

    /** 获取“日期ID” */
    static GetDateId(): string {
        const timestamp = ObjectHelper.GetDateString(Date.now(), false);
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let random = ''
        for (let i = 0; i < 2; i++) {
            random += chars[Math.floor(Math.random() * 26)]
        }
        return `${timestamp}${random}`
    }

    /** 获取一周前和今天的日期 */
    static GetOneWeekAgoAndToday(): { start: Date, end: Date } {
        const now = new Date()
        const end = new Date(now)
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return { start, end }
    }

    /** 获取一周前和今天的日期（字符串） */
    static GetOneWeekAgoAndTodayString(): { start: string, end: string } {
        const now = new Date()
        const end = new Date(now)
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return { start: ObjectHelper.GetDateString(start), end: ObjectHelper.GetDateString(end) }
    }

    /** 判断“字段文本”是否等于“目标值”  */
    static IsTextEqual<TValue>(obj: object, propName: string, value: TValue): boolean {
        return ObjectHelper.DefaultStringGetter(obj, propName) === value
    }

    /** 判断“字段值”是否等于“目标值”  */
    static IsSourceEqual<TValue>(obj: object, propName: string, value: TValue): boolean {
        return ObjectHelper.DefaultTGetter(obj, propName) === value
    }

    /** 判断“是否为空” */
    static IsNullOrUndefined(v?: unknown): boolean {
        return v === null || v === undefined
    }

    /** 判断“是否不为空” */
    static IsNotNullOrUndefined(v?: unknown): boolean {
        return v != null && v != undefined
    }

    /** 判断“是否值相等” */
    static IsValueEquals<TValue>(a: TValue, b: TValue): boolean {
        const replacer = (key: string, value: any): any => {
            if (typeof value === 'bigint') {
                return value.toString()
            }
            return value
        }
        return JSON.stringify(a, replacer) === JSON.stringify(b, replacer)
    }

    /** 判断“类型是否相同” */
    static IsSameType(a: unknown, b: unknown, isIgnoreUndefinedOrNull: boolean = true): boolean {
        // 是否忽略undefined和null:
        if (isIgnoreUndefinedOrNull && (ObjectHelper.IsNullOrUndefined(a) || ObjectHelper.IsNullOrUndefined(b))) {
            return true
        } else {
            // 处理 null 的特殊情况:
            if (a === null && b === null) return true
            if (a === null || b === null) return false

            // 处理 undefined 的特殊情况:
            if (a === undefined && b === undefined) return true
            if (a === undefined || b === undefined) return false
        }

        // 获取基础类型:
        const aType = typeof a
        const bType = typeof b

        // 基础类型不同直接返回 false:
        if (aType !== bType) return false

        // 处理原始类型（排除 object 和 function）:
        if (aType !== 'object' && aType !== 'function') {
            return true
        }

        // 处理对象类型和函数
        const aTag = Object.prototype.toString.call(a)
        const bTag = Object.prototype.toString.call(b)

        return aTag === bTag
    }
}