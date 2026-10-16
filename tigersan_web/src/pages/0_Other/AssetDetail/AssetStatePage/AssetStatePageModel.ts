import { computed } from 'vue'
import { loading, MapModel, ApiResult, StringHelper } from '@/0_tigersan_ui/tigerui'
import { AssetStateModel } from './AssetStateModel'
import { PositionInfoModel, assetHelper, LocationMode } from '@/models'

export class AssetStatePageModel {
    //#region 【Fields】
    /** 地图 */
    readonly map = new MapModel<any, PositionInfoModel>({ animateEnable: false })
    //#endregion 【Fields】

    //#region 【Props】
    /** 资产状态 */
    readonly assetState = new AssetStateModel()
    /** 定位方式 */
    readonly LocationMode = computed(() => LocationMode.GetName(this.assetState.Tag.value?.locationMode))
    /** 是否显示“定位方式” */
    readonly IsShowLocationMode = computed(() => StringHelper.IsNotEmpty(this.LocationMode.value))
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this.map._isAutoInit = false
        this.map.IsShowSelect.value = false
        this.map.IsShowButton.value = false
        this.map._onInitAsync = async () => {
            try {
                loading.IsShow.value = true

                const asset = this.assetState.Asset.value
                if (!asset) {
                    console.warn('The asset is undefined!')
                    return
                }

                if (!asset.assetId) return

                const res = await assetHelper.GetPosition(asset.id)
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