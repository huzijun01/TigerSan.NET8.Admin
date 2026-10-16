/** “过滤器”对象 */
export class FilterDto {
    /** 父表 */
    parent?: ParentFilter
    /** “过滤器”集合 */
    filters?: PropFilter[]
}

/** “属性”过滤器 */
export class PropFilter {
    /** 属性名 */
    propName = ''
    /** 是否“为null” */
    isNull?: boolean
    /** 是否“为null或空” */
    isNullOrEmpty?: boolean
    /** 是否“模糊查询” */
    isFuzzy?: boolean
    /** 值 */
    value?: unknown
    /** 值集合 */
    values?: unknown[] = []

    constructor(propName: string = '',
        value?: unknown,
        values?: unknown[]) {
        this.propName = propName
        this.value = value
        this.values = values
    }
}

/** “父表”过滤器 */
export class ParentFilter {
    /** ID */
    id?: bigint
    /** ID集合 */
    ids?: bigint[] = []
    /** 父表 */
    parent?: ParentFilter
}