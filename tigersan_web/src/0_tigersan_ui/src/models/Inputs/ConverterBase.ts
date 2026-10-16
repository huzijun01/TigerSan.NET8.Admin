import { ref, shallowRef } from "vue"
import type { T2String } from "../../types"
import { config, StringHelper, WatchBehavior } from "../../helpers"

/** “值转换控件”基类 */
export class ConverterBase<TValue> {
    //#region 【Fields】
    /** “值”监听器 */
    readonly watchValue
    /** “地区”监听器 */
    readonly watchLocale
    /** 转换器 */
    _converter?: T2String<TValue>
    /** 改变时 */
    _onChange?: (value: TValue | undefined) => any
    //#endregion 【Fields】

    //#region 【Props】
    /** 值 */
    readonly Value = shallowRef<TValue | undefined>()
    /** 文本 */
    readonly Text = ref('')
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this.watchValue = new WatchBehavior(this.Value, this.UpdateText)
        this.watchValue.Start()
        this.watchLocale = new WatchBehavior(config.Locale, () => this.UpdateText())
        this.watchLocale.Start()
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    //#region [private]
    /** 获取“文本” */
    private readonly GetText = () => {
        if (this.Value.value === undefined || this.Value.value === null) return ''

        let text = ''

        if (this._converter) {
            text = this._converter(this.Value.value)
        }
        else {
            text = new String(this.Value.value).toString()
        }

        return text
    }
    //#endregion [private]

    /** 更新“文本” */
    readonly UpdateText = (value?: TValue, oldValue?: TValue) => {
        if (value != oldValue) {
            this._onChange?.(this.Value.value)
        }

        this.Text.value = this.GetText()
        if ((this.Text.value === '' || this.Text.value === undefined) && this.Value.value != undefined) {
            console.warn('The Text is empty!', this.Value.value)
        }
    }

    /** 是否“模糊包含” */
    readonly IsFuzzyIncludes = (search: string): boolean => {
        return StringHelper.IsFuzzyIncludes(this.GetText(), search)
    }
    //#endregion 【Functions】
}
