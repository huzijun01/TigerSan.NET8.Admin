import "./MapTypes"
import AMapLoader from "@amap/amap-jsapi-loader"
import Marker from '../../components/Map/Marker.vue'
import ClusterMarker from '../../components/Map/ClusterMarker.vue'
import { computed, ref, shallowRef, type Component } from "vue"
import { Texts } from "../../texts"
import type { ActionAsync } from "../../types"
import { MapPlugins } from "./MapTypes/MapPlugins"
import { SelectModel } from "../Inputs/SelectModel"
import { ClusterMarkerModel } from "./ClusterMarkerModel"
import { MarkerModel, MarkerModes, MarkerIconOptions } from "./MarkerModel"
import { MapEvents, DataOptions, MapStyle, PolygonEditorEvent, ClassNames } from "./MapTypes"
import { ArrayHelper, ComponentHelper, MathHelper, Point2, ThemeHelper, WatchBehavior } from "../../helpers"

/** “经纬度数据”模型 */
export class LnglatData<TData, TInfoModel> {
    lnglat: AMap.LngLatLike
    data?: TData
    info?: Component
    infoModel?: TInfoModel

    constructor(
        lnglat: AMap.LngLatLike,
        data?: TData,
        info?: Component,
        infoModel?: TInfoModel) {
        this.lnglat = lnglat
        this.data = data
        this.info = info
        this.infoModel = infoModel
    }
}

/** “地图”模型 */
export class MapModel<TData, TInfoModel> {
    //#region 【Fields】
    /** 标记 */
    private _marker?: AMap.Marker
    /** 图标（标记聚合） */
    _icon?: MarkerIconOptions
    /** 获取图标（标记聚合，优先使用方法） */
    _getIcon?: (data: LnglatData<TData, TInfoModel>) => MarkerIconOptions
    /** 是否“自动初始化” */
    _isAutoInit = true
    /** 是否“显示地图类型” */
    _isShowMapType = true
    /** 应用秘钥 */
    static _appKey: string = ''
    /** “插件”集合 */
    static _plugins?: string[]
    /** “标记”集合 */
    readonly _markers: AMap.Marker[] = []
    /** “标记数据”映射 */
    readonly _markerDataMap = new Map<DataOptions, LnglatData<TData, TInfoModel>>()
    /** “标记模型”集合 */
    readonly _markerModels: MarkerModel<LnglatData<TData, TInfoModel>, TInfoModel>[] = []
    /** “主题”监听器 */
    readonly _watchIsDark = new WatchBehavior(ThemeHelper.IsDark, () => this.UpdateMapStyle())
    /** 地图实例 */
    _map?: AMap.Map
    /** 配置 */
    _opts?: AMap.MapOptions
    /** 地图类型 */
    _mapType?: AMap.MapType
    /** 标记聚合 */
    _cluster?: AMap.MarkerCluster
    /** 地址查询 */
    _placeSearch?: AMap.PlaceSearch
    /** 轨迹 */
    _polyline?: AMap.Polyline
    /** 多边形编辑器 */
    _polygonEditor?: AMap.PolygonEditor
    /** 初始化前 */
    _beforeInit?: Function
    /** 初始化前（异步） */
    _beforeInitAsync?: ActionAsync
    /** 初始化后 */
    _onInit?: Function
    /** 初始化后（异步） */
    _onInitAsync?: ActionAsync
    /** 点击“标记”后 */
    _onMarkerClick?: (data?: LnglatData<TData, TInfoModel>) => any
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否“正在新建” */
    private readonly _IsCreating = ref(false)
    /** 是否“正在编辑” */
    private readonly _IsEditing = ref(false)
    /** “多边形”个数 */
    private readonly _PolygonCount = ref(0)
    /** “地址”选择器 */
    readonly SelectAddr: SelectModel<AMap.POI>
    /** 地图容器 */
    readonly refContainer = shallowRef<HTMLDivElement>()
    /** 是否“显示选择框” */
    readonly IsShowSelect = ref(true)
    /** 是否“显示按钮” */
    readonly IsShowButton = ref(true)
    /** 是否“允许创建多个多边形” */
    readonly IsAllowMultiPolygon = ref(true)
    /** 是否“正在新建” */
    readonly IsCreating = computed(() => { return this._IsCreating.value })
    /** 是否“允许创建” */
    readonly IsAllowCreate = computed(() => !this._IsCreating.value && (this.IsAllowMultiPolygon.value || this._PolygonCount.value < 1))
    /** 是否“正在编辑” */
    readonly IsEditing = computed(() => { return this._IsEditing.value })
    /** “多边形”个数 */
    readonly PolygonCount = computed(() => { return this._PolygonCount.value })
    /** 是否有“多边形” */
    readonly HasPolygon = computed(() => { return this._PolygonCount.value > 0 })
    //#endregion 【Ctor】

    //#region 【Ctor】
    constructor(opts?: AMap.MapOptions) {
        this._opts = opts
        this.SelectAddr = this.GetAddrSelect()
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    //#region [static]
    /** 加载地图组件 */
    static async LoadAsync(
        secretKey: string,
        appKey: string,
        plugins?: string[]) {
        MapModel._appKey = appKey
        MapModel._plugins = plugins
        window._AMapSecurityConfig = { securityJsCode: secretKey }
        await AMapLoader.load({
            key: MapModel._appKey,
            version: "2.0",
            plugins: MapModel._plugins
        }).catch((e) => {
            console.error(e)
        })
    }

    /** 获取“标记”集合 */
    static GetMarkers(points: AMap.LngLatLike[]): DataOptions[] {
        const markers: DataOptions[] = []

        points.forEach(point => {
            markers.push(new DataOptions(point))
        })

        return markers
    }

    /** 加载插件 */
    static async LoadPluginAsync(pluginNames: MapPlugins[], callback?: Function): Promise<boolean> {
        if (!MapModel._plugins) {
            MapModel._plugins = []
        }

        for (let index = 0; index < pluginNames.length; index++) {
            const pluginName = pluginNames[index] as string

            if (MapModel._plugins.includes(pluginName)) {
                callback?.()
                continue
            }

            try {
                await new Promise<void>((resolve, reject) => {
                    AMap.plugin(pluginName, () => {
                        resolve()
                    })
                })

                MapModel._plugins.push(pluginName)
                callback?.()
            } catch (error) {
                console.error(`Failed to load plugin "${pluginName}":`, error)
                return false
            }
        }

        return true
    }

    /** 获取"缩放比例" */
    static GetZoom(shopinfo: string): number {
        if (shopinfo === '2') return 10 // 大型设施（城市、机场、火车站）
        if (shopinfo === '1') return 15 // 中型设施（影院等）
        if (shopinfo === '0') return 20 // 省级地名，大范围
        else return 10 // 省级地名，大范围
    }

    /** 获取"地址查询" */
    static async GetPlaceSearchAsync(callback?: (res: AMap.SearchResult) => any) {
        if (!await MapModel.LoadPluginAsync([MapPlugins.PlaceSearch])) return undefined

        const placeSearch = new AMap.PlaceSearch({})
        if (callback) {
            placeSearch.on('complete', callback)
            placeSearch.on('error', callback)
        }

        return placeSearch
    }

    /** 获取"范围" */
    static GetBounds(lnglats: AMap.LngLat[]): AMap.Bounds | undefined {
        if (lnglats.length < 1) return undefined
        const lngs = lnglats.map(i => i.lng)
        const lats = lnglats.map(i => i.lat)
        const minLng = Math.min(...lngs)
        const maxLng = Math.max(...lngs)
        const minLat = Math.min(...lats)
        const maxLat = Math.max(...lats)
        const southWest = new AMap.LngLat(minLng, minLat)
        const northEast = new AMap.LngLat(maxLng, maxLat)
        return new AMap.Bounds(southWest, northEast)
    }

    /** 渲染“标记” */
    readonly RenderMarker = (context: AMap.RenderMarkerObject, map: MapModel<any, any>) => {
        const model = new MarkerModel<LnglatData<TData, TInfoModel>, TInfoModel>()
        const cd = context.data[0]
        if (cd) {
            const data = map._markerDataMap.get(cd)
            if (data) {
                const icon = this._getIcon ? this._getIcon(data) : this._icon
                model.icon = icon?.icon
                model.iconStyle = icon?.iconStyle
                model.data = data
                model.info = data.info
                model.infoModel = data.infoModel
                model.onClick = map._onMarkerClick
            }
        }

        const marker = ComponentHelper.GetElement(Marker, { model })
        if (!marker) {
            console.warn('The marker is undefined!')
            return
        }
        context.marker.setOffset(new AMap.Pixel(MarkerModel.offset, MarkerModel.offset))
        context.marker.setContent(marker as HTMLElement)
    }

    /** 渲染“标记聚合” */
    static RenderClusterMarker(context: AMap.RenderClusterMarkerObject, totalCount: number) {
        const model = new ClusterMarkerModel({
            count: context.count,
            totalCount: totalCount
        })
        const marker = ComponentHelper.GetElement(ClusterMarker, { model })
        if (!marker) {
            console.warn('The marker is undefined!')
            return
        }
        context.marker.setOffset(new AMap.Pixel(model.offset, model.offset))
        context.marker.setContent(marker as HTMLElement)
    }

    /** 添加“事件” */
    static AddEvent(obj: AMap.EventBase, callback?: AMap.MapCallback) {
        if (!callback) return
        if (callback.add) obj.on(MapEvents.add, callback.add)
        if (callback.resize) obj.on(MapEvents.resize, callback.resize)
        if (callback.complete) obj.on(MapEvents.complete, callback.complete)
        if (callback.click) obj.on(MapEvents.click, callback.click)
        if (callback.dblclick) obj.on(MapEvents.dblclick, callback.dblclick)
        if (callback.mapmove) obj.on(MapEvents.mapmove, callback.mapmove)
        if (callback.hotspotclick) obj.on(MapEvents.hotspotclick, callback.hotspotclick)
        if (callback.hotspotover) obj.on(MapEvents.hotspotover, callback.hotspotover)
        if (callback.hotspotout) obj.on(MapEvents.hotspotout, callback.hotspotout)
        if (callback.movestart) obj.on(MapEvents.movestart, callback.movestart)
        if (callback.moveend) obj.on(MapEvents.moveend, callback.moveend)
        if (callback.zoomchange) obj.on(MapEvents.zoomchange, callback.zoomchange)
        if (callback.zoomstart) obj.on(MapEvents.zoomstart, callback.zoomstart)
        if (callback.zoomend) obj.on(MapEvents.zoomend, callback.zoomend)
        if (callback.rotatechange) obj.on(MapEvents.rotatechange, callback.rotatechange)
        if (callback.rotatestart) obj.on(MapEvents.rotatestart, callback.rotatestart)
        if (callback.rotateend) obj.on(MapEvents.rotateend, callback.rotateend)
        if (callback.mousemove) obj.on(MapEvents.mousemove, callback.mousemove)
        if (callback.mousewheel) obj.on(MapEvents.mousewheel, callback.mousewheel)
        if (callback.mouseover) obj.on(MapEvents.mouseover, callback.mouseover)
        if (callback.mouseout) obj.on(MapEvents.mouseout, callback.mouseout)
        if (callback.mouseup) obj.on(MapEvents.mouseup, callback.mouseup)
        if (callback.mousedown) obj.on(MapEvents.mousedown, callback.mousedown)
        if (callback.rightclick) obj.on(MapEvents.rightclick, callback.rightclick)
        if (callback.dragstart) obj.on(MapEvents.dragstart, callback.dragstart)
        if (callback.dragging) obj.on(MapEvents.dragging, callback.dragging)
        if (callback.dragend) obj.on(MapEvents.dragend, callback.dragend)
        if (callback.touchstart) obj.on(MapEvents.touchstart, callback.touchstart)
        if (callback.touchmove) obj.on(MapEvents.touchmove, callback.touchmove)
        if (callback.touchend) obj.on(MapEvents.touchend, callback.touchend)
    }

    /** 移除“事件” */
    static RemoveEvent(obj: AMap.EventBase, callback?: AMap.MapCallback) {
        if (!callback) return
        if (callback.add) obj.off(MapEvents.add, callback.add)
        if (callback.resize) obj.off(MapEvents.resize, callback.resize)
        if (callback.complete) obj.off(MapEvents.complete, callback.complete)
        if (callback.click) obj.off(MapEvents.click, callback.click)
        if (callback.dblclick) obj.off(MapEvents.dblclick, callback.dblclick)
        if (callback.mapmove) obj.off(MapEvents.mapmove, callback.mapmove)
        if (callback.hotspotclick) obj.off(MapEvents.hotspotclick, callback.hotspotclick)
        if (callback.hotspotover) obj.off(MapEvents.hotspotover, callback.hotspotover)
        if (callback.hotspotout) obj.off(MapEvents.hotspotout, callback.hotspotout)
        if (callback.movestart) obj.off(MapEvents.movestart, callback.movestart)
        if (callback.moveend) obj.off(MapEvents.moveend, callback.moveend)
        if (callback.zoomchange) obj.off(MapEvents.zoomchange, callback.zoomchange)
        if (callback.zoomstart) obj.off(MapEvents.zoomstart, callback.zoomstart)
        if (callback.zoomend) obj.off(MapEvents.zoomend, callback.zoomend)
        if (callback.rotatechange) obj.off(MapEvents.rotatechange, callback.rotatechange)
        if (callback.rotatestart) obj.off(MapEvents.rotatestart, callback.rotatestart)
        if (callback.rotateend) obj.off(MapEvents.rotateend, callback.rotateend)
        if (callback.mousemove) obj.off(MapEvents.mousemove, callback.mousemove)
        if (callback.mousewheel) obj.off(MapEvents.mousewheel, callback.mousewheel)
        if (callback.mouseover) obj.off(MapEvents.mouseover, callback.mouseover)
        if (callback.mouseout) obj.off(MapEvents.mouseout, callback.mouseout)
        if (callback.mouseup) obj.off(MapEvents.mouseup, callback.mouseup)
        if (callback.mousedown) obj.off(MapEvents.mousedown, callback.mousedown)
        if (callback.rightclick) obj.off(MapEvents.rightclick, callback.rightclick)
        if (callback.dragstart) obj.off(MapEvents.dragstart, callback.dragstart)
        if (callback.dragging) obj.off(MapEvents.dragging, callback.dragging)
        if (callback.dragend) obj.off(MapEvents.dragend, callback.dragend)
        if (callback.touchstart) obj.off(MapEvents.touchstart, callback.touchstart)
        if (callback.touchmove) obj.off(MapEvents.touchmove, callback.touchmove)
        if (callback.touchend) obj.off(MapEvents.touchend, callback.touchend)
    }

    /** 根据“点集合”获取"路径" */
    static GetPathByPoints(points: Point2[]): AMap.Vector2[] {
        return points.map(p => [p.x, p.y])
    }

    /** 获取"路径"字符串 */
    static GetPathString(path: AMap.Vector2[]): string | undefined {
        return MathHelper.GetPathString(path.map(p => new Point2(p[0], p[1])))
    }

    /** 获取"路径"字符串 */
    static GetPathStringByPolygon(polygon?: AMap.Polygon): string | undefined {
        if (!polygon) return
        const lngLats = MapModel.PolygonsToPath<AMap.LngLat[]>(polygon)
        const path = lngLats.map(p => new Point2(p.lng, p.lat))
        return MathHelper.GetPathString(path)
    }
    //#endregion [static]

    //#region [Map]
    /** 初始化 */
    readonly InitAsync = async (opts?: AMap.MapOptions) => {
        if (!window.AMap) {
            console.warn('The AMap has not been loaded. Please call LoadAsync first!')
            return
        }

        if (!this.refContainer.value) {
            console.warn('The refContainer is undefined!')
            return
        }

        this.Destroy()
        this._beforeInit?.()
        await this._beforeInitAsync?.()

        if (opts) this._opts = opts

        const opts1: AMap.MapOptions = {
            center: [106.0, 37.6],
            zoom: 4.7,
            ...this._opts
        }

        if (!opts1.mapStyle) {
            opts1.mapStyle = ThemeHelper.IsDark.value ? MapStyle.grey : undefined
        }

        this._map = new AMap.Map(this.refContainer.value, opts1)
        if (this._isShowMapType) await this.InitMapType()

        this._onInit?.()
        await this._onInitAsync?.()
        this._watchIsDark.Start()
    }

    /** 销毁 */
    readonly Destroy = () => {
        // 停止主题监听器
        this._watchIsDark.Stop()

        // 移除所有自定义事件监听
        this.RemoveEvent()
        this.RemoveMapType()

        // 清空所有覆盖物与图层
        this.RemoveMarker()
        this.ClearMarkers()
        this.ClearCluster()
        this.ClearOverlays(ClassNames.Polygon)
        this.ClearOverlays(ClassNames.Polyline)

        // 销毁地图实例
        this._map?.destroy()
        this._map = undefined
        this._mapType = undefined

        // 重置状态标记
        this._cluster = undefined
        this._polyline = undefined
        this._placeSearch = undefined
        this._polygonEditor = undefined
        this._markers.splice(0)
        this._markerModels.splice(0)
        this._PolygonCount.value = 0
        this._IsEditing.value = false
        this._IsCreating.value = false
    }

    /** 更新"地图样式" */
    readonly UpdateMapStyle = () => {
        if (!this._map) return
        if (this._opts && this._opts.mapStyle) {
            this._map.setMapStyle(this._opts.mapStyle)
            return
        }

        this._map.setMapStyle(ThemeHelper.IsDark.value ? MapStyle.grey : MapStyle.normal)
    }

    /** 添加“覆盖物/图层” */
    readonly Add = (features: AMap.Overlay | AMap.LayerBase | Array<AMap.Overlay | AMap.LayerBase>, opts?: AMap.MapCallback) => {
        if (!this._map) {
            console.warn('The _map is undefined!')
            return
        }

        this._map.add(features)

        if (!opts) return
        if (features instanceof Array) {
            features.forEach(f => MapModel.AddEvent(f, opts))
        }
        else {
            MapModel.AddEvent(features, opts)
        }
    }

    /** 移除“覆盖物/图层” */
    readonly Remove = (features: AMap.Overlay | AMap.LayerBase | Array<AMap.Overlay | AMap.LayerBase>) => {
        if (!this._map) {
            console.warn('The _map is undefined!')
            return
        }

        this._map.remove(features)
        this.UpdatePolygonCount()
    }

    /** 添加“事件” */
    readonly AddEvent = (opts?: AMap.MapCallback) => {
        if (!this._map) {
            console.warn('The _map is undefined!')
            return
        }

        MapModel.AddEvent(this._map, opts)
    }

    /** 移除“事件” */
    readonly RemoveEvent = (callback?: AMap.MapCallback) => {
        if (!this._map) {
            console.warn('The _map is undefined!')
            return
        }

        MapModel.RemoveEvent(this._map, callback)
    }

    /** 地址查询 */
    readonly SearchAsync = async (search: string): Promise<AMap.POI[] | undefined> => {
        if (!this._placeSearch) {
            this._placeSearch = await MapModel.GetPlaceSearchAsync()
        }

        return new Promise((resolve, reject) => {
            if (!this._placeSearch) {
                console.warn('The _placeSearch is undefined!')
                return
            }

            this._placeSearch.on(MapEvents.complete, (res: AMap.SearchResult) => {
                resolve(res.poiList.pois)
            }, undefined, true)

            this._placeSearch.on(MapEvents.error, (err: any) => {
                console.error('Search error:', err)
                resolve(undefined)
            }, undefined, true)

            this._placeSearch.search(search)
        })
    }
    //#endregion [Map]

    //#region [Tool]
    /** 初始化“地图类型” */
    readonly InitMapType = async () => {
        if (this._mapType) return
        if (!this._map) {
            console.warn('The _map is undefined!')
            return
        }
        if (!await MapModel.LoadPluginAsync([MapPlugins.MapType])) return
        if (!this.refContainer.value) return

        let maptype = this.refContainer.value.querySelector('.amap-maptype') as HTMLElement
        if (!maptype) {
            this._mapType = new AMap.MapType()
            this._map.addControl(this._mapType)
            maptype = this.refContainer.value.querySelector('.amap-maptype') as HTMLElement
        }
        if (maptype) maptype.style.cssText = ''
    }

    /** 移除“地图类型” */
    readonly RemoveMapType = () => {
        if (!this._mapType) return
        if (!this._map) {
            console.warn('The _map is undefined!')
            return
        }

        this._map.removeControl(this._mapType)
        this._mapType = undefined
    }

    /** 获取“地址选择器” */
    readonly GetAddrSelect = () => {
        const selectAddr = new SelectModel<AMap.POI>()
        selectAddr.IsAllowSearch.value = true
        selectAddr.Placeholder.value = Texts.Address
        selectAddr._converter = source => source.name
        selectAddr._onSearchTextChange = search => {
            selectAddr.IsLoading.value = true
            this.SearchAsync(search).then(res => {
                if (!res) return
                selectAddr.SetItems(res)
                selectAddr.IsLoading.value = false
            })
        }
        selectAddr._onSelect = item => {
            var poi = item.Value.value
            if (poi == undefined) return
            this.ZoomTo(poi.location, MapModel.GetZoom(poi.shopinfo))
            this.SetMarker(poi.location)
        }
        selectAddr._onUnselect = this.InitAsync
        return selectAddr
    }

    /** 设置“标记” */
    readonly SetMarker = (position: AMap.Vector2 | AMap.LngLat) => {
        if (!this._map) return
        this.RemoveMarker()
        this._marker = new AMap.Marker({ position, zIndex: 999 })
        this._map.add(this._marker)
    }

    /** 移除“标记” */
    readonly RemoveMarker = () => {
        if (!this._marker) return
        this._map?.remove(this._marker)
        this._marker = undefined
    }

    /** 初始化“标记聚合” */
    readonly InitClusterAsync = async (lnglatDatas: LnglatData<TData, any>[], opts?: AMap.MarkerClusterOptions) => {
        if (!await MapModel.LoadPluginAsync([MapPlugins.MarkerCluster])) return

        if (!this._map) {
            console.warn('The _map is undefined!')
            return
        }

        this.ClearCluster()

        const arrOpts: DataOptions[] = []
        this._markerDataMap.clear()

        lnglatDatas.forEach(lnglatData => {
            const opts = new DataOptions(lnglatData.lnglat)
            arrOpts.push(opts)
            this._markerDataMap.set(opts, lnglatData)
        })

        this._cluster = new AMap.MarkerCluster(this._map, arrOpts, {
            renderMarker: m => this.RenderMarker(m, this),
            renderClusterMarker: c => MapModel.RenderClusterMarker(c, arrOpts.length),
            ...opts
        })
        this._cluster.on(MapEvents.click, (e: AMap.MarkerClusterArgs) => {
            this.ZoomByClusterData(e.clusterData)
        })
    }

    /** 清空“标记聚合” */
    readonly ClearCluster = () => {
        if (this._cluster) {
            this._cluster.setMap(null)
            this._cluster = undefined
        }
    }

    /** 添加“标记”集合 */
    readonly AddMarkers = (lnglatDatas: LnglatData<TData, TInfoModel>[], params?: {
        icon?: MarkerIconOptions,
        opts?: AMap.MarkerOptions,
        callback?: AMap.MapCallback,
    }) => {
        if (!this._map) {
            console.warn('The _map is undefined!')
            return
        }

        for (const lnglatData of lnglatDatas) {
            const model = new MarkerModel({
                icon: params?.icon?.icon,
                iconStyle: params?.icon?.iconStyle,
                data: lnglatData,
                info: lnglatData.info,
                infoModel: lnglatData.infoModel,
                onClick: this._onMarkerClick,
            })
            const markerElement = ComponentHelper.GetElement(Marker, { model })
            if (!markerElement) {
                console.warn('The markerElement is undefined!')
                return
            }

            const marker = new AMap.Marker({
                position: lnglatData.lnglat,
                extData: lnglatData.data,
                content: markerElement as HTMLElement,
                offset: [MarkerModel.offset, MarkerModel.offset],
                ...params?.opts
            })
            this._map.add(marker)
            this._markers.push(marker)
            this._markerModels.push(model)

            MapModel.AddEvent(marker)

            if (params?.callback) {
                MapModel.AddEvent(marker, params.callback)
            }
        }
    }

    /** 清空“标记” */
    readonly ClearMarkers = () => {
        this.ClearOverlays(ClassNames.Marker)
        this._markers.splice(0)
        this._markerModels.splice(0)
    }

    /** 初始化“旗帜” */
    readonly InitFlag = () => {
        const markers = this._markerModels
        const n = markers.length
        if (n > 0) {
            const end = markers[n - 1]
            if (end) end.Mode.value = MarkerModes.End
        }

        if (n > 1) {
            const start = markers[0]
            if (start) start.Mode.value = MarkerModes.Start
        }
    }

    //#region 多边形
    /** 初始化“多边形编辑器” */
    readonly InitPolygonEditorAsync = async (callback?: AMap.PolygonEditorCallback) => {
        if (!this._map) {
            console.warn('The _map is undefined!')
            return
        }

        if (!await MapModel.LoadPluginAsync([MapPlugins.PolygonEditor])) return

        if (!this._polygonEditor) {
            this._polygonEditor = new AMap.PolygonEditor(this._map)
        }

        this.SavePolygon()

        this.AddEvent({
            click: args => {
                if (this._IsCreating.value) return
                this.SavePolygon()
            },
        })

        this._polygonEditor.on(PolygonEditorEvent.end, (args: AMap.PolygonEditorEndArgs) => {
            args.target.on(MapEvents.dblclick, () => {
                this.EditPolygon(args.target as AMap.Polygon)
            })
        })

        if (callback) {
            if (callback.add) this._polygonEditor.on(PolygonEditorEvent.add, callback.add)
            if (callback.addnode) this._polygonEditor.on(PolygonEditorEvent.addnode, callback.addnode)
            if (callback.adjust) this._polygonEditor.on(PolygonEditorEvent.adjust, callback.adjust)
            if (callback.end) this._polygonEditor.on(PolygonEditorEvent.end, callback.end)
            if (callback.move) this._polygonEditor.on(PolygonEditorEvent.move, callback.move)
            if (callback.removenode) this._polygonEditor.on(PolygonEditorEvent.removenode, callback.removenode)
        }

        return this._polygonEditor
    }

    /** 编辑“多边形” */
    readonly EditPolygon = (features: AMap.Polygon) => {
        if (!this._polygonEditor) {
            console.warn('The _polygonEditor is undefined!')
            return
        }
        if (this._IsEditing.value) return

        this._polygonEditor.setTarget(features)
        this._polygonEditor.open()

        this._IsEditing.value = true
    }

    /** 保存“多边形” */
    readonly SavePolygon = () => {
        if (!this._polygonEditor) {
            console.warn('The _polygonEditor is undefined!')
            return
        }

        if (!this._IsEditing.value) return

        this._polygonEditor.close()
        this._polygonEditor.setTarget()
        this.UpdatePolygonCount()

        this._IsEditing.value = false
        this._IsCreating.value = false
    }

    /** 新建“多边形” */
    readonly NewPolygon = () => {
        if (this._IsEditing.value) return

        const editor = this._polygonEditor
        if (!editor) {
            console.warn('The editor is undefined!')
            return
        }

        editor.close()
        editor.setTarget()
        editor.open()

        this._IsEditing.value = true
        this._IsCreating.value = true
    }

    /** 添加“多边形” */
    readonly AddPolygon = (features: AMap.Polygon | Array<AMap.Polygon>, setTaget: boolean = false) => {
        if (!this._map) {
            console.warn('The _map is undefined!')
            return
        }

        this.Add(features, {
            dblclick: args => {
                this.EditPolygon(args.target as AMap.Polygon)
            },
        })
        this.UpdatePolygonCount()

        const editor = this._polygonEditor
        if (setTaget && editor) {
            if (features instanceof Array) {
                editor.setTarget(ArrayHelper.GetLast(features))
            } else {
                editor.setTarget(features)
            }
        }
    }

    /** 根据“路径”添加“多边形” */
    readonly AddPolygonByPath = (path: AMap.PolygonPath, opts?: AMap.PolygonOptions) => {
        const polygon = new AMap.Polygon({
            path: path,
            ...opts
        })
        this.AddPolygon(polygon)
        return polygon
    }

    /** 根据“点集合”添加“多边形” */
    readonly AddPolygonByPoints = (points: AMap.Vector2[], opts?: AMap.PolygonOptions) => {
        const path = points.map(p => new AMap.LngLat(p[0], p[1]))
        return this.AddPolygonByPath(path, opts)
    }

    /** 移除“目标多边形” */
    readonly RemoveTagetPolygon = () => {
        const editor = this._polygonEditor
        if (!editor) {
            console.warn('The editor is undefined!')
            return
        }

        const target = editor.getTarget()
        if (!target) return

        this.Remove(target)
        this.SavePolygon()
    }

    /** 获取“覆盖物”集合 */
    readonly GetAllOverlays = (): AMap.Overlay[] | undefined => {
        if (!this._map) {
            console.warn('The _map is undefined!')
            return undefined
        }

        return this._map.getAllOverlays()
    }

    /** 获取“覆盖物”集合 */
    readonly GetOverlays = <TOverlay extends AMap.Overlay>(className: string): TOverlay[] | undefined => {
        if (!this._map) {
            console.warn('The _map is undefined!')
            return undefined
        }

        return this._map.getAllOverlays().filter(i => i.className === className) as TOverlay[]
    }

    /** 获取“覆盖物”个数 */
    readonly GetOverlayCount = (className: string): number => {
        if (!this._map) {
            console.warn('The _map is undefined!')
            return 0
        }

        return this._map.getAllOverlays().filter(i => i.className === className).length
    }

    /** 清空“覆盖物” */
    readonly ClearOverlays = (className: string) => {
        if (!this._map) {
            console.warn('The _map is undefined!')
            return
        }

        this.GetOverlays<AMap.Overlay>(className)?.forEach(overlay => {
            this._map?.remove(overlay)
        })
    }

    /** 获取“多边形”集合 */
    readonly GetPolygons = (): AMap.Polygon[] | undefined => {
        return this.GetOverlays<AMap.Polygon>(ClassNames.Polygon)
    }

    /** 获取“多边形”个数 */
    readonly GetPolygonCount = (): number => {
        return this.GetOverlayCount(ClassNames.Polygon)
    }

    /** 更新“多边形”个数 */
    readonly UpdatePolygonCount = () => {
        this._PolygonCount.value = this.GetPolygonCount()
    }

    /** “多边形集合”转“路径” */
    static readonly PolygonsToPath = <TPath extends AMap.PolygonPath>(polygon: AMap.Polygon): TPath => {
        return polygon.getPath() as TPath
    }
    //#endregion 多边形

    //#region 轨迹
    /** 初始化“多边形编辑器” */
    readonly InitPolylineAsync = async (callback?: AMap.PolygonEditorCallback) => {
        if (!this._map) {
            console.warn('The _map is undefined!')
            return
        }

        if (!await MapModel.LoadPluginAsync([MapPlugins.MoveAnimation])) return

        if (!this._polyline) {
            this._polyline = new AMap.Polyline({
                map: this._map,
                showDir: true,
                strokeColor: "#28F",
                strokeWeight: 6,
            })
        }

        return this._polyline
    }
    //#endregion 轨迹

    /** 设置“路径” */
    readonly SetPath = (path: AMap.PolylinePath) => {
        if (!this._polyline) {
            console.warn('The _polyline is undefined!')
            return
        }

        this._polyline.setPath(path)
    }
    //#endregion [Tool]

    //#region [Zoom]
    /** 缩放到 */
    readonly ZoomTo = (lnglat: AMap.LngLat, zoom?: number) => {
        this._map?.setZoomAndCenter(zoom ?? 20, lnglat)
    }

    /** 根据“经纬度”缩放 */
    readonly ZoomByLngLat = (lnglat: AMap.LngLat, zoom: number = 20) => {
        if (!this._map) return
        this._map.setZoomAndCenter(zoom, lnglat)
    }

    /** 根据“向量”缩放 */
    readonly ZoomByVector2 = (vector: AMap.Vector2, zoom: number = 20) => {
        if (!this._map) return
        this._map.setZoomAndCenter(zoom, new AMap.LngLat(vector[0], vector[1]))
    }

    /** 根据“经纬度集合”缩放 */
    readonly ZoomByLngLats = (lnglats: AMap.LngLat[], padding: number = 60) => {
        if (!this._map) return
        const bounds = MapModel.GetBounds(lnglats)
        if (!bounds) return
        const zoomCenter = this._map.getFitZoomAndCenterByBounds(bounds, [padding, padding, padding, padding])
        this._map.setZoomAndCenter(zoomCenter[0], zoomCenter[1])
    }

    /** 根据“向量集合”缩放 */
    readonly ZoomByVector2s = (vectors: AMap.Vector2[], padding: number = 60) => {
        if (!this._map) return
        const lnglats = vectors.map(v => new AMap.LngLat(v[0], v[1]))
        this.ZoomByLngLats(lnglats, padding)
    }

    /** 根据“多个向量集合”缩放 */
    readonly ZoomByMultiVector2s = (arrVectors: AMap.Vector2[][], padding: number = 60) => {
        if (!this._map) return
        const vectors: AMap.Vector2[] = []
        arrVectors.forEach(v => vectors.push(...v))
        this.ZoomByVector2s(vectors, padding)
    }

    /** 根据“集群数据”缩放 */
    readonly ZoomByClusterData = (clusterData: DataOptions[], padding: number = 60) => {
        if (!this._map) return
        const lnglats = clusterData.map(c => c.lnglat as AMap.LngLat)
        this.ZoomByLngLats(lnglats, padding)
    }
    //#endregion [Zoom]
    //#endregion 【Functions】
}