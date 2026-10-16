/** 数据配置 */
export class DataOptions {
    lnglat: AMap.LngLatLike
    weight?: number

    constructor(lnglat: AMap.LngLatLike, weight?: number) {
        this.lnglat = lnglat
        this.weight = weight
    }
}

declare global {
    namespace AMap {
        /** 标记 */
        class Marker extends EventBase {
            // Ctor:
            constructor(opts?: MarkerOptions)

            // Function:
            /** 获取“” */
            getTitle(): string | undefined

            /** 获取“” */
            getIcon(): Icon | string | undefined
            /** 设置“” */
            setIcon(icon: Icon | string): void

            /** 获取“” */
            getLabel(): LabelOptions
            /** 获取“” */
            setLabel(opts: LabelOptions): void

            /** 获取“” */
            getClickable(): boolean
            /** 设置“” */
            setClickable(clickable: boolean): void

            /** 获取“” */
            getDraggable(): boolean
            /** 设置“” */
            setDraggable(draggable: boolean): void

            /** 获取“是否置顶” */
            getTop(): boolean
            /** 设置“是否置顶” */
            setTop(isTop: boolean): void

            /** 获取“光标” */
            getCursor(): string
            /** 设置“光标” */
            setCursor(cursor: string): void

            /** 获取“自定义数据” */
            getExtData(): any | undefined
            /** 设置“自定义数据” */
            setExtData(): void

            /** 移除点标记 */
            remove(): void
            /** 移动到 */
            moveTo(targetPosition: LngLatLike, opts: MoveToOptions): void
            /** 移动到 */
            moveAlong(path: Array<LngLat> | Array<Vector2> | Array<MoveAlongObj>, opts: MoveToOptions): void
            /** 开启动画 */
            startMove(): void
            /** 停止动画 */
            stopMove(): void
            /** 暂停动画 */
            pauseMove(): void
            /** 重启动画 */
            resumeMove(): void

            /** 获取“地图实例” */
            getMap(): Map | null
            /** 设置“地图实例” */
            setMap(map: Map | null): void

            /** 设置到“地图实例” */
            addTo(map: Map): void
            /** 添加到“地图实例” */
            add(map: Map): void

            /** 显示 */
            show(): void
            /** 隐藏 */
            hide(): void

            /** 获取“位置” */
            getPosition(): LngLat
            /** 设置“位置” */
            setPosition(position: LngLatLike): void

            /** 获取“锚点” */
            getAnchor(): string | Vector2 | undefined
            /** 设置“锚点” */
            setAnchor(anchor: string): void

            /** 获取“偏移” */
            getOffset(): Vector2 | Pixel | undefined | Array<number>
            /** 设置“偏移” */
            setOffset(offset: Vector2 | Pixel): void

            /** 获取“旋转角度” */
            getAngle(): number
            /** 设置“旋转角度” */
            setAngle(angle: boolean): number

            /** 获取“尺寸” */
            getSize(): number
            /** 设置“尺寸” */
            setSize(size: number): void

            /** 获取“Z轴层级” */
            getzIndex(): number
            /** 设置“Z轴层级” */
            setzIndex(zIndex: number): void

            /** 获取“自定义内容” */
            getContent(): string | HTMLElement | undefined
            /** 设置“自定义内容” */
            setContent(content: HTMLElement | string): void

            /** 获取“所有属性” */
            getOptions(): OverlayOptions

            /** 获取“范围” */
            getBounds(): boolean
        }

        /** “标记”配置 */
        type MarkerOptions = {
            /** 地图对象 */
            map?: Map
            /** 位置 */
            position?: Vector2 | LngLat
            /**  */
            icon?: Icon | string
            /**  */
            content?: string | HTMLElement
            /** 提示文字 */
            title?: string
            /** 可见性 */
            visible?: boolean
            /** Z轴层级 */
            zIndex?: number
            /** 偏移 */
            offset?: Vector2 | LngLat
            /** 锚点 */
            anchor?: string | Vector2
            /** 旋转角度 */
            angle?: number
            /** 是否可点击 */
            clickable?: boolean
            /** 是否“可拖拽” */
            draggable?: boolean
            /** 事件是否冒泡。默认值：false */
            bubble?: boolean
            /** 缩放范围。默认值：[2, 20]  */
            zooms?: Vector2
            /** 光标 */
            cursor?: string
            /** 点击时是否置顶。默认值：false */
            topWhenClick?: boolean
            /** 自定义数据 */
            extData?: any
            /** 文本样式（CSS样式对象） */
            style?: object
        }

        class OverlayOptions {

        }

        class MoveAlongObj {

        }

        class LabelOptions {

        }

        class MoveToOptions {

        }

        class Icon {
            /**  图标尺寸。默认值(36,36) */
            size: Size | Vector2
            /** 取图偏移 */
            imageOffset: Size | Vector2
            /** 取图地址 */
            image: string
            /** 图片大小 */
            imageSize: Size | Vector2
        }

        class DataCluster {

        }

        /** 标记聚合 */
        class MarkerCluster extends EventBase {
            /** 经纬度 */
            lnglat: Vector2
            /** 权重 */
            weight: number

            constructor(map: Map, dataOptions: DataOptions[], MarkerClusterOptions: MarkerClusterOptions)

            /** 添加“数据” */
            addData(dataOptions: DataOptions): void
            /** 设置“数据” */
            setData(dataOptions: DataOptions): void

            /** 获取“标记聚合总数” */
            getClustersCount(): number

            /** 获取“网格大小” */
            getGridSize(): number
            /** 设置“网格大小” */
            setGridSize(size: number): void

            /** 获取“最大聚合级别” */
            getMaxZoom(): number
            /** 设置“最大聚合级别” */
            setMaxZoom(zoom: number): void

            /** 获取“样式” */
            getStyles(): Array<Object>
            /** 设置“样式” */
            setStyles(styles: Array<Object>): void

            /** 获取“地图对象” */
            getMap(): Map
            /** 设置“地图对象” */
            setMap(Map: Map | null): void

            /** 获取“是否以中心点聚合” */
            isAverageCenter(): boolean
            /** 设置“是否以中心点聚” */
            setAverageCenter(averageCenter: boolean): void
        }

        /** “标记聚合”设置 */
        type MarkerClusterOptions = {
            /** 网格大小。默认值：60 */
            gridSize?: number
            /** 最大的聚合级别。默认值：18 */
            maxZoom?: number
            /** 是否以中心点聚合 */
            averageCenter?: boolean
            /** 缩放时是否聚合。默认值：false */
            clusterByZoomChange?: boolean
            /** 图标样式 */
            styles?: Array<Object>
            /** “标记聚合”渲染方法 */
            renderMarker?: (context: AMap.RenderMarkerObject) => any
            /** “标记聚合”渲染方法 */
            renderClusterMarker?: (context: AMap.RenderClusterMarkerObject) => any
        }

        /** “标记聚合”回调参数 */
        type MarkerClusterArgs = {
            /** 经纬度 */
            lnglat: LngLat
            /** 聚合 */
            cluster: DataCluster
            /** 聚合数据 */
            clusterData: DataOptions[]
            /** 标记 */
            marker: Marker
        }

        class RenderMarkerObject {
            data: DataOptions[]
            count: number
            indexs?: number[]
            marker: Marker
        }

        class RenderClusterMarkerObject {
            clusterData: DataOptions[]
            count: number
            indexs?: number[]
            marker: Marker
        }
    }
}