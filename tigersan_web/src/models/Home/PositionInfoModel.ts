
import { nanoid } from "nanoid"
import { computed, reactive, ref, type Reactive, type StyleValue } from "vue"
import { Colors, Icons, LnglatData, MarkerIconOptions, ObjectHelper, StringHelper } from '@/0_tigersan_ui/tigerui'
import { IdEntityBase } from "@/helpers/IdHelper"
import { LocationModes } from "../base/AssetStates"
import { LocationMode } from "../base/AssetStates"
import { assetTypeHelper } from "../Dictionaries/DictionaryModels"

export const tagIcon: MarkerIconOptions = { icon: Icons.Tag_Planar_2, iconStyle: { color: Colors.Brand } }
export const stationIcon: MarkerIconOptions = { icon: Icons.Router_Planar_2, iconStyle: { color: Colors.Warning } }

/** 位置类型 */
export enum PositionTypes {
    /** 标签 */
    Tag = 0,
    /** 基站 */
    Station = 1,
}

/** 位置信息 */
export class PositionDto extends IdEntityBase {
    info = ''
    longitude = 0
    latitude = 0
    reportTime?: Date
    locationMode?: LocationModes
    // 附加：
    type?: PositionTypes

    /** 获取“图标” */
    static GetIcon(data: LnglatData<PositionDto, PositionInfoModel>) {
        return data.data?.type === PositionTypes.Station ? stationIcon : tagIcon
    }
}

/** 定位记录 */
export class LocationRecord {
    reportTime = new Date()
    locationMode?: LocationModes
    longitude = 0
    latitude = 0
    address?: string
    site?: bigint
    station?: bigint
    stationName?: string
}

/** “位置信息”模型 */
export class PositionInfoModel {
    //#region 【Fields】
    readonly _id = nanoid()
    /** 点击时 */
    _onClick?: (info: PositionInfoModel) => any
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否选中 */
    readonly IsSelected = ref(false)
    /** 资产位置 */
    readonly Position: Reactive<PositionDto>
    /** 图标 */
    readonly Icon = ref(Icons.Tag_Linear_2)
    /** 背景 */
    readonly Background = ref<string | undefined>()

    //#region [computed]
    /** 标题 */
    readonly Title = computed(() => this.Position.info)
    /** “定位方式”文本 */
    readonly LocationModeText = computed(() => LocationMode.GetName(this.Position.locationMode))
    /** 是否显示“定位方式”文本 */
    readonly IsShowLocationModeText = computed(() => StringHelper.IsNotEmpty(this.LocationModeText.value))
    /** “上报时间”文本 */
    readonly ReportTimeText = computed(() => ObjectHelper.GetDateString(this.Position.reportTime))
    /** 样式对象 */
    readonly Style = computed((): StyleValue => {
        return {
            background: this.IsSelected.value ? Colors.Brand10 : this.Background.value
        }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(position: PositionDto) {
        this.Position = reactive<PositionDto>(position)
        if (position.type === PositionTypes.Station) {
            this.Icon.value = Icons.Router_Linear
        }
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 更新类型 */
    static UpdateTypeAsync = async () => {
        await assetTypeHelper.UpdateIdNames()
    }

    /** 点击时 */
    readonly OnClick = () => {
        this._onClick?.(this)
    }
    //#endregion 【Functions】
}