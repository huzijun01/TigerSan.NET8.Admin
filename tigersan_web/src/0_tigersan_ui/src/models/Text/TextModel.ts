import { computed, type Ref, type ComputedRef } from "vue"
import { Language, config } from "../../helpers"

/** 文本模型 */
export class TextModel {
    //#region 【Fields】
    en: string
    zhCn: string
    //#endregion 【Fields】

    //#region 【Props】
    //#region [computed]
    /** “实际值”计算属性 */
    readonly Value = computed(() => {
        switch (config.Locale.value) {
            case Language.en:
                return this.en
            case Language.zhCn:
                return this.zhCn
            default:
                return this.en
        }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(en: string, zhCn: string) {
        this.en = en
        this.zhCn = zhCn
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 获取“计算属性” */
    static Computed(en: string, zhCn: string): ComputedRef<string> {
        return new TextModel(en, zhCn).Value
    }

    /** 获取“文本” */
    static GetText(en: string, zhCn: string): string {
        return TextModel.Computed(en, zhCn).value
    }

    /** 获取“默认值计算属性” */
    static DefaultComputed(refEN: Ref<string>, refCH: Ref<string>, cmpDefault: ComputedRef<string>): ComputedRef<string> {
        return computed(() => {
            const cmpText = new TextModel(refEN.value, refCH.value).Value
            return cmpText.value.trim() != '' ? cmpText.value : cmpDefault.value
        })
    }
    //#endregion 【Functions】
}