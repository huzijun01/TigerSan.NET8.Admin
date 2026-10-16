import { nanoid } from 'nanoid'
import { computed, ref, shallowReactive, type ComputedRef } from 'vue'
import { Texts } from '../../texts'
import { Colors } from '../../base'
import { LanguageBehavior } from '../../helpers'

/** 全局“弹窗模型”集合 */
export const dialogModels = shallowReactive<DialogModel<any>[]>([])

/** “弹窗”回调 */
export type DialogCallback<T> = (state: DialogState, data: T) => any

/** “弹窗”模式 */
export enum DialogMode {
    NoButton,
    YesOrNo,
    YesOrCancel
}

/** “弹窗”状态 */
export enum DialogState {
    Yes,
    No,
    Cancel
}

/** “弹窗”模型 */
export class DialogModel<T> {
    //#region 【Fields】
    readonly id: string = nanoid()
    _data?: T
    callback?: DialogCallback<T>
    //#endregion 【Fields】

    //#region 【Props】
    /** “标题”文本 */
    readonly Title
    /** “No”文本 */
    readonly NoText
    /** “Yes”文本 */
    readonly YesText
    /** 消息 */
    readonly Msg = ref('')
    /** 颜色 */
    readonly Color = ref('')
    /** 模式 */
    readonly Mode = ref(DialogMode.NoButton)

    //#region [computed]
    /** “标题”显示文本 */
    readonly ShowTitle
    /** “No”显示文本 */
    readonly ShowNoText
    /** “Yes”显示文本 */
    readonly ShowYesText
    readonly IsShowButtonPanel = computed(() => this.Mode.value != DialogMode.NoButton)
    readonly IsShowNoButton = computed(() => this.Mode.value === DialogMode.YesOrNo)
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(
        title: string | ComputedRef<string>,
        msg: string,
        data?: T,
        callback?: DialogCallback<T>,
        mode: DialogMode = DialogMode.NoButton,
        background: string = Colors.Brand) {
        this._data = data
        this.Msg.value = msg
        this.Mode.value = mode
        this.Color.value = background
        this.callback = callback

        const lbTitle = new LanguageBehavior(title)
        this.Title = lbTitle.Text
        this.ShowTitle = lbTitle.ShowText

        const lbNo = new LanguageBehavior(Texts.No)
        this.NoText = lbNo.Text
        this.ShowNoText = lbNo.ShowText

        const lbYes = new LanguageBehavior(Texts.Yes)
        this.YesText = lbYes.Text
        this.ShowYesText = lbYes.ShowText
    }
    //#endregion 【Ctor】
}