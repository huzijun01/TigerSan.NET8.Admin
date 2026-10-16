import { shallowRef } from "vue"
import { loading, ApiResult } from "@/0_tigersan_ui/tigerui"
import { AssetDto, TagDto, assetHelper, tagHelper, baseStationHelper, BaseStationDto } from "@/models"

/** “资产状态”模型 */
export class AssetStateModel {
    //#region 【Props】
    /** 资产 */
    readonly Asset = shallowRef<AssetDto | undefined>()
    /** 标签 */
    readonly Tag = shallowRef<TagDto | undefined>()
    /** 基站 */
    readonly Station = shallowRef<BaseStationDto | undefined>()
    //#endregion 【Props】

    //#region 【Functions】
    /** 初始化 */
    readonly Init = async (assetId: string): Promise<boolean> => {
        loading.IsShow.value = true

        try {
            const resAsset = await assetHelper.GetFull(undefined, assetId)
            if (!resAsset.data) {
                ApiResult.ShowResult(resAsset, undefined, false)
                return false
            }

            this.Asset.value = resAsset.data

            if (resAsset.data.tagId) {
                const resTag = await tagHelper.GetFull(resAsset.data.tagId)
                if (!resTag.data) {
                    ApiResult.ShowResult(resTag, undefined, false)
                    return false
                }
                this.Tag.value = resTag.data
            } else {
                this.Tag.value = undefined
            }

            if (resAsset.data.station) {
                const resStation = await baseStationHelper.GetFull(resAsset.data.station, resAsset.data.stationId)
                if (!resStation.data) {
                    ApiResult.ShowResult(resStation, undefined, false)
                    return false
                }
                this.Station.value = resStation.data
            } else {
                this.Station.value = undefined
            }

            return true
        } finally {
            loading.IsShow.value = false
        }
    }
    //#endregion 【Functions】
}