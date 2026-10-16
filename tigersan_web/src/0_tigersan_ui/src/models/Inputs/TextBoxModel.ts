import { ref, computed } from "vue"
import { Texts } from "../../texts"
import type { StringFunc } from "../../types"
import { LanguageBehavior } from "../../helpers"

export class TextBoxModel {
    //#region 【Fields】
    _onChange?: StringFunc
    _onInput?: StringFunc
    _onEnter?: StringFunc
    //#endregion 【Fields】

    //#region 【Props】
    readonly Value = ref('')
    readonly Width = ref('208px')
    readonly IsReadonly = ref(false)
    /** 占位文本 */
    readonly Placeholder

    //#region [computed]
    /** “占位”显示文本 */
    readonly ShowPlaceholder

    /** “宽度”样式 */
    readonly WidthStyle = computed(() => {
        return {
            width: this.Width.value,
        }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        const lbText = new LanguageBehavior(Texts.PleaseEnter)
        this.Placeholder = lbText.Text
        this.ShowPlaceholder = lbText.ShowText
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly OnInput = () => {
        if (this._onInput) {
            this._onInput(this.Value.value)
        }
    }

    readonly OnChange = () => {
        if (this._onChange) {
            this._onChange(this.Value.value)
        }
    }

    readonly OnEnter = () => {
        if (this._onEnter) {
            this._onEnter(this.Value.value)
        }
    }

    readonly OnClear = () => {
        this.Value.value = ''
        this.OnChange()
    }
    //#endregion 【Functions】
}