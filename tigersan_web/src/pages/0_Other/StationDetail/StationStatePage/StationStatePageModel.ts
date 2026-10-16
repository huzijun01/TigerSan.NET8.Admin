import { computed } from 'vue'
import { loading, MapModel, ApiResult, StringHelper, RowDataModel, TableModel } from '@/0_tigersan_ui/tigerui'
import { PositionInfoModel, baseStationHelper, LocationMode, BaseStationDto } from '@/models'

/** 基站状态 */
export class StationStatePageModel {
    //#region 【Fields】
    /** 地图 */
    readonly map = new MapModel<any, PositionInfoModel>({ animateEnable: false })
    //#endregion 【Fields】

    //#region 【Props】
    /** 基站 */
    readonly station
    /** 定位方式 */
    readonly LocationMode = computed(() => LocationMode.GetName(this.station.Data.value?.locationMode))
    /** 是否显示“定位方式” */
    readonly IsShowLocationMode = computed(() => StringHelper.IsNotEmpty(this.LocationMode.value))
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(table: TableModel<BaseStationDto>) {
        this.station = new RowDataModel(table)
        this.map._isAutoInit = false
        this.map.IsShowSelect.value = false
        this.map.IsShowButton.value = false
        this.map._onInitAsync = async () => {
            try {
                loading.IsShow.value = true

                const station = this.station.Data.value
                if (!station) {
                    console.warn('The station is undefined!')
                    return
                }

                if (!station.macAddr) return

                const res = await baseStationHelper.GetPosition(station.id)
                const position = res.data
                if (!position) {
                    ApiResult.ShowResult(res, '', false)
                    return
                }

                if (!position.longitude || !position.latitude) return
                const lngLat = new AMap.LngLat(position.longitude, position.latitude)
                this.map.Add(new AMap.Marker({ position: lngLat }))
                this.map.ZoomByLngLat(lngLat)
            } finally {
                loading.IsShow.value = false
            }
        }
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            await this.map.InitAsync()
        } finally {
            loading.IsShow.value = false
        }
    }
    //#endregion 【Functions】
}