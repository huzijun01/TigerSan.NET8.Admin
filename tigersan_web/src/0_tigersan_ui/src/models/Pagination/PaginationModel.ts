import { ref, shallowReactive, watch } from "vue"
import { Int } from "../../base"
import type { NumberFunc } from "../../types"
import { SelectModel } from "../Inputs/SelectModel"
import { PaginationButtonModel } from "./PaginationButtonModel"

export class PaginationModel {
    //#region 【Fields】
    /** 是否“初始化” */
    private _isInit = true
    /** 默认“页大小” */
    static Default_Page_Size = 10
    /** 默认“页大小”集合 */
    static Default_Page_Sizes = [10, 20, 30, 40, 50, 100]
    /** 改变时 */
    _onChange?: (pageSize: number, selectedNum: number) => any
    //#endregion 【Fields】

    //#region 【Props】
    //#region [private]
    /** 上一页“按钮模型” */
    private readonly PrePageButtonModel = new PaginationButtonModel(this)
    /** 下一页“按钮模型” */
    private readonly NextPageButtonModel = new PaginationButtonModel(this)
    /** 最小值“按钮模型” */
    private readonly MinButtonModel = new PaginationButtonModel(this)
    /** 最大值“按钮模型” */
    private readonly MaxButtonModel = new PaginationButtonModel(this)
    /** 上一行“按钮模型” */
    private readonly PreRowButtonModel = new PaginationButtonModel(this)
    /** 下一行“按钮模型” */
    private readonly NextRowButtonModel = new PaginationButtonModel(this)
    //#endregion [private]

    //#region [初始化]
    /** 总数（非负） */
    readonly Count = new Int(0)
    /** 页大小 */
    readonly PageSize = new Int(PaginationModel.Default_Page_Size)
    /** 所选页号 */
    readonly SelectedNum = new Int(1)
    /** 最大显示个数（非负） */
    readonly MaxShowPageCount = new Int(0)
    //#endregion [初始化]

    /** 页文本 */
    readonly PageText = ref('')
    /** “页文本”宽度 */
    readonly PageTextWidth = ref(60)
    /** “页大小”集合
     * （不为空，大于0） */
    readonly PageSizes = shallowReactive(new Array<Int>())
    /** 是否显示“总数” */
    readonly IsShowCount = ref(true)
    /** 是否显示“页大小” */
    readonly IsShowPageSize = ref(true)
    /** 是否显示“页文本框” */
    readonly IsShowPageTextBox = ref(true)
    /** 是否显示“被选行”个数 */
    readonly IsShowSelectedRowCount = ref(false)
    /** “按钮模型”集合
     * （由“PaginationModel”维护） */
    readonly ButtonModels = shallowReactive(new Array<PaginationButtonModel>())
    /** “页大小”的“选择框”模型
     * （由“PaginationModel”维护） */
    readonly PageSizeSelectModel = new SelectModel()

    //#region [引用]
    /** 总行数 */
    get RowCount() {
        return this.GetRowCount()
    }

    /** 总页数 */
    get PageCount() {
        return this.GetPageCount()
    }

    /** 总页数 */
    get PageSizeWidth() {
        return this.PageSizeSelectModel.Width.value
    }
    set PageSizeWidth(width) {
        this.PageSizeSelectModel.Width.value = width
    }
    //#endregion [引用]
    //#endregion 【Props】

    //#region 【Events】
    /** 选中后 */
    get Checked() {
        return this._Checked
    }
    set Checked(value) {
        this._Checked = value
        this.InitEvents()
    }
    private _Checked?: NumberFunc
    //#endregion 【Events】

    //#region 【Ctor】
    constructor() {
        this.PageSizeWidth = 100
        this.InitStableButtons()
        this.InitWatch()
        this.Init()
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    //#region [private]
    /** 初始化“监听” */
    private InitWatch() {
        this.Count._set = this.OnSet
        this.PageSize._set = this.OnSet
        this.SelectedNum._set = this.OnSet
        this.MaxShowPageCount._set = this.OnSet
        watch(this.PageSizes, this.PageSizes_Changed)

        this.PageSizeSelectModel.IsShowClear.value = false
        this.PageSizeSelectModel._onSelect = itemModel => {
            this.PageSize.value = itemModel.Value.value as number
        }
    }

    /** 初始化“按钮模型”集合 */
    private Init() {
        this.CorrectMistakes()

        // 页大小：
        this.PageSizeSelectModel.Value.value = this.PageSize.value

        // 页文本：
        this.UpdatePageText()

        // 行数：
        let rowCount = this.GetRowCount()
        let pageCount = this.GetPageCount()

        // 当前行号：
        let currentRow = this.GetCurrentRow()

        // 起始、结束：
        const start = new Int()
        const end = new Int()
        this.GetStartAndEnd(currentRow, start, end)

        // 页按钮：
        this.PrePageButtonModel.IsEnable.value = this.SelectedNum.value > 1
        this.NextPageButtonModel.IsEnable.value = this.SelectedNum.value < pageCount.value && pageCount.value > 0

        // 行按钮：
        this.PreRowButtonModel.IsShow.value = currentRow.value > 1
        this.NextRowButtonModel.IsShow.value = currentRow.value < rowCount.value

        // 最值按钮：
        this.MinButtonModel.IsShow.value = this.PreRowButtonModel.IsShow.value
        this.MaxButtonModel.IsShow.value = this.NextRowButtonModel.IsShow.value
        this.MaxButtonModel.Num = pageCount.value

        this.InitButtonModels(start, end)
        this.UpdateIsSelected()

        this._onChange?.(this.PageSize.value, this.SelectedNum.value)
    }

    /** 初始化“固定按钮” */
    private InitStableButtons() {
        // 最值按钮：
        this.MinButtonModel.Num = 1

        // 行按钮：
        this.PreRowButtonModel.Text.value = "···"
        this.PreRowButtonModel.HoverText.value = "◁"
        this.PreRowButtonModel._onCheckedInternal = this.PreRowButton_OnChecked

        this.NextRowButtonModel.Text.value = "···"
        this.NextRowButtonModel.HoverText.value = "▷"
        this.NextRowButtonModel._onCheckedInternal = this.NextRowButton_OnChecked

        // 页按钮：
        this.PrePageButtonModel.Text.value = "<"
        this.PrePageButtonModel._onCheckedInternal = this.PrePageButton_OnChecked

        this.NextPageButtonModel.Text.value = ">"
        this.NextPageButtonModel._onCheckedInternal = this.NextPageButton_OnChecked
    }

    /** 初始化“按钮模型”集合 */
    private InitButtonModels(start: Int, end: Int) {
        this.ButtonModels.splice(0)
        if (start.value < 0 || end.value < 0 || start.value > end.value) {
            console.warn('The start or end is out of range!')
            return
        }

        this.ButtonModels.push(this.PrePageButtonModel)
        this.ButtonModels.push(this.MinButtonModel)
        this.ButtonModels.push(this.PreRowButtonModel)

        for (let index = new Int(start.value); index.value <= end.value; index.value++) {
            let buttonModel = new PaginationButtonModel(this)
            buttonModel.Num = index.value
            buttonModel.Checked = this.Checked

            this.ButtonModels.push(buttonModel)
        }

        this.ButtonModels.push(this.NextRowButtonModel)
        this.ButtonModels.push(this.MaxButtonModel)
        this.ButtonModels.push(this.NextPageButtonModel)
    }

    /** 初始化“事件” */
    private InitEvents() {
        this.ButtonModels.forEach(buttonModel => {
            if (buttonModel.Num < 1) return
            buttonModel.Checked = this.Checked
        })
    }

    private CorrectMistakes() {
        this._isInit = false

        if (this.Count.value < 1) // 非负
        {
            this.Count.value = 0
        }

        if (this.SelectedNum.value < 1 || this.SelectedNum.value > this.PageCount.value) // 1 ~ Count
        {
            this.SelectedNum.value = 1
        }

        if (this.MaxShowPageCount.value < 1) // 非负
        {
            this.MaxShowPageCount.value = 7
        }

        if (this.PageSizes.length < 1 || this.PageSizes.some(size => size.value < 1)) // 不为空，大于0
        {
            this.PageSizes.splice(0)
            PaginationModel.Default_Page_Sizes.forEach(size => {
                this.PageSizes.push(new Int(size))
            })
        }

        if (this.PageSize.value < 1) // 非负
        {
            let first = this.PageSizes[0]
            this.PageSize.value = this.GetPageSize(first).value
        }

        this._isInit = true
    }

    /** 更新“是否选中” */
    private UpdateIsSelected() {
        this._isInit = false

        this.ButtonModels.forEach(buttonModel => {
            if (buttonModel.Num === this.SelectedNum.value) {
                if (buttonModel.IsSelected.value != true) {
                    buttonModel.IsSelected.value = true
                }
            }
            else {
                if (buttonModel.IsSelected.value != false) {
                    buttonModel.IsSelected.value = false
                }
            }
        })

        this._isInit = true
    }

    /** 获取“页大小” */
    private GetPageSize(size?: Int): Int {
        return size == undefined ? new Int(PaginationModel.Default_Page_Size) : size
    }

    /** 获取“当前行号” */
    private GetCurrentRow(): Int {
        let currentRow = Int.Div(this.SelectedNum, this.MaxShowPageCount)
        if (Int.Mod(this.SelectedNum, this.MaxShowPageCount) != 0) {
            ++currentRow
        }
        return new Int(currentRow)
    }

    /** 获取“起始”和“结束”值 */
    private GetStartAndEnd(row: Int, start: Int, end: Int) {
        // 行数：
        let rowCount = this.GetRowCount().value
        if (rowCount < 1) {
            start.value = end.value = 1
            return
        }

        // 起始：
        let offset = (row.value - 1) * this.MaxShowPageCount.value
        start.value = offset + 1

        // 剩下的页数：
        let remainingPageCount = this.PageCount.value - start.value + 1

        // 结束：
        if (Int.Div(new Int(remainingPageCount), this.MaxShowPageCount) > 0) {
            end.value = start.value + this.MaxShowPageCount.value - 1
        }
        else {
            end.value = this.PageCount.value
        }
    }

    /** 更新“页文本” */
    private UpdatePageText() {
        this.PageText.value = this.SelectedNum.value.toString()
    }
    //#endregion [private]

    /** 获取“行数” */
    readonly GetRowCount = (): Int => {
        let pageCount = new Int(this.PageCount.value)
        let rowCount = Int.Div(pageCount, this.MaxShowPageCount)
        if (Int.Mod(pageCount, this.MaxShowPageCount) != 0) {
            ++rowCount
        }
        return new Int(rowCount)
    }

    /** 获取“页数” */
    readonly GetPageCount = (): Int => {
        let rowCount = Int.Div(this.Count, this.PageSize)
        if (Int.Mod(this.Count, this.PageSize) != 0) {
            ++rowCount
        }
        return new Int(rowCount)
    }

    /** 跳转到“指定页” */
    readonly GoToPage = () => {
        let pageNum = Number.parseInt(this.PageText.value)
        if (!isNaN(pageNum)) {
            if (pageNum < 1) {
                pageNum = 1
            }
            else if (pageNum > this.PageCount.value) {
                pageNum = this.PageCount.value
            }
            this.SelectedNum.value = pageNum
        }

        this.UpdatePageText()
    }

    /** 获取“所在页号” */
    readonly GetNum = <TSource>(row: TSource, rows: TSource[]): number | undefined => {
        if (rows.length === 0) {
            console.warn('The rows is empty!')
            return undefined
        }

        // 获取“索引”：
        const index = rows.indexOf(row)
        if (index === -1) {
            console.warn('The row is not found in the rows!')
            return undefined
        }

        // 计算页号：
        const pageNum = Math.floor(index / this.PageSize.value) + 1

        // 边界校验：
        const totalPage = this.GetPageCount().value
        return Math.min(Math.max(pageNum, 1), totalPage)
    }

    /** 获取“分页数据” */
    readonly GetPage = <TSource>(rows: TSource[]): TSource[] => {
        const pageSize = this.PageSize.value
        const selectedNum = this.SelectedNum.value

        /** 起始索引 */
        const startIndex = (selectedNum - 1) * pageSize

        // 边界检查
        if (startIndex < 0 || startIndex >= rows.length) {
            console.warn('The startIndex is out of range!')
            return []
        }

        /** 结束索引 */
        const endIndex = Math.min(startIndex + pageSize, rows.length)

        return rows.slice(startIndex, endIndex)
    }

    /** 设置“页大小”集合 */
    readonly SetPageSize = (sizes: number[]) => {
        if (sizes.length < 1) {
            console.warn('The sizes are empty!')
            return
        }

        this.PageSizes.splice(0)
        sizes.forEach(size => this.PageSizes.push(new Int(size)))
        this.PageSizeSelectModel.Value.value = this.PageSize.value = sizes[0] as number
    }
    //#endregion 【Functions】

    //#region 【回调】
    /** 初始化“按钮模型”集合 */
    private readonly OnSet = () => {
        if (!this._isInit) return
        this.Init()
    }

    /** “上一页按钮”被选中 */
    private readonly PrePageButton_OnChecked = () => {
        --this.SelectedNum.value
    }

    /** “下一页按钮”被选中 */
    private readonly NextPageButton_OnChecked = () => {
        ++this.SelectedNum.value
    }

    /** “下一行按钮”被选中 */
    private readonly PreRowButton_OnChecked = () => {
        let currentRow = this.GetCurrentRow()
        --currentRow.value
        // 起始、结束：
        const start = new Int()
        const end = new Int()
        this.GetStartAndEnd(currentRow, start, end)
        this.SelectedNum.value = end.value
    }

    /** “下一行按钮”被选中 */
    private readonly NextRowButton_OnChecked = () => {
        let currentRow = this.GetCurrentRow()
        ++currentRow.value
        // 起始、结束：
        const start = new Int()
        const end = new Int()
        this.GetStartAndEnd(currentRow, start, end)
        this.SelectedNum.value = end.value
    }

    /** “页大小集合”改变后 */
    private readonly PageSizes_Changed = () => {
        this.PageSizeSelectModel.Items.splice(0)

        this.PageSizes.forEach(size => {
            this.PageSizeSelectModel.Items.push(size.value)
        })
    }
    //#endregion 【回调】
}