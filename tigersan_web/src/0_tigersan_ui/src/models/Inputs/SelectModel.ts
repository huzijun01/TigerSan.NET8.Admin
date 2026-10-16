import { nanoid } from "nanoid"
import { ref, shallowRef, watch, computed, shallowReactive, type App, type ShallowReactive, type StyleValue } from "vue"
import { Texts } from "../../texts"
import type { StringFunc } from "../../types"
import { ConverterBase } from "./ConverterBase"
import { RectPosition, RectHelper, ObjectHelper, TimerHelper, CheckboxBehavior, CheckboxBehaviorModel, LanguageBehavior } from '../../helpers'

export type MenuItemModelAction<TSource> = (itemModel: MenuItemModel<TSource>) => any
export type MenuItemModelsAction<TSource> = (itemModels: MenuItemModel<TSource>[]) => any

/** “菜单项目”模型 */
export class MenuItemModel<TSource> extends ConverterBase<TSource> {
    //#region 【Fields】
    /** ID */
    readonly _id = nanoid()
    /** 所属“选择框” */
    readonly _select: SelectModel<TSource>
    /** 点击事件 */
    _onClick?: MenuItemModelAction<TSource>
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否“选中” */
    readonly IsChecked = ref(false)

    //#region [computed]
    /** 是否显示 */
    readonly IsShow = computed(() => {
        return this.Value.value != this._select.Value.value
            && this.IsFuzzyIncludes(this._select.SearchText.value)
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(select: SelectModel<TSource>) {
        super()
        this._select = select
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 点击事件 */
    readonly OnClick = () => {
        if (this._select.IsAllowMultiSelect.value) {
            this.IsChecked.value = !this.IsChecked.value
            return
        }

        this._select.IsOpen.value = false
        this._select.Value.value = this.Value.value

        if (this._onClick) {
            this._onClick(this)
        }
    }
    //#endregion 【Functions】
}

/** “选择框”模型 */
export class SelectModel<TSource> extends ConverterBase<TSource> {
    //#region 【Fields】
    /** “搜索延迟”定时器 */
    private _timer: TimerHelper
    /** 菜单实例
     * （由“Select”内部维护） */
    static _appMenu?: App
    /** 复选框行为
     * （由“Select”内部维护） */
    _checkboxBehavior: CheckboxBehavior
    /** 是否“自动更新” */
    _isAutoUpdate = true
    /** 是否“默认选中首个” */
    _isSelectFirst = false
    /** 是否“默认选中首个”时触发“选择事件” */
    _isSelectFirstEmitOnSelect = true
    /** 初始化后 */
    _onInit?: (select: SelectModel<TSource>) => any
    /** 获取“项目集合” */
    _getItems?: () => TSource[]
    /** 获取“项目集合”（异步）：优先执行该方法 */
    _getItemsAsync?: () => Promise<TSource[]>
    /** 选择后 */
    _onSelect?: MenuItemModelAction<TSource>
    /** 取消选择后 */
    _onUnselect?: VoidFunction
    /** “搜索文本”改变事件 */
    _onSearchTextChange?: StringFunc
    /** “选中状态”改变事件 */
    _onCheckedItemsChange?: MenuItemModelsAction<TSource>
    //#endregion 【Fields】

    //#region 【Props】
    //#region [内部维护]
    private readonly left = ref(0)
    private readonly top = ref(0)
    private readonly bottom = ref(0)
    private readonly isTopOpen = ref(false)
    readonly refRoot = shallowRef<HTMLElement | undefined>()
    readonly refMenu = shallowRef<HTMLElement | undefined>()
    readonly refInput = shallowRef<HTMLElement | undefined>()
    //#endregion [内部维护]

    /** 宽度 */
    readonly Width = ref(208)
    /** 是否“充满父容器” */
    readonly IsFull = ref(false)
    /** 菜单最小高度 */
    readonly MenuMinHeight = ref(30)
    /** 菜单最大高度 */
    readonly MenuMaxHeight = ref(300)
    /** 是否“打开” */
    readonly IsOpen = ref(false)
    /** 是否“启用” */
    readonly IsEnabled = ref(true)
    /** 是否“正在加载” */
    readonly IsLoading = ref(false)
    /** 是否“显示清空” */
    readonly IsShowClear = ref(true)
    /** 是否“全选” */
    readonly IsSelectAll = ref(false)
    /** 是否“允许搜索” */
    readonly IsAllowSearch = ref(false)
    /** 是否“允许多选” */
    readonly IsAllowMultiSelect = ref(false)
    /** 搜索文本
     * （由“MenuItemModel”维护） */
    readonly SearchText = ref('')
    /** 占位文本 */
    readonly Placeholder
    /** 项目集合 */
    readonly Items: ShallowReactive<TSource[]> = shallowReactive([])

    //#region [computed]
    /** “占位”显示文本 */
    readonly ShowPlaceholder
    /** 是否“已选择” */
    readonly IsSelected = computed(() => this.Value.value != undefined || this.CheckedItems.value.length > 0)
    /** 是否“无内容” */
    readonly IsNoContent = computed(() => this.Items.length < 1)
    /** “选中项目”集合 */
    readonly CheckedItems = computed(() => this.ItemModels.value.filter(i => i.IsChecked.value))
    /** “选中值”集合 */
    readonly CheckedValues = computed(() => this.CheckedItems.value.map(i => i.Value.value))
    /** “非全选选中值”集合 */
    readonly NotCheckAllCheckedValues = computed(() => this.IsSelectAll.value ? undefined : this.CheckedValues.value)

    /** 项目集合 */
    readonly ItemModels = computed(() => {
        const itemModels: MenuItemModel<TSource>[] = []

        this.Items.forEach(item => {
            const itemModel = new MenuItemModel<TSource>(this)
            itemModel._onClick = this._onSelect
            itemModel._converter = this._converter
            itemModel.Value.value = item
            itemModels.push(itemModel)
        })

        return itemModels
    })

    /** 根类 */
    readonly RootClass = computed(() => {
        return {
            open: this.IsOpen.value,
            disabled: !this.IsEnabled.value,
            'top-open': this.isTopOpen.value
        }
    })

    /** “宽度”样式 */
    readonly widthStyle = computed((): StyleValue => {
        return {
            width: this.IsFull.value ? '100%' : `${this.Width.value}px`
        }
    })

    /** 箭头样式 */
    readonly arrowStyle = computed((): StyleValue => {
        const arrowAngle = this.IsOpen.value ? -90 : 90
        return {
            transform: `rotate(${arrowAngle}deg)`
        }
    })

    /** 菜单样式 */
    readonly menuStyle = computed((): StyleValue => {
        const obj = {
            width: `${this.Width.value}px`,
            minHeight: `${this.MenuMinHeight.value}px`,
            maxHeight: `${this.MenuMaxHeight.value}px`,
            left: '',
            top: '',
            bottom: '',
            overflow: this.IsLoading.value ? 'hidden' : 'auto'
        }

        if (this.isTopOpen.value) {
            obj.left = `${this.left.value}px`
            obj.bottom = `${this.bottom.value}px`
        } else {
            obj.left = `${this.left.value}px`
            obj.top = `${this.top.value}px`
        }

        return obj
    })

    /** “复选框模型”集合 */
    readonly CheckboxModels = computed(() => {
        return this.ItemModels.value.map(i => new CheckboxBehaviorModel(i, i.IsChecked))
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        super()

        const lbText = new LanguageBehavior(Texts.PleaseSelect)
        this.Placeholder = lbText.Text
        this.ShowPlaceholder = lbText.ShowText

        this._timer = new TimerHelper(this.OnSearchTextChange, 2000, false)

        // 初始化“复选框行为”:
        this._checkboxBehavior = new CheckboxBehavior(
            this.IsSelectAll,
            this.IsAllowMultiSelect,
            this.CheckboxModels
        )

        // 设置“监听”:
        watch(this.SearchText, search => {
            if (!this._onSearchTextChange || search === '') {
                if (this._timer.IsStarted) {
                    this.ClearItems()
                    this._timer.Stop()
                }
                return
            }

            this._timer.Start()
        })

        watch(this.IsOpen, () => {
            this.SearchText.value = ''
            this.UpdateText()
        })

        watch(this.Text, text => {
            if (this.IsOpen.value) {
                this.SearchText.value = text
            }

            if (this.Text.value === '') {
                if (this.IsShowClear.value) {
                    this.Value.value = undefined
                    this._onUnselect?.()
                } else {
                    this.UpdateText()
                }
            }
        })

        watch(this.CheckedItems, () => {
            this._onCheckedItemsChange?.(this.CheckedItems.value)
        })
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly OnSearchTextChange = () => {
        this._onSearchTextChange?.(this.SearchText.value)
    }

    /** 更新“项目集合” */
    readonly UpdateItemsAsync = async () => {
        let arr: TSource[] = []
        if (this._getItemsAsync) {
            arr = await this._getItemsAsync()
            this.Items.splice(0)
            this.Items.push(...arr)
        } else if (this._getItems) {
            arr = this._getItems()
            this.Items.splice(0)
            this.Items.push(...arr)
        }

        if (this.Value.value != undefined
            && !this.Items.some(i => ObjectHelper.IsValueEquals(i, this.Value.value))) {
            this.Value.value = undefined
        }

        if (this._isSelectFirst && !this.IsAllowMultiSelect.value) {
            this.Value.value = this.Items[0]
        }

        this._onInit?.(this)
    }

    /** 更新“菜单位置” */
    readonly UpdateMenuPosition = () => {
        if (!this.IsOpen.value) return

        if (!this.refRoot.value) {
            console.warn('The refRoot is undefined!')
            return
        }

        if (!this.refMenu.value) {
            console.warn('The refMenu is undefined!')
            return
        }

        // 基准矩形:
        const rectRoot = this.refRoot.value.getBoundingClientRect()

        // 菜单矩形:
        const rectMenu = RectHelper.GetWithinWindowRect(rectRoot, this.refMenu.value.offsetWidth, this.refMenu.value.offsetHeight)

        // 设置位置:
        this.isTopOpen.value = rectMenu.Position === RectPosition.Top
        this.left.value = rectRoot.left
        this.top.value = rectRoot.bottom
        this.bottom.value = -rectRoot.top
    }

    /** 设置“项目集合” */
    readonly SetItems = (items: TSource[]) => {
        this.Items.splice(0)
        this.Items.push(...items)
    }

    /** 清空“项目集合” */
    readonly ClearItems = () => {
        this.Items.splice(0)
    }

    /** 全选 */
    readonly SelectAll = () => {
        this.IsSelectAll.value = true
        this.ItemModels.value.forEach(i => i.IsChecked.value = true)
    }

    /** 反选 */
    readonly UnselectAll = () => {
        this.IsSelectAll.value = false
        this.ItemModels.value.forEach(i => i.IsChecked.value = false)
    }

    /** 取消选择 */
    readonly Unselect = () => {
        this.Value.value = undefined
        this.IsOpen.value = false
        this._onUnselect?.()
    }
    //#endregion 【Functions】
}
