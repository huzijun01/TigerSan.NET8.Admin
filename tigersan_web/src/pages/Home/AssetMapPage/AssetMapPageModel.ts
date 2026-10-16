import PositionInfo from "@/components/PositionInfo.vue"
import PositionList from './PositionList/PositionList.vue'
import { ref, toRaw } from "vue"
import { loading, MapModel, LnglatData, DrawerModel, RowDataModel, TabViewModel, Texts } from "@/0_tigersan_ui/tigerui"
import { AssetFilter } from '../AssetLedgerPage/AssetFilter'
import { PositionListModel } from "./PositionList/PositionListModel"
import { AssetStateModel } from "../../0_Other/AssetDetail/AssetStatePage/AssetStateModel"
import { CompanyMgtPageModel } from "@/pages/BasicSettings/BasicSettings/CompanyMgtPage/CompanyMgtPageModel"
import { GetStationTable } from "@/pages/BasicSettings/Equipments/BaseStationMgtPage/BaseStationMgtTable"
import { assetHelper, baseStationHelper, PositionDto, PositionInfoModel, PositionTypes, siteHelper } from "@/models"

export class AssetMapPageModel {
    //#region 【Fields】
    /** 筛选 */
    readonly filter: AssetFilter
    /** 地图 */
    readonly map = new MapModel<PositionDto, PositionInfoModel>({ animateEnable: false })
    /** “资产状态”抽屉 */
    readonly drawerState = new DrawerModel()
    /** 资产状态 */
    readonly assetState = new AssetStateModel()
    /** 基站详情 */
    readonly station = new RowDataModel(GetStationTable())
    /** “资产”列表 */
    readonly assetList = new PositionListModel()
    /** “基站”列表 */
    readonly stationList = new PositionListModel()
    /** “列表”标签页 */
    readonly tabList = new TabViewModel([
        {
            Title: Texts.Tag,
            _component: PositionList,
            _rootProps: { model: this.assetList },
        },
        {
            Title: Texts.BaseStation,
            _component: PositionList,
            _rootProps: { model: this.stationList },
        }
    ])
    //#endregion 【Fields】

    //#region 【Props】
    readonly IsStation = ref(false)
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this.filter = new AssetFilter(this.Refresh)
        this.assetList._onClick = this.OnItemClick
        this.stationList._onClick = this.OnItemClick

        this.map.IsShowButton.value = false
        this.map._getIcon = PositionDto.GetIcon
        this.map._onInitAsync = async () => {
            const assets: PositionDto[] = []
            const stations: PositionDto[] = []

            try {
                // 场地：
                const sites = await siteHelper.GetList({
                    companies: CompanyMgtPageModel.AccessibleCompanies.value,
                })
                sites.forEach(site => {
                    if (!site.fencePoints) return
                    const points = MapModel.GetPathByPoints(site.fencePoints)
                    this.map.AddPolygonByPoints(points, { fillOpacity: 0.05 })
                })

                // 资产：
                const filter = this.filter
                const assetPositions = await assetHelper.GetPositionList({
                    companies: CompanyMgtPageModel.AccessibleCompanies.value,
                    department: filter.selectDepartment.Value.value?.id,
                    type: filter.selectAssetType.Value.value?.id,
                    tagType: filter.selectTagType.Value.value?.id,
                    state: filter.selectAssetState.Value.value,
                    states: filter.selectAssetState.NotCheckAllCheckedValues.value,
                    onlineState: filter.selectOnlineState.Value.value,
                    isAuto: filter.selectIsAuto.Value.value,
                    isFall: filter.selectIsFall.Value.value,
                    isInFence: filter.selectIsInFence.Value.value,
                    errorType: filter.selectErrorType.Value.value,
                    name: filter.searchName.Value.value,
                    rfid: filter.searchRfid.Value.value,
                    assetId: filter.searchAssetId.Value.value,
                    tagId: filter.searchTagId.Value.value,
                    stationId: filter.searchStationId.Value.value,
                })
                assets.push(...assetPositions)

                // 基站：
                const stationPositions = await baseStationHelper.GetPositionList({
                    companies: CompanyMgtPageModel.AccessibleCompanies.value,
                })
                stationPositions.forEach(i => i.type = PositionTypes.Station)
                stations.push(...stationPositions)
            } finally {
                this.assetList.SetPositions(assets)
                this.stationList.SetPositions(stations)
                this.InitCluster()
            }
        }
        this.map._onMarkerClick = data => {
            if (!data?.data) return
            this.map.SetMarker(data.lnglat)
            this.drawerState.Title.value = data.data.info

            if (data.data.type === PositionTypes.Station) {
                this.tabList.SetSelectedPage(1)
                this.stationList.GoToPage(data.data)
                baseStationHelper.GetFull(undefined, data.data.info).then(res => {
                    if (res) {
                        this.IsStation.value = true
                        this.station.Data.value = res.data
                        this.drawerState.Show()
                    }
                })
            } else {
                this.tabList.SetSelectedPage(0)
                this.assetList.GoToPage(data.data)
                this.assetState.Init(data.data.info).then(res => {
                    if (res) {
                        this.IsStation.value = false
                        this.drawerState.Show()
                    }
                })
            }
        }
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 刷新 */
    readonly Refresh = async () => {
        loading.IsShow.value = true
        await this.filter.UpdateIdNames()
        await PositionInfoModel.UpdateTypeAsync()
        await this.map.InitAsync()
        loading.IsShow.value = false
    }

    /** 初始化“标记聚合” */
    readonly InitCluster = () => {
        const points: LnglatData<PositionDto, PositionInfoModel>[] = []
        const list = this.assetList.rawPositions.value
        list.push(...this.stationList.rawPositions.value)
        list.forEach(position => {
            if (position.longitude != undefined && position.latitude != undefined) {
                const infoModel = new PositionInfoModel(position)
                infoModel.Background.value = 'var(--theme-input-background)'
                const ld = new LnglatData([position.longitude, position.latitude], position, PositionInfo, infoModel)
                points.push(ld)
            }
        })
        this.map.InitClusterAsync(points)
    }

    /** 点击“项目”时 */
    readonly OnItemClick = (info: PositionInfoModel) => {
        const position = toRaw(info.Position)
        if (!position.longitude || !position.latitude) return
        const point: AMap.Vector2 = [position.longitude, position.latitude]
        this.map.SetMarker(point)
        this.map.ZoomByVector2(point)
        this.drawerState.Title.value = position.info

        if (info.Position.type === PositionTypes.Station) {
            baseStationHelper.GetFull(undefined, position.info).then(res => {
                if (res) {
                    this.IsStation.value = true
                    this.station.Data.value = res.data
                    this.drawerState.Show()
                }
            })
        } else {
            this.assetState.Init(position.info).then(res => {
                if (res) {
                    this.IsStation.value = false
                    this.drawerState.Show()
                }
            })
        }
    }
    //#endregion 【Functions】
}