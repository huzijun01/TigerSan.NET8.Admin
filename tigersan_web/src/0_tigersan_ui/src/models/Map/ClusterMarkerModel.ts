export class ClusterMarkerModel<TData> {
    size = 0
    offset = 0
    /** 个数 */
    count = 0
    /** 总数 */
    totalCount = 0
    /** 数据 */
    data?: TData
    /** 点击时 */
    onClick?: (data: any) => any

    constructor(opts?: ClusterMarkerModelOptions<TData>) {
        if (!opts) return
        if (opts.count != undefined) this.count = opts.count
        if (opts.totalCount != undefined) this.totalCount = opts.totalCount
        if (opts.data != undefined) this.data = opts.data
        this.size = Math.round(30 + Math.pow(this.totalCount / this.count, 1 / 5) * 20)
        this.offset = -this.size / 2
    }
}

export type ClusterMarkerModelOptions<TData> = {
    /** 个数 */
    count?: number
    /** 总数 */
    totalCount?: number
    /** 数据 */
    data?: TData
    /** 点击时 */
    onClick?: (data: any) => any
}