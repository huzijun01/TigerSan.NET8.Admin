import { computed, shallowRef, type ComputedRef } from "vue"

/** “尺寸”行为 */
export class LanguageBehavior {
    //#region 【Props】
    /** 文本
     * （可使用“TextModel.Computed”方法创建） */
    readonly Text = shallowRef<string | ComputedRef<string>>('')
    /** 显示文本 */
    readonly ShowText = computed(() => typeof this.Text.value === 'string' ? this.Text.value : this.Text.value.value)
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(text?: string | ComputedRef<string>) {
        if (text) this.Text.value = text
    }
    //#endregion 【Ctor】
}