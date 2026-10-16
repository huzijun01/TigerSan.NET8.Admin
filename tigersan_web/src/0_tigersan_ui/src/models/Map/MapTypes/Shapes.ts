export { }
declare global {
    namespace AMap {
        /** “多边形”路径 */
        type PolygonPath = LngLat[] | LngLat[][] | LngLat[][][]

        /** 多边形 */
        class Polygon extends EventBase {
            // Ctor:
            constructor(opts?: PolygonOptions)

            // Function:
            /** 隐藏 */
            hide(): void
            /** 显示 */
            show(): void
            /** 销毁 */
            destroy(): void
            /** 是否“包含” */
            contains(point: LngLatLike): boolean

            /** 获取“自定义数据” */
            getExtData(): object
            /** 设置“自定义数据” */
            setExtData(extData: object): void

            /** 获取“配置” */
            getOptions(): PolygonOptions
            /** 设置“配置” */
            setOptions(opts: PolygonOptions): void

            /** 获取“路径” */
            getPath(): PolygonPath
            /** 设置“路径” */
            setPath(path: PolygonPath): void

            /** 获取“高度” */
            getExtrusionHeight(): number
            /** 设置“高度” */
            setExtrusionHeight(extrusionHeight: number): void

            /** 获取“范围” */
            getBounds(): Bounds
            /** 获取“面积”（米）
             * @param isTerrain - 是否基于地形。默认值：false */
            getArea(isTerrain: boolean): number

            /** 获取“海拔高度” */
            getPlaneHeight(): number
            /** 设置“海拔高度” */
            setPlaneHeight(height: number): void
        }

        /** “多边形”配置 */
        type PolygonOptions = {
            /** 路径（普通多边形 | 单个带孔多边形 | 多个带孔多边形） */
            path?: PolygonPath
            /** Z轴层级。默认值：10 */
            zIndex?: number
            /** 是否“冒泡”。默认值：false */
            bubble?: boolean
            /** 光标样式 */
            cursor?: string
            /** 线条颜色。默认值：#00D3FC */
            strokeColor?: string
            /** 线条透明度。默认值：0.9 */
            strokeOpacity?: number
            /** 填充色 */
            fillColor?: string
            /** 填充透明度 */
            fillOpacity?: number
            /** 是否“可拖动”。默认值：false */
            draggable?: boolean
            /** 海拔高度。默认值：0 */
            height?: number
            /** 高度。默认值：0 */
            extrusionHeight?: number
            /** 侧面颜色 */
            wallColor?: string
            /** 顶面颜色 */
            roofColor?: string
            /** 自定义数据 */
            extData?: object
            /** 线条样式。默认值：solid */
            strokeStyle?: 'solid' | 'dashed'
            /** 虚线间隙数组 */
            strokeDasharray?: [number, number] | [number, number, number]
        }

        /** “多边形”路径 */
        type PolylinePath = LngLat[] | LngLat[][]

        /** 折线 */
        class Polyline extends EventBase {
            // Ctor:
            constructor(opts?: PolylineOptions)

            // Function:
            /** 隐藏 */
            hide(): void
            /** 显示 */
            show(): void
            /** 销毁 */
            destroy(): void
            /** 是否“包含” */
            contains(point: LngLatLike): boolean

            /** 获取“自定义数据” */
            getExtData(): object
            /** 设置“自定义数据” */
            setExtData(extData: object): void

            /** 获取“配置” */
            getOptions(): PolylineOptions
            /** 设置“配置” */
            setOptions(opts: PolylineOptions): void

            /** 获取“路径” */
            getPath(): PolylinePath
            /** 设置“路径” */
            setPath(path: PolylinePath): void

            /** 获取“范围” */
            getBounds(): Bounds | undefined
            /** 移动 */
            moveWithPos(dx: number, dy: number): void
            /** 获取“折线总长度”。（单位：米） */
            getLength(): number
            /** 获取“终点距离”。（单位：米） */
            getEndDistance(): number
            /** 生成缓冲区 */
            generateBuffer(gl: number): void
            /** 获取“海拔高度” */
            getPolylineHeight(): number
        }

        /** “折线”配置 */
        type PolylineOptions = {
            /** 地图实例 */
            map?: Map
            /** 路径。（支持 lineString 和 MultiLineString） */
            path?: PolylinePath
            /** Z轴层级。默认值：10 */
            zIndex?: number
            /** 是否“冒泡”。默认值：false */
            bubble?: boolean
            /** 光标样式 */
            cursor?: string
            /** 线条颜色。默认值：#00D3FC */
            strokeColor?: string
            /** 线条透明度。默认值：0.9 */
            strokeOpacity?: number
            /** 线条宽度。默认值：2 */
            strokeWeight?: number
            /** 是否“描边”。默认值：false */
            isOutline?: boolean
            /** 描边宽度。默认值：1 */
            borderWeight?: number
            /** 描边颜色。默认值：#00B2D5 */
            outlineColor?: string
            /** 是否“可拖拽” */
            draggable?: boolean
            /** 海拔高度。默认值：0 */
            height?: number
            /** 自定义数据 */
            extData?: object
            /** 线条样式。默认值：solid */
            strokeStyle?: 'solid' | 'dashed'
            /** 虚线间隙数组 */
            strokeDasharray?: [number, number] | [number, number, number]
            /** 拐点样式。默认值：solid */
            lineJoin?: 'miter' | 'round' | 'bevel'
            /** 线帽样式。默认值：butt */
            lineCap?: 'butt' | 'round' | 'square'
            /** 是否“绘制为大地线”。默认值：false */
            geodesic?: boolean
            /** 是否“显示方向”。默认值：false  */
            showDir?: boolean
        }

        /** 贝塞尔曲线 */
        class BezierCurve extends EventBase {
            // Ctor:
            constructor(opts?: BezierCurveOptions)

            // Function:
        }

        /** “贝塞尔曲线”配置 */
        type BezierCurveOptions = {
        }

        /** 圆 */
        class Circle extends EventBase {
            // Ctor:
            constructor(opts?: CircleOptions)

            // Function:
        }

        /** “圆”配置 */
        type CircleOptions = {
        }

        /** 圆标记 */
        class CircleMarker extends EventBase {
            // Ctor:
            constructor(opts?: CircleMarkerOptions)

            // Function:
        }

        /** “圆标记”配置 */
        type CircleMarkerOptions = {
        }

        /** 椭圆 */
        class Ellipse extends EventBase {
            // Ctor:
            constructor(opts?: EllipseOptions)

            // Function:
        }

        /** “椭圆”配置 */
        type EllipseOptions = {
        }

        /** 矩形 */
        class Rectangle extends EventBase {
            // Ctor:
            constructor(opts?: RectangleOptions)

            // Function:
        }

        /** “矩形”配置 */
        type RectangleOptions = {
        }

        /** GeoJSON */
        class GeoJSON extends EventBase {
            // Ctor:
            constructor(opts?: GeoJSONOptions)

            // Function:
        }

        /** “GeoJSON”配置 */
        type GeoJSONOptions = {
        }
    }
}
