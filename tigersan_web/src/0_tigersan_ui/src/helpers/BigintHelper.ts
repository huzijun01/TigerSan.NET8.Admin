export class BigintHelper {
    /** 是否“不为空” */
    static IsNotEmpty<TNum extends bigint | number | string>(value?: TNum): boolean {
        return value != undefined && value != null && value != ''
    }

    /** 是否“相等且不为空” */
    static IsEqualAndNotUndefined<TNum extends bigint | number | string>(value1?: TNum, value2?: TNum): boolean {
        if (value1 === undefined || value1 === null || value1 === '' || value2 === undefined || value2 === null || value2 === '') return false
        return value1.toString() === value2.toString()
    }

    /** 是否“包含” */
    static IsContain<TNum extends bigint | number | string | undefined>(arr: TNum[], value?: TNum): boolean {
        if (value === undefined || value === null || value != '') return false
        return arr.some(i => i && i.toString() === value.toString())
    }
}