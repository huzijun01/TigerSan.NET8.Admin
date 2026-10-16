import { ref, watch } from 'vue'
import { ConfigBase } from './ConfigBase'

/** 语言 */
export enum Language {
    en,
    zhCn
}

export class AppConfig {
    static defaultLocale = Language.zhCn
    locale: Language = AppConfig.defaultLocale
}

/** 配置模型 */
export class ConfigModel {
    //#region 【Fields】
    /** “地区”改变后 */
    _onLocaleChanged?: (lang: Language) => any
    /** 配置 */
    readonly config = new ConfigBase('AppConfig', new AppConfig())
    //#endregion 【Fields】

    //#region 【Props】
    /** 地区 */
    readonly Locale = ref(AppConfig.defaultLocale)
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this.Locale.value = this.config.Get().locale
        watch(this.Locale, () => this._onLocaleChanged?.(this.Locale.value))
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 切换“地区” */
    readonly ToggleLocale = () => {
        const config = this.config.Get()
        config.locale = this.Locale.value = this.Locale.value == Language.en ? Language.zhCn : Language.en
        this.config.Save()
    }
    //#endregion 【Functions】
}

/** 配置实例 */
export const config = new ConfigModel()
