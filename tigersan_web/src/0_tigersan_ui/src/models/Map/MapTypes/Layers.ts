/** 切片图层事件 */
export enum TileLayerEvent {
    /** 加载完成 */
    complete = 'complete',
}

declare global {
    namespace AMap {
        // 高德官方图层:
        /** 图层基类 */
        class LayerBase extends EventBase {
            /** 设置“图层参数” */
            setOptions(opts: LayerOptionsBase): void
            /** 获取“图层参数” */
            getOptions(): LayerOptionsBase

            /** 设置“Z轴层级” */
            setzIndex(zIndex: number): number
            /** 获取“Z轴层级” */
            getzIndex(): number

            /** 设置“透明度” */
            setOpacity(opacity: number): void
            /** 获取“透明度” */
            getOpacity(): number

            /** 设置“缩放范围” */
            setZooms(zooms: Vector2): void
            /** 获取“缩放范围” */
            getZooms(): Vector2

            /** 显示 */
            show(): void
            /** 隐藏 */
            hide(): void
            /** 销毁 */
            destroy(): void
        }

        /** 图层参数基类 */
        class LayerOptionsBase {
            /** 缩放范围。默认值：[2-30] */
            zooms?: Vector2
            /** 透明度。默认值：1 */
            opacity?: number
            /** 可见性。默认值：true */
            visible?: boolean
            /** Z轴层级。最底层为1，默认值：4 */
            zIndex?: number
            /** 切片大小。默认值：256 */
            tileSize?: number
        }

        /** 切片图层 */
        class TileLayer extends LayerBase {
            // Ctor:
            constructor(opts: TileLayerOptions)

            // Functions:
            /** 设置“图层参数” */
            setOptions(opts: TileLayerOptions): void
            /** 获取“图层参数” */
            getOptions(): TileLayerOptions
            /** 设置“取图地址” */
            setTileUrl(url: string): void
            /** 重新加载 */
            reload(): void
        }

        /** 切片图层参数 */
        class TileLayerOptions extends LayerOptionsBase {
            /** 取图地址 */
            tileUrl?: string
            /** 数据缩放范围。默认值：[2-30] */
            dataZooms?: Vector2
        }

        /** 交通图层 */
        class TrafficLayer extends LayerBase {
            // Ctor:
            constructor(opts: TrafficLayerOptions)

            // Functions:
            /** 设置“图层参数” */
            setOptions(opts: TrafficLayerOptions): void
            /** 获取“图层参数” */
            getOptions(): TrafficLayerOptions
            /** 停止自动更新 */
            stopFresh(): void
        }

        /** 交通图层参数 */
        class TrafficLayerOptions extends LayerOptionsBase {
            /** 是否自动更新数据。默认值：true */
            autoRefresh?: boolean
            /** 更新间隔（ms）。默认值：180 */
            interval?: number
        }

        /** 卫星图层 */
        class SatelliteLayer extends LayerBase {
            // Ctor:
            constructor(opts: LayerOptionsBase)
        }

        /** 路网图层 */
        class RoadNetLayer extends LayerBase {
            // Ctor:
            constructor(opts: LayerOptionsBase)
        }

        /** 建筑图层 */
        class BuildingLayer extends LayerBase {
            // Ctor:
            constructor(opts: BuildingLayerOptions)

            // Functions:
            /** 设置“图层参数” */
            setOptions(opts: BuildingLayerOptions): void
            /** 获取“图层参数” */
            getOptions(): BuildingLayerOptions
            /** 设置“取图地址” */
            setBuildingUrl(url: string): void
            /** 重新加载 */
            reload(): void
        }

        /** 建筑图层参数 */
        class BuildingLayerOptions extends LayerOptionsBase {
            /** 无切片大小 */
            tileSize?: undefined
            /** 侧面颜色 */
            wallColor?: Array<string> | string
            /** 顶面颜色 */
            roofColor?: Array<string> | string
            /** 高度系数因子。默认值：1 */
            heightFactor?: Vector2
            /** 顶面颜色 */
            styleOpts?: BuildingStyleOptions
        }

        /** 建筑样式参数 */
        class BuildingStyleOptions {
            /** 是否隐藏围栏之外的楼块 */
            hideWithoutStyle: boolean
            /** 围栏信息数组 */
            areas: Array<Area>
        }

        /** 区域 */
        class Area {
            /** 是否屏蔽自定义地图的纹理 */
            rejectTexture: boolean
            /** 可见性 */
            visible: boolean
            /** 围栏经纬度列表 */
            path: Array<Vector2>
            /** 围栏区域内楼块顶面颜色 */
            color1: Array<string> | string
            /** 围栏区域内楼块侧面颜色 */
            color2: Array<string> | string
        }

        /** 地区图层 */
        class DistrictLayer extends LayerBase {
            // Ctor:
            constructor(opts: DistrictLayerOptions)

            // Functions:
            /** 设置“图层参数” */
            setOptions(opts: DistrictLayerOptions): void
            /** 获取“图层参数” */
            getOptions(): DistrictLayerOptions

            /** 设置“国家代码” */
            setSOC(SOC: string): void
            /** 获取“国家代码” */
            getSOC(SOC: string): string

            /** 设置“区” */
            setDistricts(district: Array<any> | string | number): void
            /** 获取“区” */
            getDistricts(): any

            /** 设置“样式” */
            setStyles(styles: DistrictLayerStyle): void
            /** 获取“样式” */
            getStyles(): DistrictLayerStyle

            /** 设置“adcodes” */
            setAdcode(adcodes: Array<any> | string | number): void
            /** 获取“adcodes” */
            setAdcode(): any
        }

        /** 地区图层参数 */
        class DistrictLayerOptions extends LayerOptionsBase {
            /** 无切片大小 */
            tileSize?: undefined
            /** 行政区编码 */
            adcode?: string
            /** 国家代码。默认值：'CHN' */
            SOC?: string
            /** 数据层级深度。默认值：0（国=0、省=1、市=2） */
            depth?: number
            /** 顶面颜色 */
            styles?: DistrictLayerStyle
        }

        class DistrictLayerStyle {
            /** 描边线宽。默认值：1 */
            'stroke-width'?: number | (() => number)
            /** 区域层级。默认值：0 */
            zIndex?: number | (() => number)
            /** 海岸线颜色 */
            'coastline-stroke'?: Array<string> | string | (() => string)
            /** 国境线颜色 */
            'nation-stroke'?: Array<string> | string | (() => string)
            /** 省界颜色 */
            'province-stroke'?: Array<string> | string | (() => string)
            /** 城市界颜色 */
            'city-stroke'?: Array<string> | string | (() => string)
            /** 区/县界颜色 */
            'county-stroke'?: Array<string> | string | (() => string)
            /** 填充颜色 */
            'fill'?: Array<string> | string | (() => string)
        }

        /** 室内图层 */
        class IndoorMap extends LayerBase {
            // Ctor:
            constructor(opts: IndoorMapOptions)

            // Functions:
            /** 设置“图层参数” */
            setOptions(opts: IndoorMapOptions): void
            /** 获取“图层参数” */
            getOptions(): IndoorMapOptions
        }

        /** 室内图层参数 */
        class IndoorMapOptions {
            /** Z轴层级。最底层为1，默认值：4 */
            zIndex?: number
            /** 透明度。默认值：1 */
            opacity?: number
            /** 店铺面悬停时的光标样式 */
            cursor?: number
            /** 是否隐藏楼层切换控件。默认值：false */
            hideFloorBar?: number
        }
    }
}