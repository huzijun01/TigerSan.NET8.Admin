export { }
declare global {
    namespace AMap {
        type SearchResult = {
            /** 成功状态说明 */
            info: string
            /** 建议关键字列表 */
            keywordList: string[]
            /** 建议关键字列表 */
            cityList: CityInfo[]
            /** 兴趣点列表 */
            poiList: PoiList
        }

        type CityInfo = {
            /** 建议城市名称 */
            name: string
            /** 城市编码 */
            citycode: string
            /** 行政区编码 */
            adcode: string
            /** 建议结果数目 */
            count: number
        }

        /** 兴趣点列表 */
        type PoiList = {
            /** 页码 */
            pageIndex: number
            /** 单页结果数 */
            pageSize: number
            /** 查询结果总数 */
            count: number
            /** Poi列表 */
            pois: POI[]
        }

        /** 兴趣点 */
        type POI = {
            /** ID */
            id: string
            /** 名称 */
            name: string
            /** 类型 */
            type: string
            /** 店铺信息 */
            shopinfo: string
            /** 经纬度 */
            location: LngLat
            /** 地址 */
            address: string
            /** 离中心点距离 */
            distance: string
            /** 电话 */
            tel: string
            /** 网址 */
            website: string
            /** 省份编码 */
            pcode: string
            /** 城市编码 */
            citycode: string
            /** 区域编码 */
            adcode: string
            /** 邮编 */
            postcode: string
            /** 省份 */
            pname: string
            /** 城市 */
            cityname: string
            /** 行政区 */
            adname: string
            /** 电子邮箱 */
            email: string
            /** 入口经纬度 */
            entr_location: LngLat
            /** 出口经纬度 */
            exit_location: LngLat
        }
    }
}