import { nanoid } from "nanoid"
import { ref, watch, computed, shallowRef, shallowReactive, type Component, type StyleValue, type ComputedRef } from "vue"
import { Texts } from "../../texts"
import { LanguageBehavior, type Data } from "../../helpers"

export type TabPageHandler = (pageModel: TabPageModel) => any

export class TabPageConfig {
    /** 标题 */
    Title?: string | ComputedRef<string>
    /** 是否选中 */
    IsSelected?: boolean
    /** 组件 */
    _component?: Component
    /** 参数 */
    _rootProps?: Data | null
}

/** 标签页模型 */
export class TabPageModel {
    //#region 【Fields】
    readonly _id = nanoid()
    /** 所属“标签视图” */
    readonly _tabView: TabViewModel
    /** 组件 */
    _component?: Component
    /** 模型 */
    _rootProps?: Data | null
    //#endregion 【Fields】

    //#region 【Props】
    /** “标题”文本 */
    readonly Title
    /** “标题”显示文本 */
    readonly ShowTitle

    //#region [computed]
    /** 是否选中 */
    readonly IsSelected = computed(() => {
        return this._tabView.SelectedPage.value === this
    })
    /** “是否选中”类名 */
    readonly SelectedClass = computed(() => {
        return { selected: this.IsSelected.value }
    })
    /** “隐藏”类名 */
    readonly HiddenClass = computed(() => {
        return { 'display-none': !this.IsSelected.value }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(
        tabView: TabViewModel,
        title?: string | ComputedRef<string>,
        component?: Component,
        rootProps?: Data | null
    ) {
        this._tabView = tabView
        this._component = component
        this._rootProps = rootProps

        const lbTitle = new LanguageBehavior(title ?? Texts.Title.value)
        this.Title = lbTitle.Text
        this.ShowTitle = lbTitle.ShowText
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly OnClick = () => {
        this._tabView.SelectedPage.value = this
        this._tabView.Clicked?.(this)
    }
    //#endregion 【Functions】
}

/** 标签视图模型 */
export class TabViewModel {
    //#region 【Props】
    /** “标签页模型”集合 */
    readonly Pages = shallowReactive<TabPageModel[]>([])
    /** 选中的“标签页模型” */
    readonly SelectedPage = shallowRef<TabPageModel | undefined>()
    /** 内边距 */
    readonly Padding = ref<string | undefined>()

    //#region [computed]
    /** 内容样式 */
    readonly ContentStyle = computed((): StyleValue => {
        return {
            padding: this.Padding.value
        }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Events】
    /** 点击后 */
    Clicked?: TabPageHandler
    /** “是否选中”改变后 */
    IsSelectedChanged?: TabPageHandler
    //#endregion 【Events】

    //#region 【Ctor】
    constructor(configs?: TabPageConfig[]) {
        this.Init(configs)

        watch(this.SelectedPage, (value, oldValue) => {
            if (value != oldValue && value) {
                this.IsSelectedChanged?.(value)
            }
        })
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 初始化 */
    readonly Init = (configs?: TabPageConfig[]) => {
        this.Pages.splice(0)
        this.SelectedPage.value = undefined

        if (!configs) return

        configs.forEach(config => {
            const page = new TabPageModel(
                this,
                config.Title,
                config._component,
                config._rootProps)
            if (config.IsSelected) this.SelectedPage.value = page
            this.Pages.push(page)
        })

        if (!this.SelectedPage.value && this.Pages.length > 0) {
            this.SelectedPage.value = this.Pages[0]
        }
    }

    /** 设置“选中的标签页” */
    readonly SetSelectedPage = (index: number) => {
        if (index < 0 || index >= this.Pages.length) {
            console.warn('The index is out of range!')
            return
        }

        const targetPage = this.Pages[index]

        // 避免重复赋值触发不必要的 watch 或副作用
        if (this.SelectedPage.value !== targetPage) {
            this.SelectedPage.value = targetPage
        }
    }
    //#endregion 【Functions】
}