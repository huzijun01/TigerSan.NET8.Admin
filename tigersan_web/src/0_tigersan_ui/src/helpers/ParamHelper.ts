export class KeyValueModel {
    key: string = ''
    value?: boolean | string | number | bigint | Date = ''
}

export class ParamHelper {
    static IsNotEmpty(value?: boolean | string | number | bigint | Date) {
        return value != undefined && value != null && value.toString().trim() != ''
    }

    static GetParamString(params: KeyValueModel[]): string {
        if (params.length === 0) return ''

        const queryParts: string[] = []
        params.forEach(param => {
            if (this.IsNotEmpty(param.key) && this.IsNotEmpty(param.value)) {
                if (param.value === undefined || param.value === null) {
                    console.warn('The value is undefined!')
                    return
                }
                const encodedKey = encodeURIComponent(param.key)
                const encodedValue = encodeURIComponent(param.value.toString())
                queryParts.push(`${encodedKey}=${encodedValue}`)
            }
        })

        return queryParts.length < 1 ? '' : `?${queryParts.join('&')}`
    }
}