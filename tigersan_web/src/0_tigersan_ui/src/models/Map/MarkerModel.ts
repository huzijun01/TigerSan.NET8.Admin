import { computed, ref, type Component, type StyleValue } from "vue"

/** “标记”模式 */
export enum MarkerModes {
    Normal,
    Start,
    End,
}

export class MarkerModel<TData, TInfoModel> {
    //#region 【Fields】
    static readonly size: number = 18
    static readonly offset: number = -this.size / 2
    /** 图标 */
    icon?: string
    /** “图标”样式 */
    iconStyle?: StyleValue
    /** 数据 */
    data?: TData
    /** “信息”组件 */
    info?: Component
    /** “信息”模型 */
    infoModel?: TInfoModel
    /** 点击时 */
    onClick?: (data: any) => any
    //#endregion 【Fields】

    //#region 【Props】
    /** 模式 */
    readonly Mode = ref(MarkerModes.Normal)

    //#region [computed]
    /** 旗帜类名 */
    readonly FlagClass = computed(() => {
        switch (this.Mode.value) {
            case MarkerModes.Start:
                return 'start'
            case MarkerModes.End:
                return 'end'
            default:
                return undefined
        }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(opts?: MarkerModelOptions<TData, TInfoModel>) {
        if (!opts) return
        this.icon = opts.icon
        this.iconStyle = opts.iconStyle
        this.data = opts.data
        this.info = opts.info
        this.infoModel = opts.infoModel
        this.onClick = opts.onClick
    }
    //#endregion 【Ctor】
}

export class MarkerIconOptions {
    /** 图标 */
    icon?: string
    /** “图标”样式 */
    iconStyle?: StyleValue
}

export type MarkerModelOptions<TData, TInfoModel> = {
    /** 数据 */
    data?: TData
    /** “信息”组件 */
    info?: Component
    /** “信息”模型 */
    infoModel?: TInfoModel
    /** 点击时 */
    onClick?: (data?: TData) => any
} & MarkerIconOptions