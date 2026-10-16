import { ref } from "vue"
import { nanoid } from 'nanoid'
import { PaginationModel } from "./PaginationModel"
import { Int } from "../../base"
import type { Action, NumberFunc } from "../../types"

export class PaginationButtonModel {
    //#region 【Fields】
    _id = nanoid()
    /** 获取“所选数字”
     * （由“PaginationModel”传入） */
    _pagination: PaginationModel
    /** “选中后”内部回调
     * （由“PaginationModel”传入） */
    _onCheckedInternal?: Action
    //#endregion 【Fields】

    //#region 【Props】
    /** 文本 */
    readonly Text = ref('1')
    /** 悬浮文本 */
    readonly HoverText = ref('')
    /** 是否“显示” */
    readonly IsShow = ref(true)
    /** 是否“被选中” */
    readonly IsSelected = ref(false)
    /** 是否“启用” */
    readonly IsEnable = ref(true)

    //#region [引用]
    /** 数字 */
    get Num(): number {
        let int = new Int()
        int.value = Number.parseInt(this.Text.value)
        return int.value
    }
    set Num(int: number) {
        this.Text.value = int.toString()
    }
    //#endregion [引用]
    //#endregion 【Props】

    //#region 【Events】
    /** 选中后 */
    Checked?: NumberFunc
    //#endregion 【Events】

    //#region 【Ctor】
    constructor(pagination: PaginationModel) {
        this._pagination = pagination
        this._onCheckedInternal = this.NormalButton_OnCheckedInternal
    }
    //#endregion 【Ctor】

    //#region 【回调】
    /** “普通按钮”被选中 */
    private readonly NormalButton_OnCheckedInternal = () => {
        this._pagination.SelectedNum.value = this.Num
    }
    //#endregion 【回调】
}