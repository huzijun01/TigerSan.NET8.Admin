export { }
declare global {
    namespace AMap {
        /** 地址查询 */
        class PlaceSearch extends EventBase {
            constructor(opts?: PlaceSearchOptions)

            PlaceSearch(pluginName: string, callback: Function): void
            /** 绑定回调 */
            on(
                type: string,
                callback: (res: SearchResult) => any,
                context?: object,
                once?: boolean): void
            /** 绑定回调 */
            off(
                type: string,
                callback: (res: SearchResult) => any,
                context?: object): void
            /** 搜索 */
            search(keyword: string, callback?: (res: SearchResult) => any): void
            /** 范围搜索 */
            searchInBounds(keyword: string, bounds: Bounds, callback?: (res: SearchResult) => any): void
            /** 中心点搜索 */
            searchNearBy(keyword: string, center: LngLat, radius: number, callback?: (res: SearchResult) => any): void
            /** 中心点搜索 */
            getDetails(PGUID: string, callback?: (res: SearchResult) => any): void
            /** 设置“查询类别” */
            setType(type: string): void
            /** 设置“页码” */
            setPageIndex(pageIndex: number): void
            /** 设置“单页数量” */
            setPageSize(pageSize: number): void
            /** 设置“查询城市” */
            setCity(city: string): void
            /** 设置“是否强制限制城市” */
            setCityLimit(citylimit: boolean): void
            /** 唤起高德地图客户端marker页 Object 参数 */
            poiOnAMAP(p: string, opts: object): void
            /** 唤起高德地图客户端POI详情页 Object 参数 */
            detailOnAMAP(p: string, opts: object): void
        }

        type PlaceSearchOptions = {
            /** 城市 */
            city?: string,
            /** 数据类别 */
            type?: string, //
            /** 每页结果数。默认值：10 */
            pageSize?: number,
            /** 请求页码。默认值：1 */
            pageIndex?: number,
            /** 返回信息详略。默认值：'base'（基本信息） */
            extensions?: string
        }
    }
}
