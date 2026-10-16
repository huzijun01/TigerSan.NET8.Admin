import { nanoid } from "nanoid"
import { computed, ref, type ShallowReactive, type StyleValue } from "vue"
import { Icons } from "../../base"
import { ArrayHelper } from '../../helpers/ArrayHelper'
import { TimerHelper } from '../../helpers/TimerHelper'

export enum MsgTypes {
    Primary,
    Success,
    Warning,
    Error,
    Info,
}

export class ToastModel {
    //#region 【Fields】
    /** ID */
    readonly _id: string = nanoid()
    /** 图标 */
    readonly _icon
    /** 类名 */
    readonly _class
    /** “关闭”定时器 */
    readonly _timerClose
    /** 消息 */
    _msg
    /** 间隔 */
    _gap = 15
    /** “顶部”距离 */
    _top = 30
    /** 高度 */
    _height = 40
    /** 时间（ms） */
    _time = 3000
    /** 删除延时（ms） */
    _deleteDelay = 500
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否“显示”
     * （由“ToastModel”内部维护） */
    readonly IsShow = ref(true)
    /** 所属集合
     * （由“ToastHelper”传入） */
    readonly Models: ShallowReactive<ToastModel[]>
    /** “顶部”距离 */
    readonly Top = computed(() => this._top + this.Models.indexOf(this) * (this._gap + this._height))

    //#region [computed]
    /** “根元素”样式 */
    readonly RootStyle = computed((): StyleValue => {
        return {
            top: this.Top.value + 'px'
        }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(
        models: ShallowReactive<ToastModel[]>,
        msg: string = 'null',
        type: MsgTypes = MsgTypes.Primary) {
        this._msg = msg
        this.Models = models
        this._timerClose = new TimerHelper(this.Close, this._time, false)

        switch (type) {
            case MsgTypes.Success:
                this._class = 'success'
                this._icon = Icons.Success_Circle
                break
            case MsgTypes.Warning:
                this._class = 'warning'
                this._icon = Icons.Warning_Circle
                break
            case MsgTypes.Error:
                this._class = 'error'
                this._icon = Icons.Close_Circle
                break
            case MsgTypes.Info:
                this._class = 'info'
                this._icon = Icons.Info_Circle
                break
            default:
                this._class = 'primary'
                this._icon = Icons.Info_Circle
                break
        }
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly Close = () => {
        this.IsShow.value = false
        new TimerHelper(() => {
            ArrayHelper.Delete(this.Models, this)
        }, this._deleteDelay, false).Start()
    }

    readonly OnMouseEnter = () => {
        this._timerClose.Stop()
    }

    readonly OnMouseLeave = () => {
        this._timerClose.Start()
    }
    //#endregion 【Functions】
}