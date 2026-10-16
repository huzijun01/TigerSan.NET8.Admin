declare global {
    namespace AMap {
        /** 地图 */
        class Map extends EventBase {
            // Ctor:
            constructor(div: string | HTMLDivElement, opts: MapOptions)

            // Function:
            /** 居中 */
            center(): void
            /** 设置“中心点”
             * @param center - 中心点
             * @param immediately - 是否立即过渡到目标位置。默认值：false
             * @param duration - 过度时长（ms） */
            setCenter(
                center: Vector2 | LngLat,
                immediately?: boolean,
                duration?: number): void
            /** 获取“中心点” */
            getCenter(): LngLat

            /** 缩放 */
            zoom(): void
            /** 放大一级 */
            zoomIn(): void
            /** 缩小一级 */
            zoomOut(): void
            /** 获取“缩放级别”
             * @param digits - 缩放等级。默认值：2 */
            getZoom(digits?: number): number
            /** 设置“缩放等级”
             * @param zoom - 缩放等级。范围：[2, 30]
             * @param immediately - 是否立即过渡到目标位置。默认值：false
             * @param duration - 过度时长（ms） */
            setZoom(
                zoom: number,
                immediately?: boolean,
                duration?: number): void
            /** 获取“缩放等级范围” */
            getZooms(): Vector2
            /** 设置“缩放等级范围” */
            getZooms(zooms: Vector2): void
            /** 设置“缩放等级”和“中心点”
             * @param zoom - 缩放等级。范围：[2, 30]
             * @param center - 中心点
             * @param immediately - 是否立即过渡到目标位置。默认值：false
             * @param duration - 过度时长（ms） */
            setZoomAndCenter(
                zoom: number,
                center: Vector2 | LngLat,
                immediately?: boolean,
                duration?: number): void

            /** 获取“俯仰角” */
            getPitch(): number
            /** 设置“俯仰角”
             * @param pitch - 俯仰角
             * @param immediately - 是否立即过渡到目标位置。默认值：false
             * @param duration - 过度时长（ms） */
            setPitch(
                pitch: number,
                immediately?: boolean,
                duration?: number): void

            /** 获取“顺时针旋转角度”。范围: [0 ~ 360] */
            getRotation(): number
            /** 设置“顺时针旋转角度”
             * @param rotation - 旋转角度
             * @param immediately - 是否立即过渡到目标位置。默认值：false
             * @param duration - 过度时长（ms） */
            setRotation(
                rotation: number,
                immediately?: boolean,
                duration?: number): void

            /** 重新计算容器大小 */
            resize(): void
            /** 获取“容器尺寸” */
            getSize(): Size

            /** 添加“图层” */
            addLayer(layer: LayerBase): void
            /** 移除“图层” */
            removeLayer(layer: LayerBase): void
            /** 设置“图层” */
            setLayers(layers: Array<LayerBase>): void

            /** 平移至指定位置
                 * @param lnglat - 经纬度
                 * @param duration - 过度时长（ms） */
            panTo(
                lnglat: Vector2 | LngLat,
                duration?: number): void
            /** 平移至指定位置 
             * @param x - 横坐标
             * @param y - 纵坐标
             * @param duration - 过度时长（ms） */
            panBy(
                x: number,
                y: number,
                duration?: number): void

            /** 设置“状态” */
            setStatus(status: MapOptions): void

            /** 添加“覆盖物/图层” */
            add(features: Overlay | LayerBase | Array<Overlay | LayerBase>): void
            /** 移除“覆盖物/图层” */
            remove(features: Overlay | LayerBase | Array<Overlay | LayerBase>): void

            /** 获取“默认光标样式” */
            getDefaultCursor(): string
            /** 设置“默认光标样式” */
            setDefaultCursor(cursor: string): void

            /** 注销地图对象，并清空地图容器 */
            destroy(): void

            /** 获取“容器” */
            getContainer(): HTMLElement
            /** 获取“视图范围” */
            getBounds(): Bounds
            /** 设置“视图范围”
             * @param bounds - 视图范围
             * @param immediately - 是否立即过渡到目标位置。默认值：false
             * @param avoid - 内边距（上、下、左、右） */
            setBounds(
                bounds: Array<Vector2> | Bounds,
                immediately?: boolean,
                avoid?: [number, number, number, number]): void
            /** 获取“限制区域” */
            getLimitBounds(): Bounds
            /** 设置“限制区域” */
            setLimitBounds(bounds: Bounds): Bounds
            /** 清除“限制区域” */
            clearLimitBounds(): Bounds

            /** 获取“海拔高度” */
            getAltitude(lnglat: Vector2 | LngLat): number

            /** “经纬度”转“莫卡托坐标（单位：米）” */
            lngLatToCoords(lnglat: Vector2 | LngLat): Vector2
            /** “莫卡托坐标（单位：米）”转“经纬度” */
            coordsToLngLat(coords: Vector2): LngLat
            /** “经纬度”转“容器像素坐标” */
            lngLatToContainer(lnglat: Vector2 | LngLat): Pixel
            /** “容器像素坐标”转“经纬度” */
            containerToLngLat(pixel: Vector2 | Pixel): LngLat
            /** “莫卡托坐标（单位：米）”转“容器像素坐标” */
            coordToContainer(coords: Vector2): Pixel
            /** “容器像素坐标”转“莫卡托坐标（单位：米）” */
            containerToCoord(pixel: Vector2 | Pixel): Vector2
            /** 根据“容器像素坐标”获取“海拔高度” */
            getAltitudeByContainer(pixel: Vector2 | Pixel): number
            /** “容器像素坐标”转“经纬度” */
            pixelToLngLat(pixel: Vector2 | Pixel, zoom?: number): number
            /** “经纬度”转“容器像素坐标” */
            lngLatToPixel(lnglat: Vector2 | LngLat, zoom?: number): Pixel

            /** 获取“分辨率” */
            getResolution(): number
            /** 获取“比例尺” */
            getScale(dpi: number): number
            /** 获取“所在城市” */
            getCity(callback: (info: string) => any, lnglat?: Vector2 | LngLat): void
            /** 设置“所在城市”
             * @param cityName - 行政区名称或adcode */
            setCity(cityName: string): string

            /** 根据“覆盖物”分布自动缩放
             * @param overlays - 覆盖物
             * @param immediately - 是否立即过渡到目标位置。默认值：false
             * @param avoid - 内边距（上、下、左、右） 
             * @param maxZoom - 最大缩放级别 */
            setFitView(
                overlays: Array<Overlay>,
                immediately?: boolean,
                avoid?: [number, number, number, number],
                maxZoom?: number): void
            /** 根据“覆盖物”计算出合适的“缩放级别”和“中心点”
             * @param overlays - 覆盖物
             * @param immediately - 是否立即过渡到目标位置。默认值：false
             * @param avoid - 内边距（上、下、左、右） 
             * @param maxZoom - 最大缩放级别 */
            getFitZoomAndCenterByOverlays(
                overlays: Array<Overlay>,
                avoid?: [number, number, number, number],
                maxZoom?: number): [number, LngLat]
            /** 根据“矩形范围”计算出合适的“缩放级别”和“中心点”
             * @param bounds - 矩形范围
             * @param avoid - 内边距（上、下、左、右） 
             * @param maxZoom - 最大缩放级别 */
            getFitZoomAndCenterByBounds(
                bounds: Array<Vector2> | Bounds,
                avoid?: [number, number, number, number],
                maxZoom?: number): [number, LngLat]

            /** 添加“控件” */
            addControl(control: Control): void
            /** 移除“控件” */
            removeControl(control: Control): void

            /** 获取“地图样式” */
            getMapStyle(): string
            /** 设置“地图样式” */
            setMapStyle(value?: string): void

            /** 获取“覆盖物” */
            getAllOverlays(type?: ['marker' | 'circle' | 'polyline' | 'polygon']): Array<Overlay>
            /** 清空“覆盖物” */
            clearMap(): void
            /** 清空“信息窗体” */
            clearInfoWindow(): void
            /** 获取“元素种类” */
            getFeatures(): Array<'bg' | 'point' | 'road' | 'building'>
            /** 设置“元素种类” */
            setFeatures(features: Array<'bg' | 'point' | 'road' | 'building'>): void
            /**  */
            getMapApprovalNumber(): string
            /** 设置“掩模范围” */
            setMask(maskPath: Array<Vector2>): void
            /** 设置“是否拒绝掩模文字” */
            setLabelRejectMask(reject: boolean): void
        }

        // 地图:

        /** 初始化参数 */
        class MapOptions {
            /** 中心经纬度 */
            center?: Vector2 | LngLat
            /** 缩放级别 */
            zoom?: number
            /** 顺时针旋转的角度。取值范围 [0-360] ，默认值：0 */
            rotation?: number
            /** 仰角度（2D下无效）。默认值：0，最大值随zoom不断增大 */
            pitch?: number
            /** 视图模式 */
            viewMode?: '2D' | '3D'
            /** 是否展示地形（2D下无效）。默认值：false  */
            terrain?: boolean
            /** 元素种类。默认值：['bg','point','road','building'] */
            features?: Array<'bg' | 'point' | 'road' | 'building'>
            /**  */
            layers?: Array<LayerBase>
            /** 缩放范围。取值范围 [2 ~ 26] */
            zooms?: Vector2
            /** 拖拽使能。默认值：true  */
            dragEnable?: boolean
            /** 缩放使能。默认值：true  */
            zoomEnable?: boolean
            /** 缓动使能。默认值：true  */
            jogEnable?: boolean
            /** 俯仰使能（2D下无效）。默认值：true  */
            pitchEnable?: boolean
            /** 旋转使能。默认值：true  */
            rotateEnable?: boolean
            /** 动画使能。默认值：true  */
            animateEnable?: boolean
            /** 键盘使能。默认值：true  */
            keyboardEnable?: boolean
            /** 双击放大使能。默认值：true */
            doubleClickZoom?: boolean
            /** 滚轮缩放使能。默认值：true */
            scrollWheel?: boolean
            /** 触控缩放使能。默认值：true */
            touchZoom?: boolean
            /** 触控缩放是否以地图中心为中心。默认值：true */
            touchZoomCenter?: boolean
            /** 是否展示地图文字和 POI 信息。默认值：true */
            showLabel?: boolean
            /** 默认光标样式 */
            defaultCursor?: string
            /** 是否开启地图热点和标注的 hover 效果。PC端默认是 true , 移动端默认是 false  */
            isHotspot?: boolean
            /** 地图样式 */
            mapStyle?: string
            /** 地图楼块的侧面颜色 */
            wallColor?: string | Array<string>
            /** 地图楼块的顶面颜色 */
            roofColor?: string | Array<string>
            /** 是否展示地图 3D 楼块。默认值：true */
            showBuildingBlock?: boolean
            /** 是否自动展示室内地图。默认值：false  */
            showIndoorMap?: boolean
            /** 天空颜色 */
            skyColor?: string | Array<string>
            /** 文字是否拒绝掩模图层进行掩模。默认值：false */
            labelRejectMask?: boolean
            /** 掩模路径（2D下无效） */
            mask?: Array<Vector2>
            /** 额外配置的 WebGL 参数 */
            WebGLParams?: object
        }

        /** 覆盖物 */
        class Overlay extends EventBase {

        }

        /** 控件 */
        class Control {

        }
    }
}

/** 地图样式 */
export enum MapStyle {
    normal = 'amap://styles/normal',
    grey = 'amap://styles/grey',
    whitesmoke = 'amap://styles/whitesmoke',
    dark = 'amap://styles/dark',
    light = 'amap://styles/light',
    graffiti = 'amap://styles/graffiti',
}