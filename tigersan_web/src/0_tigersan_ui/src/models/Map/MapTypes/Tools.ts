export class PolygonEditorEvent {
    /** 添加节点 */
    static readonly addnode = 'addnode'
    /** 移除节点 */
    static readonly removenode = 'removenode'
    /** 调整 */
    static readonly adjust = 'adjust'
    /** 移动 */
    static readonly move = 'move'
    /** 添加 */
    static readonly add = 'add'
    /** 结束编辑 */
    static readonly end = 'end'
}

declare global {
    namespace AMap {
        /** 地图类型 */
        class MapType {
            constructor(opts?: MaptypeOptions)
        }

        /** “地图类型”配置 */
        type MaptypeOptions = {
            defaultType?: number
            showTraffic?: boolean
            showRoad?: boolean
        }

        /** “多边形编辑器” */
        class PolygonEditor extends EventBase {
            constructor(map: Map, polygon?: Polygon, opts?: PolygonEditorOptions)

            /** 开始编辑 */
            open(): void
            /** 结束编辑 */
            close(): void
            /** 设置“编辑对象” */
            setTarget(overlay?: Polygon): void
            /** 获取“编辑对象” */
            getTarget(): Polygon | undefined
            /** 设置“吸附多边形” */
            setAdsorbPolygons(list: Polygon | Polygon[]): void
            /** 添加“吸附多边形” */
            addAdsorbPolygons(list: Polygon | Polygon[]): void
            /** 添加“吸附多边形” */
            removeAdsorbPolygons(list: Polygon | Polygon[]): void
            /** 移除“吸附多边形” */
            clearAdsorbPolygons(): void
        }

        /** “多边形编辑器”配置 */
        type PolygonEditorOptions = {
            /** 样式 */
            createOptions?: object
            /** 编辑样式 */
            editOptions?: object
            /** 顶点样式 */
            controlPoint?: CircleMarkerOptions
            /** 中间点样式 */
            midControlPoint?: CircleMarkerOptions
        }

        /** “多边形编辑器”回调参数 */
        type PolygonEditorArgs = {
            target: Polygon
            lnglat: LngLat
            pixel: Pixel
        }

        /** “多边形编辑器”结束回调参数 */
        type PolygonEditorEndArgs = {
            target: Polygon
        }

        /** “多边形编辑器”回调 */
        type PolygonEditorCallback = {
            /** 添加节点 */
            addnode?: (args: PolygonEditorArgs) => any
            /** 移除节点 */
            removenode?: (args: PolygonEditorArgs) => any
            /** 调整 */
            adjust?: (args: PolygonEditorArgs) => any
            /** 移动 */
            move?: (args: PolygonEditorEndArgs) => any
            /** 添加 */
            add?: (args: PolygonEditorEndArgs) => any
            /** 结束编辑 */
            end?: (args: PolygonEditorEndArgs) => any
        }
    }
}
