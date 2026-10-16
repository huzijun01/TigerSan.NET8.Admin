import { computed, ref, shallowRef, watch, type StyleValue } from "vue"
import { Texts } from "../../texts"
import { ClickOutsideBehavior, LanguageBehavior } from "../../helpers"

/** “窗口”基类 */
export class WindowBase {
    //#region 【Props】
    /** 是否“显示” */
    readonly IsShow = ref(false)
    /** 标题 */
    readonly Title
    /** “标题”显示文本 */
    readonly ShowTitle
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        const lbTitle = new LanguageBehavior(Texts.Title)
        this.Title = lbTitle.Text
        this.ShowTitle = lbTitle.ShowText
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 显示 */
    readonly Show = () => {
        this.IsShow.value = true
    }

    /** 关闭 */
    readonly Close = () => {
        this.IsShow.value = false
    }
    //#endregion 【Functions】
}

/** “弹窗”模型 */
export class PopWindowModel extends WindowBase {
    //#region 【Fields】
    /** 显示时 */
    _onShow?: (model: PopWindowModel) => any
    /** 关闭时 */
    _onClose?: (model: PopWindowModel) => any
    //#endregion 【Fields】

    //#region 【Props】
    /** 最小宽度 */
    readonly MinWidth = ref<string | undefined>()
    /** 最小高度 */
    readonly MinHeight = ref<string | undefined>()
    /** 遮罩样式 */
    readonly MaskStyle = shallowRef<StyleValue | undefined>()

    //#region [computed]
    /** 样式 */
    readonly Style = computed((): StyleValue => {
        return {
            minWidth: this.MinWidth.value,
            minHeight: this.MinHeight.value,
        }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        super()

        watch(this.IsShow, isShow => {
            if (isShow) {
                this._onShow?.(this)
            } else {
                this._onClose?.(this)
            }
        })
    }
    //#endregion 【Ctor】
}

/** “抽屉”模型 */
export class DrawerModel extends WindowBase {
    //#region 【Fields】
    readonly _behavior
    /** 显示时 */
    _onShow?: (model: DrawerModel) => any
    /** 关闭时 */
    _onClose?: (model: DrawerModel) => any
    //#endregion 【Fields】

    //#region 【Props】
    /** 根元素 */
    readonly refRoot = shallowRef<HTMLElement | undefined>()
    /** 根样式 */
    readonly RootStyle = shallowRef<StyleValue | undefined>()
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        super()

        watch(this.IsShow, isShow => {
            if (isShow) {
                this._onShow?.(this)
            } else {
                this._onClose?.(this)
            }
        })

        this._behavior = new ClickOutsideBehavior(this.refRoot, this.Close)
    }
    //#endregion 【Ctor】
}
