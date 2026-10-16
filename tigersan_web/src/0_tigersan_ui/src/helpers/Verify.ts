import { Texts } from "../texts"
import { FormResult, VerifyResult } from "../models/Form/FormModel"

export class Verify {
    static OK(text?: string) {
        return new VerifyResult(text, FormResult.OK)
    }

    static Error(text?: string) {
        return new VerifyResult(text, FormResult.Error)
    }

    static Warning(text?: string) {
        return new VerifyResult(text, FormResult.Warning)
    }

    /** 是否“定义且非空” */
    static IsNotUndefined<T>(obj?: T): VerifyResult {
        if (obj === undefined || obj === null) {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }

        return Verify.OK()
    }

    /** 是否“定义且非空” */
    static IsNotUndefinedOrEmpty(str?: string): VerifyResult {
        if (!str || str.trim() === '') {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }

        return Verify.OK()
    }

    /** 是否“相等” */
    static IsEqual(s1: string, s2: string, strNotEqual?: string): VerifyResult {
        if (s1.trim() === '' || s2.trim() === '') {
            return Verify.Error(Texts.CannotBeEmpty.value)
        } else if (s1 != s2) {
            return Verify.Error(strNotEqual ?? Texts.NotEqual.value)
        }

        return Verify.OK()
    }

    /** 是否“大于” */
    static IsGreaterThan(num: number, min = 0, error?: string): VerifyResult {
        if (isNaN(num)) {
            return Verify.Error(Texts.PleaseEnterANumber.value)
        }
        else if (num <= min) {
            return Verify.Error(error ?? `${Texts.CannotBeLessThan.value}${min}`)
        }

        return Verify.OK()
    }

    /** 是否“大于”（bigint） */
    static IsBigintGreaterThan(num?: bigint, min: bigint = 0n, error?: string): VerifyResult {
        if (num === undefined || num === null) {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }
        else if (num <= min) {
            return Verify.Error(error ?? `${Texts.CannotBeLessThan.value}${min.toString()}`)
        }

        return Verify.OK()
    }

    /** 是否“小于” */
    static IsLessThan(num: number, max: number, error?: string): VerifyResult {
        if (isNaN(num)) {
            return Verify.Error(Texts.PleaseEnterANumber.value)
        }
        else if (num >= max) {
            return Verify.Error(error ?? `${Texts.CannotBeGreaterThan.value}${max}`)
        }

        return Verify.OK()
    }

    /** 是否“在范围内” */
    static IsWithinRange(num: number, min: number, max: number): VerifyResult {
        if (isNaN(num)) {
            return Verify.Error(Texts.PleaseEnterANumber.value)
        }
        else if (num < min) {
            return Verify.Error(`${Texts.CannotBeLessThan.value}${min}`)
        }
        else if (num > max) {
            return Verify.Error(`${Texts.CannotBeGreaterThan.value}${max}`)
        }

        return Verify.OK()
    }

    /** 验证经度是否可用。有效范围: [-180, 180] */
    static IsValidLongitude(longitude?: number, isAllowUndefined: boolean = false): VerifyResult {
        if (isAllowUndefined && (longitude === null || longitude === undefined)) return new VerifyResult('', FormResult.OK)

        if (longitude === null || longitude === undefined) {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }

        if (isNaN(longitude)) {
            return Verify.Error(Texts.PleaseEnterANumber.value)
        }

        if (longitude >= -180 && longitude <= 180) {
            return new VerifyResult('', FormResult.OK)
        } else {
            return new VerifyResult('-180 ~ 180', FormResult.Error)
        }
    }

    /** 验证纬度是否可用。有效范围: [-90, 90] */
    static IsValidLatitude(latitude?: number, isAllowUndefined: boolean = false): VerifyResult {
        if (isAllowUndefined && (latitude === null || latitude === undefined)) return new VerifyResult('', FormResult.OK)

        if (latitude === null || latitude === undefined) {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }

        if (isNaN(latitude)) {
            return Verify.Error(Texts.PleaseEnterANumber.value)
        }

        if (latitude >= -90 && latitude <= 90) {
            return new VerifyResult('', FormResult.OK)
        } else {
            return new VerifyResult('-90 ~ 90', FormResult.Error)
        }
    }


    /** 是否“数组不为空” */
    static IsArrayNotEmpty(arr: Array<unknown>): VerifyResult {
        if (arr.length < 1) {
            return Verify.Error(Texts.PleaseSelect.value)
        }

        return Verify.OK()
    }

    /** 是否“为合法MAC地址” */
    static IsValidMacAddr(str?: string | null): VerifyResult {
        if (!str || str.trim() === '') {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }

        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$|^[0-9A-Fa-f]{12}$/
        if (!macRegex.test(str)) {
            return Verify.Error(Texts.IncorrectMacAddr.value + ` (${str})`)
        }

        return Verify.OK()
    }

    /** 是否“为合法MAC地址”集合（换行符） */
    static IsValidMacAddrs(str?: string, isArray = true): VerifyResult {
        if (!str || str.trim() === '') {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }

        if (isArray) {
            const lines = str.split(/\r?\n/)

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i] as string
                if (line.trim() === '') return Verify.Error(Texts.CannotBeEmpty.value + ` (line:${i + 1})`)
                const result = this.IsValidMacAddr(line)
                if (!result.IsOK) return result
            }

            return Verify.OK()
        } else {
            return this.IsValidMacAddr(str)
        }
    }

    /** 是否“为合法用户名” */
    static IsValidUsername(str: string, min: number = 3, max: number = 15): VerifyResult {
        // 长度校验:
        if (str === undefined || str === null) {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }

        // 动态构建正则:
        const pattern = `^[a-zA-Z_][a-zA-Z0-9_-]{${min - 1},${max - 1}}$`
        const regex = new RegExp(pattern)

        // 字符集、首字符、特殊符号校验:
        if (!regex.test(str)) {
            const res = Verify.Error()
            // 细化错误提示
            if (str.length < min) {
                res.VerifyText = `${Texts.LengthCannotBeLessThan.value}${min}`
            } else if (str.length > max) {
                res.VerifyText = `${Texts.LengthCannotBeGreaterThan.value}${max}`
            } else {
                res.VerifyText = Texts.IncorrectFormat.value
            }
            return res
        }

        // 通过所有校验:
        return Verify.OK()
    }

    /** 是否“为合法昵称” */
    static IsValidNickname(str: string, min: number = 2, max: number = 20): VerifyResult {
        // 空值校验（包含空字符串检查）
        if (str === undefined || str === null || str === '') {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }

        // 动态构建正则：支持中文/字母/数字/下划线/连字符，首字符需为中文或字母
        const pattern = `^[\u4E00-\u9FA5A-Za-z][\u4E00-\u9FA5A-Za-z0-9_-]{${min - 1},${max - 1}}$`;
        const regex = new RegExp(pattern);

        // 字符集、首字符、特殊符号校验
        if (!regex.test(str)) {
            const res = Verify.Error()
            // 细化错误提示（优先长度判断）
            if (str.length < min) {
                res.VerifyText = `${Texts.LengthCannotBeLessThan.value}${min}`
            } else if (str.length > max) {
                res.VerifyText = `${Texts.LengthCannotBeGreaterThan.value}${max}`
            } else {
                // 具体说明非法字符类型
                const invalidChars = [...str].filter(c => !/[\u4E00-\u9FA5A-Za-z0-9_-]/.test(c));
                res.VerifyText = invalidChars.length > 0
                    ? `${Texts.ContainsIllegalCharacters.value} ${invalidChars.map(c => `'${c}'`).join(', ')}`
                    : Texts.IncorrectFormat.value
            }
            return res
        }

        // 通过所有校验
        return Verify.OK()
    }

    /** 是否“为合法密码” */
    static IsValidPassword(str: string, min: number = 8, max: number = 20): VerifyResult {
        // 空值检查
        if (str === undefined || str === null) {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }

        // 长度校验
        if (str.length < min) {
            return Verify.Error(`${Texts.LengthCannotBeLessThan.value}${min}`)
        }
        else if (str.length > max) {
            return Verify.Error(`${Texts.LengthCannotBeGreaterThan.value}${max}`)
        }

        // 字符复杂度校验（使用多个正则分段检查）
        const checks = [
            { regex: /[A-Z]/, msg: Texts.MustContainCapital.value },
            { regex: /[a-z]/, msg: Texts.MustContainLowercase.value },
            { regex: /\d/, msg: Texts.MustContainNumber.value },
            { regex: /[!@#$%^&*()_+\-=[\]{}':"\\|,.<>/?]/, msg: Texts.MustContainSpecialCharacter.value }
        ]

        for (const check of checks) {
            if (!check.regex.test(str)) {
                return Verify.Error(check.msg)
            }
        }

        // 禁止空格检查
        if (/\s/.test(str)) {
            return Verify.Error(Texts.CannotContainSpaces.value)
        }

        // 通过所有校验
        return Verify.OK()
    }

    /** 是否“为合法弱密码” */
    static IsValidWeekPassword(str: string, min: number = 8, max: number = 20): VerifyResult {
        // 空值检查
        if (str === undefined || str === null || str.trim() === '') {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }

        // 长度校验
        if (str.length < min) {
            return Verify.Error(`${Texts.LengthCannotBeLessThan.value}${min}`)
        }
        else if (str.length > max) {
            return Verify.Error(`${Texts.LengthCannotBeGreaterThan.value}${max}`)
        }

        // 复杂度校验（必须同时包含字母和数字）
        const hasLetter = /[a-zA-Z]/.test(str)
        const hasDigit = /\d/.test(str)

        if (!hasLetter) {
            return Verify.Error(Texts.MustContainLetter.value)
        }
        else if (!hasDigit) {
            return Verify.Error(Texts.MustContainNumber.value)
        }

        // 通过所有校验
        return Verify.OK()
    }

    /** 是否“为合法电话号码”（支持国内外格式） */
    static IsValidPhoneNumber(str?: string, isAllowUndefined: boolean = true): VerifyResult {
        // 允许为空
        if (isAllowUndefined && (str === undefined || str === null || str === '')) {
            return Verify.OK()
        }

        // 空值检查
        if (str === undefined || str === null || str.trim() === '') {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }

        // 纯数字校验（禁止任何特殊字符）
        const cleanedStr = str.replace(/\D/g, '')
        if (cleanedStr !== str) {
            return Verify.Error(Texts.OnlyNumbersAllowed.value)
        }

        // 长度校验（国际E.164标准）
        if (str.length < 6) {
            return Verify.Error(`${Texts.LengthCannotBeLessThan.value}${6}`)
        }
        else if (str.length > 15) {
            return Verify.Error(`${Texts.LengthCannotBeGreaterThan.value}${15}`)
        }

        // 更新后的正则表达式（支持无区号座机）
        const patterns = [
            // 国内手机号（11位）
            /^1[3-9]\d{9}$/,

            // 国内座机（支持无区号格式）
            /^\d{7,8}$/,          // 无区号座机（7-8位）
            /^\d{3,4}\d{7,8}$/,   // 带区号座机（3-4位区号+7-8位号码）

            // 国际号码（国家代码+本地号码）
            /^\d{1,3}\d{9,12}$/,  // 1-3位国家代码+9-12位本地号码

            // 特殊号码
            /^(400|800)\d{7}$/   // 400/800开头服务号码
        ]

        // 格式校验
        for (const pattern of patterns) {
            if (pattern.test(cleanedStr)) {
                return Verify.OK()
            }
        }

        // 错误提示
        return Verify.Error(Texts.IncorrectFormat.value)
    }

    /** 是否“为合法邮箱地址” */
    static IsValidEmail(str?: string, isAllowUndefined: boolean = true): VerifyResult {
        // 允许为空
        if (isAllowUndefined && (str === undefined || str === null || str === '')) {
            return Verify.OK()
        }

        // 空值检查
        if (str === undefined || str === null || str.trim() === '') {
            return Verify.Error(Texts.CannotBeEmpty.value)
        }

        // 总长度校验（RFC标准最大254字符）
        const maxLength = 254
        if (str.length > maxLength) {
            return Verify.Error(`${Texts.LengthCannotBeGreaterThan.value}${maxLength}`)
        }

        // 检查是否包含@符号
        const atIndex = str.indexOf('@')
        if (atIndex === -1) {
            return Verify.Error('邮箱必须包含@符号')
        }

        // 本地部分和域名部分提取
        const localPart = str.substring(0, atIndex)
        const domainPart = str.substring(atIndex + 1)

        // 本地部分长度校验（RFC标准最大64字符）
        if (localPart.length > 64) {
            return Verify.Error('邮箱本地部分不能超过64字符')
        }

        // 域名部分长度校验（RFC标准最大253字符）
        if (domainPart.length > 253) {
            return Verify.Error('邮箱域名部分不能超过253字符')
        }

        // 域名标签校验（每个标签1-63字符，仅允许a-z/0-9/-，且不能以-开头/结尾）
        const domainLabels = domainPart.toLowerCase().split('.')
        for (const label of domainLabels) {
            if (label.length === 0 || label.length > 63) {
                return Verify.Error('域名标签长度无效（1-63字符）')
            }

            if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) {
                return Verify.Error('域名标签包含无效字符')
            }
        }

        // 格式校验（RFC兼容正则表达式）
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

        if (!emailRegex.test(str)) {
            return Verify.Error(Texts.IncorrectFormat.value)
        }

        // 特殊字符位置校验
        if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
            return Verify.Error('本地部分不能以点开头/结尾或连续出现两个点')
        }

        // 通过所有校验
        return Verify.OK()
    }
}