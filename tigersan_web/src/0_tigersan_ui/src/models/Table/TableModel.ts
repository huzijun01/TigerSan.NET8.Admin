import { nanoid } from 'nanoid'
import { ref, watch, computed, toRaw, shallowRef, shallowReactive, type StyleValue, type ComputedRef, type ShallowReactive } from "vue"
import { Colors, Theme } from '../../base'
import { TextModel } from '../Text/TextModel'
import { SelectModel } from '../Inputs/SelectModel'
import type { TStringGetter, UnknownSetter, ObjectArrayFunc, TStringGetterAsync, TGetter } from '../../types'
import { ObjectHelper, CheckboxBehaviorModel, CheckboxBehavior, ArrayHelper, ConfigBase, SizeBehavior, LanguageBehavior, WatchBehavior, config } from '../../helpers'

export type TableItemFunc<T extends object> = (itemModel: TableItemModel<T>) => any
export type TableHeaderFunc<T extends object> = (itemModel: TableHeaderModel<T>) => any

/** 文本对齐 */
export enum TextAlign {
    Left = 'left',
    Right = 'right',
    Center = 'center',
    Justify = 'justify'
}

/** “项目”类型 */
export enum ItemType {
    Link,
    TextBox,
    Textarea,
}

/** “表格”配置 */
export class TableModel<TSource extends object> {
    //#region 【Fields】
    /** “地区”监听器 */
    readonly watchLocale
    /** 尺寸行为 */
    readonly _sizeBehavior = new SizeBehavior()
    /** 是否“自动刷新” */
    _isAutoRefresh = true
    /** “列头配置”集合 */
    _headerConfigs: TableHeaderConfig<TSource>[]
    /** 列头背景
     * （防止tbody中的内容透过） */
    _headerBackground: String = Theme.TableHeaderBackground
    /** 复选框行为
     * （由“TableModel”维护） */
    _checkboxBehavior: CheckboxBehavior
    /** 初始化“项目” */
    _initItem?: TableItemFunc<TSource>
    /** 初始化“列头” */
    _initHeader?: TableHeaderFunc<TSource>
    /** 初始化“行模型”后 */
    _onInitRowModels?: (rowDatas: TSource[]) => any
    /** 初始化“列头模型”后 */
    _onInitHeaderModels?: (headers: TableHeaderModel<TSource>[]) => any
    /** “项目文本”输入 */
    _onItemTextInput?: TableItemFunc<TSource>
    /** “项目文本”改变 */
    _onItemTextChange?: TableItemFunc<TSource>
    /** “选中状态”改变 */
    _onSelectStateChange?: ObjectArrayFunc
    /** “筛选状态”改变 */
    _onSlotChange?: (header?: TableHeaderModel<TSource>, isAscending?: boolean) => any
    //#endregion 【Fields】

    //#region 【Props】
    /** “行数据”集合 */
    readonly RowDatas: ShallowReactive<TSource[]> = shallowReactive([])
    /** “列头模型”集合 */
    readonly HeaderModels: ShallowReactive<TableHeaderModel<TSource>[]> = shallowReactive([])
    /** “行模型”集合 */
    readonly RowModels: ShallowReactive<TableRowModel<TSource>[]> = shallowReactive([])
    /** 是否“填充父容器” */
    readonly IsFill = ref(true)
    /** 是否“正在加载” */
    readonly IsLoading = ref(false)
    /** 是否“全选” */
    readonly IsSelectAll = ref(false)
    /** 是否“显示复选框” */
    readonly IsShowCheckBox = ref(true)
    /** 是否“允许多选” */
    readonly IsAllowMultiSelect = ref(true)

    //#region [内部维护]
    /** 复选框 */
    readonly refCheckbox = this._sizeBehavior.refRoot
    /** “复选框”宽度 */
    readonly CheckboxWidth = this._sizeBehavior.ActualWidth
    /** 是否“升序” */
    readonly IsAscending = ref(true)
    /** 筛选列头 */
    readonly SlotHeader = shallowRef<TableHeaderModel<TSource> | undefined>()
    //#endregion [内部维护]

    //#region [computed]
    /** 行数 */
    readonly Count = computed(() => this.RowDatas.length)
    /** “被选行”个数 */
    readonly SelectedRowCount = computed(() => this.SelectedRowDatas.value.length)
    /** “被选中”的“行数据”集合 */
    readonly SelectedRowDatas = computed(() => this.RowModels.filter(r => r.IsChecked.value).map(r => r._rowData))
    /** “复选框模型”集合 */
    readonly CheckboxModels = computed(() => this.RowModels.map(i => new CheckboxBehaviorModel(i, i.IsChecked)))
    /** “根元素”类名 */
    readonly RootClass = computed(() => {
        return {
            fill: this.IsFill.value,
            loading: this.IsLoading.value,
        }
    })
    /** 是否“已选中” */
    readonly IsSelected = computed(() => this.SelectedRowDatas.value.length > 0)
    /** 是否“已单选” */
    readonly IsOnlySelected = computed(() => this.SelectedRowDatas.value.length === 1)
    /** 是否“显示全选复选框” */
    readonly IsShowSelectAllCheckBox = computed(() => this.IsShowCheckBox && this.IsAllowMultiSelect.value)
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(headerConfigs: TableHeaderConfig<TSource>[]) {
        this._headerConfigs = headerConfigs

        // 监听“源数据”集合:
        watch(this.RowDatas, () => {
            if (this._isAutoRefresh) {
                this.Refresh()
            }
        })

        this.watchLocale = new WatchBehavior(config.Locale, () => this.UpdateTexts())

        // 初始化“复选框行为”:
        this._checkboxBehavior = new CheckboxBehavior(
            this.IsSelectAll,
            this.IsAllowMultiSelect,
            this.CheckboxModels
        )
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 刷新 */
    readonly Refresh = (isInitHeaderModels: boolean = false) => {
        if (isInitHeaderModels) {
            this.InitHeaderModels()
        }
        this.InitRowModel()
    }

    /** 初始化“列头模型”集合 */
    readonly InitHeaderModels = () => {
        this.HeaderModels.splice(0)

        this._headerConfigs.forEach(headerConfig => {
            const headerModel = new TableHeaderModel(this, headerConfig._propName)
            SetTableHeaderModel(headerModel, headerConfig)
            if (this._initHeader) this._initHeader(headerModel) // 初始化
            this.HeaderModels.push(headerModel)
        })

        this._onInitHeaderModels?.(toRaw(this.HeaderModels))
    }

    /** 初始化“行模型” */
    readonly InitRowModel = () => {
        this.RowModels.splice(0)

        this.RowDatas.forEach(rowData => {
            const rowModel = new TableRowModel(this, rowData)
            this.RowModels.push(rowModel)

            this.HeaderModels.forEach(headerModel => {
                const itemModel = new TableItemModel(headerModel, rowModel)
                this._initItem?.(itemModel) // 初始化
                rowModel.ItemModels.push(itemModel)
            })
        })

        this.IsSelectAll.value = false
        this._onInitRowModels?.(toRaw(this.RowDatas))
    }

    /** 更新“文本”  */
    readonly UpdateTexts = () => {
        this.RowModels.forEach(rowModel => {
            rowModel.ItemModels.forEach(itemModel => {
                itemModel.UpdateText()
                this._initItem?.(itemModel) // 初始化
            })
        })
    }

    /** 更新“行数据”集合  */
    readonly UpdateRowDatas = (newRowDatas: TSource[], predicate: (rowData: TSource, newRowData: TSource) => boolean) => {
        newRowDatas.forEach(newRowData => {
            const rowData = this.RowDatas.find(r => predicate(r, newRowData))
            if (!rowData) {
                console.warn('The rowData is undefined!')
                return
            }
            ObjectHelper.ShallowSet(newRowData, rowData)
        })

        this.UpdateTexts()
    }

    /** 触发“选中状态”改变 */
    readonly RiseOnSelectStateChange = () => {
        if (!this._onSelectStateChange) return
        this._onSelectStateChange(this.SelectedRowDatas.value)
    }

    /** 设置“行数据”集合 */
    readonly SetRowDatas = (rowDatas: TSource[]) => {
        this.RowDatas.splice(0)
        this.RowDatas.push(...rowDatas)
    }

    /** 删除“行数据” */
    readonly DeleteRowData = (rowData: TSource) => {
        ArrayHelper.Delete(this.RowDatas, rowData)
    }

    /** 设置“筛选列头”
     * （建议在“_onInitHeaderModels”中调用） */
    readonly SetSlotHeader = (propName: string, isAscending: boolean = true) => {
        const find = this.HeaderModels.find(i => i._propName === propName)
        if (!find) {
            console.warn('The find is undefined!')
            return
        }
        this.SlotHeader.value = find
        this.IsAscending.value = isAscending
    }
    //#endregion 【Functions】
}

/** “行”配置 */
export class TableRowModel<TSource extends object> {
    //#region 【Fields】
    _id = nanoid()
    /** 行数据 */
    _rowData: TSource
    /** 所属“表格”配置 */
    _tableModel: TableModel<TSource>
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否“选中” */
    readonly IsChecked = ref(false)
    /** “项目模型”集合 */
    readonly ItemModels: ShallowReactive<TableItemModel<TSource>[]> = shallowReactive([])

    //#region [computed]
    /** “选中”类名 */
    readonly SelectClass = computed(() => { return { 'select': this.IsChecked.value } })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(tableModel: TableModel<TSource>, rowData: TSource) {
        this._rowData = rowData
        this._tableModel = tableModel
    }
    //#endregion 【Ctor】
}

/** “项目”配置 */
export class TableItemModel<TSource extends object> {
    //#region 【Fields】
    _id = nanoid()
    _headerModel: TableHeaderModel<TSource>
    _rowModel: TableRowModel<TSource>
    get _tableModel(): TableModel<TSource> {
        return this._headerModel._tableModel
    }
    //#endregion 【Fields】

    //#region 【Props】
    /** 文本 */
    readonly Text = ref('')
    /** 是否只读 */
    readonly IsReadonly = computed(() => this._headerModel.IsReadonly.value)
    /** 颜色 */
    readonly Color = ref('')
    /** 背景 */
    readonly Background = ref(Colors.Transparent)

    //#region [computed]
    /** 是否为“链接” */
    readonly IsLink = computed(() => this._headerModel.Type.value === ItemType.Link)
    /** 是否为“文本框” */
    readonly IsTextBox = computed(() => this._headerModel.Type.value === ItemType.TextBox)
    /** 是否为“文本域” */
    readonly IsTextarea = computed(() => this._headerModel.Type.value === ItemType.Textarea)
    /** 是否“选中” */
    readonly IsChecked = computed(() => this._rowModel.IsChecked.value)
    /** “选中”类名 */
    readonly SelectClass = computed(() => { return { 'select': this.IsChecked.value } })
    /** “省略号”类名 */
    readonly EllipsisClass = computed(() => {
        return { ellipsis: this._headerModel.Type.value != ItemType.Textarea }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(headerModel: TableHeaderModel<TSource>, rowModel: TableRowModel<TSource>) {
        this._headerModel = headerModel
        this._rowModel = rowModel
        this.UpdateText()
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 项目文本输入
     * （由“TableItem”内部调用） */
    readonly _onItemTextInput = () => {
        if (this._tableModel._onItemTextInput) {
            this._tableModel._onItemTextInput(this)
        }
    }

    /** 项目文本改变
     * （由“TableItem”内部调用） */
    readonly _onItemTextChange = () => {
        if (this._tableModel._onItemTextChange) {
            this._tableModel._onItemTextChange(this)
        }
    }

    /** 更新“文本” 
     * “TableItem”内部会自动调用 */
    readonly UpdateText = () => {
        this._headerModel.GetText(this._rowModel._rowData)
            .then(text => this.Text.value = text)
    }

    /** 修改“行数据” */
    readonly SetRowData = () => {
        this._headerModel.SetRowData(this._rowModel._rowData)
    }

    /** 获取“源数据” */
    readonly GetSource = (): unknown => {
        return this._headerModel._getSource(this._rowModel._rowData, this._headerModel._propName)
    }

    /** 点击后 */
    readonly OnClick = () => {
        this._headerModel._onItemClick?.(this)
        this._headerModel._onItemClickAsync?.(this)
    }
    //#endregion 【Functions】
}

/** “列头”模型 */
export class TableHeaderModel<TSource extends object> {
    //#region 【Fields】
    readonly _id = nanoid()
    /** 尺寸行为 */
    readonly _sizeBehavior = new SizeBehavior()
    /** 属性名 */
    _propName = ''
    /** 所属“表格”配置 */
    _tableModel: TableModel<TSource>
    /** “源数据”获取方法 */
    _getSource: TGetter<TSource, unknown> = ObjectHelper.DefaultTGetter
    /** “文本”获取方法 */
    _getString: TStringGetter<TSource> = ObjectHelper.DefaultStringGetter
    /** “文本”获取方法（异步）：优先执行该方法 */
    _getStringAsync?: TStringGetterAsync<TSource>
    /** “对象”修改方法 */
    _setObject: UnknownSetter = ObjectHelper.DefaultTSetter
    /** “项目”点击后 */
    _onItemClick?: (itemModel: TableItemModel<TSource>) => any
    /** “项目”点击后（异步） */
    _onItemClickAsync?: (itemModel: TableItemModel<TSource>) => Promise<void>
    //#endregion 【Fields】

    //#region 【Props】
    /** 类型 */
    readonly Type = ref(ItemType.Textarea)
    /** 文本 */
    readonly Text
    /** 显示文本 */
    readonly ShowText
    /** 宽度 */
    readonly Width = ref<number | undefined>()
    /** 文本对齐 */
    readonly TextAlign = ref(TextAlign.Center)
    /** 是否“显示” */
    readonly IsShow = ref(true)
    /** 是否“冻结” */
    readonly IsFreeze = ref(false)
    /** 是否“只读” */
    readonly IsReadonly = ref(true)
    /** 是否“必须” */
    readonly IsRequired = ref(true)
    /** 是否“显示筛选” */
    readonly IsShowSlot = ref(false)

    //#region [内部维护]
    /** 根元素 */
    readonly refRoot = this._sizeBehavior.refRoot
    /** 实际宽度 */
    readonly ActualWidth = this._sizeBehavior.ActualWidth
    /** 实际高度 */
    readonly ActualHeight = this._sizeBehavior.ActualHeight
    //#endregion [内部维护]

    //#region [computed]
    /** "冻结"样式 */
    readonly FreezeStyle = computed((): StyleValue => {
        if (!this.IsFreeze.value) return {}

        const table = this._tableModel
        let offset = table.IsShowCheckBox.value ? table.CheckboxWidth.value : 0

        const headers = table.HeaderModels
        for (let i = 0; i < headers.length; ++i) {
            const header = headers[i]
            if (!header || header._propName === this._propName) break
            if (!header.IsFreeze.value || !header.IsShow.value) continue
            offset += header.ActualWidth.value ?? 0
        }

        return {
            position: 'sticky' as const,
            left: `${offset}px`,
            zIndex: 1,
            background: table._headerBackground as any
        }
    })

    /** “单元格”样式 */
    readonly CellStyle = computed((): StyleValue => {
        const freeze = this.FreezeStyle.value as object
        return {
            display: this.IsShow.value ? undefined : 'none',
            width: this.Width.value != undefined ? `${this.Width.value}px` : 'auto',
            ...freeze
        }
    })

    /** 是否“排序” */
    readonly IsSlot = computed(() => this._tableModel.SlotHeader.value === this)

    /** “升序”样式 */
    readonly AscClass = computed(() => {
        return {
            active: this.IsSlot.value && this._tableModel.IsAscending.value
        }
    })

    /** “降序”样式 */
    readonly DescClass = computed(() => {
        return {
            active: this.IsSlot.value && !this._tableModel.IsAscending.value
        }
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(tableModel: TableModel<TSource>, propName: string) {
        this._propName = propName
        this._tableModel = tableModel

        const lbText = new LanguageBehavior('null')
        this.Text = lbText.Text
        this.ShowText = lbText.ShowText
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 获取“文本” */
    readonly GetText = async (rowData: TSource): Promise<string> => {
        // 检验“属性是否存在”:
        if (this._propName === '') {
            return ''
        }
        else if (this.IsRequired.value && !(this._propName in rowData)) {
            console.warn(`The rowData does not contain the ${this._propName} field!`)
            return ''
        }

        // 修改“文本”:
        if (this._getStringAsync) {
            return await this._getStringAsync(rowData, this._propName)
        } else {
            return this._getString(rowData, this._propName)
        }
    }

    /** 修改“行数据” */
    readonly SetRowData = (rowData: TSource) => {
        // 检验“属性是否存在”:
        if (this._propName === '') {
            return
        }
        else if (this.IsRequired.value && !(this._propName in rowData)) {
            console.warn(`The rowData does not contain the ${this._propName} field!`)
            return
        }

        // 修改“行数据”:
        this._setObject(rowData, this._propName, this.Text.value)
    }

    /** 点击“排序按钮”后 */
    readonly OnSlotClick = () => {
        let header: TableHeaderModel<TSource> | undefined
        let isAscending: boolean | undefined

        if (this.IsSlot.value) {
            if (this._tableModel.IsAscending.value) {
                header = this
                isAscending = this._tableModel.IsAscending.value = false
            } else {
                header = isAscending = this._tableModel.SlotHeader.value = undefined
                this._tableModel.IsAscending.value = true
            }
        } else {
            header = this._tableModel.SlotHeader.value = this
            isAscending = this._tableModel.IsAscending.value = true
        }

        this._tableModel._onSlotChange?.(header, isAscending)
    }
    //#endregion 【Functions】
}

/** “列头”配置 */
export class TableHeaderConfig<TSource extends object> {
    /** 属性名 */
    _propName: string
    /** “源数据”获取方法 */
    _getSource?: TGetter<TSource, unknown>
    /** “文本”获取方法 */
    _getString?: TStringGetter<TSource>
    /** “文本”获取方法（异步）：优先执行该方法 */
    _getStringAsync?: TStringGetterAsync<TSource>
    /** “对象”修改方法 */
    _setObject?: UnknownSetter
    /** “项目”点击后 */
    _onItemClick?: (itemModel: TableItemModel<TSource>) => any
    /** “项目”点击后（异步） */
    _onItemClickAsync?: (itemModel: TableItemModel<TSource>) => Promise<void>
    /** 类型 */
    Type?: ItemType
    /** 文本 */
    Text?: string | ComputedRef<string>
    /** 宽度 */
    Width?: number
    /** 文本对齐 */
    TextAlign?: TextAlign
    /** 是否“显示” */
    IsShow?: boolean
    /** 是否“冻结” */
    IsFreeze?: boolean
    /** 是否“只读” */
    IsReadonly?: boolean
    /** 是否“必须” */
    IsRequired?: boolean
    /** 是否“显示筛选” */
    IsShowSlot?: boolean

    //#region 【Ctor】
    constructor(propName: string) {
        this._propName = propName
    }
    //#endregion 【Ctor】
}

/** 将“配置”设置到“模型” */
export function SetTableHeaderModel<TSource extends object>(model: TableHeaderModel<TSource>, config: TableHeaderConfig<TSource>) {
    model._propName = config._propName
    if (config._getSource) model._getSource = config._getSource
    if (config._getString) model._getString = config._getString
    if (config._getStringAsync) model._getStringAsync = config._getStringAsync
    if (config._setObject) model._setObject = config._setObject
    if (config._onItemClick) model._onItemClick = config._onItemClick
    if (config._onItemClickAsync) model._onItemClickAsync = config._onItemClickAsync
    if (config.Type != undefined) model.Type.value = config.Type
    if (config.Text != undefined) model.Text.value = config.Text
    if (config.Width != undefined) model.Width.value = config.Width
    if (config.TextAlign != undefined) model.TextAlign.value = config.TextAlign
    if (config.IsShow != undefined) model.IsShow.value = config.IsShow
    if (config.IsFreeze != undefined) model.IsFreeze.value = config.IsFreeze
    if (config.IsReadonly != undefined) model.IsReadonly.value = config.IsReadonly
    if (config.IsRequired != undefined) model.IsRequired.value = config.IsRequired
    if (config.IsShowSlot != undefined) model.IsShowSlot.value = config.IsShowSlot
}

/** “列筛选”选择器类型 */
export class ColumnSelectModel<TSource extends object> extends SelectModel<TableHeaderModel<TSource>> {
    //#region 【Fields】
    /** 是否更新 */
    private _isUpdate = true
    /** 表格 */
    private _table: TableModel<TSource>
    /** 配置 */
    private _config: ConfigBase<string[]>
    //#endregion 【Fields】

    //#region 【Props】
    /** “可见表头”集合 */
    private get VisibleHeaders() {
        return this._table.HeaderModels.filter(h => h.IsShow.value)
    }
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(
        table: TableModel<TSource>,
        configKey: string,
        width: number = 120) {
        super()
        this._table = table
        this._config = new ConfigBase<string[]>(configKey, [])

        // 基础设置:
        this.Width.value = width
        this.IsAllowMultiSelect.value = true
        this.Placeholder.value = TextModel.Computed('Columns', '列筛选')
        this._converter = header => header.ShowText.value

        // 初始化“Items”:
        this._table._onInitHeaderModels = headers => {
            let config = this._config.Get()
            if (config.length < 1) {
                this._config.Save(headers.map(h => h._propName))
                config = this._config.Get()
            }

            this._table.HeaderModels.forEach(h => h.IsShow.value = config.includes(h._propName))

            this.Items.splice(0)
            this.Items.push(...headers)
            this._isUpdate = false
            this.ItemModels.value.forEach(m => m.IsChecked.value = m.Value.value?.IsShow.value ?? false)
            this._isUpdate = true
        }

        // 监听“选中状态”改变:
        this._onCheckedItemsChange = items => {
            if (!this._isUpdate) return

            this._table.HeaderModels.forEach(h => {
                const item = items.find(i => i.Value.value?._id === h._id)
                h.IsShow.value = item?.IsChecked.value ?? false
            })

            this._config.Save(this.VisibleHeaders.map(h => h._propName))
        }
    }
    //#endregion 【Ctor】
}

/** “行数据”模型 */
export class RowDataModel<TSource extends object> {
    //#region 【Fields】
    /** “列头配置”集合 */
    readonly table
    //#endregion 【Fields】

    //#region 【Props】
    /** 数据 */
    readonly Data = shallowRef<TSource | undefined>()
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(table: TableModel<TSource>) {
        this.table = table
        this.table.InitHeaderModels()
        watch(this.Data, data => {
            this.table.RowDatas.splice(0)
            if (data) this.table.RowDatas.push(data)
        })
    }
    //#endregion 【Ctor】
}