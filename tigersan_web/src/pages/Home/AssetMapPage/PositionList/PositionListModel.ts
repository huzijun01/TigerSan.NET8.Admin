import { ref, watch, shallowReactive, toRaw, computed, type StyleValue } from "vue"
import { ArrayHelper, PaginationModel } from "@/0_tigersan_ui/tigerui"
import { PositionDto, PositionInfoModel } from "@/models"

/** “位置列表”模型 */
export class PositionListModel<T = unknown> {
    //#region 【Fields】
    /** “数量”监听 */
    readonly watchCount
    /** 分页器 */
    readonly pagination = new PaginationModel()
    /** 点击时 */
    _onClick?: (info: PositionInfoModel<T>) => any
    /** “列表”样式 */
    listStyle: StyleValue = {
        height: `calc(100vh - 360px)`,
    }
    //#endregion 【Fields】

    //#region 【Props】
    /** 总数 */
    readonly Count = ref(0)
    /** “位置”集合 */
    readonly Positions = shallowReactive<PositionDto<T>[]>([])
    /** “位置信息”集合
     * （由“PositionListModel”内部维护） */
    readonly PositionInfoes = shallowReactive<PositionInfoModel<T>[]>([])

    //#region [computed]
    /** “位置”集合 */
    readonly rawPositions = computed(() => toRaw(this.Positions))
    /** 选中的“位置信息” */
    readonly SelectedInfo = computed(() => this.PositionInfoes.find(i => i.IsSelected.value))
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this.pagination.IsShowCount.value = false
        this.pagination.IsShowPageSize.value = false
        this.pagination.IsShowPageTextBox.value = false
        this.watchCount = watch(this.Count, count => this.pagination.Count.value = count)
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 设置“位置”集合 */
    readonly SetPositions = (positions: PositionDto<T>[]) => {
        this.Positions.splice(0)
        this.Positions.push(...positions)
        this.InitInfoes()
    }

    /** 删除“位置” */
    readonly DeletePosition = (position: PositionDto<T>) => {
        ArrayHelper.Delete(this.Positions, position)
        this.InitInfoes()
    }

    /** 删除“位置”集合 */
    readonly DeletePositions = (positions: PositionDto<T>[]) => {
        ArrayHelper.DeleteRange(this.Positions, positions)
        this.InitInfoes()
    }

    /** 跳转到“所在页” */
    readonly GoToPage = (position: PositionDto<T>) => {
        const num = this.pagination.GetNum(position, this.rawPositions.value)
        if (!num) return
        if (this.pagination.SelectedNum.value != num) {
            this.pagination.SelectedNum.value = num
            this.InitInfoes()
        }
        const info = this.PositionInfoes.find(i => toRaw(i.Position) === position)
        this.SetSelectedInfo(info)
    }

    /** 设置“选中的位置信息” */
    readonly SetSelectedInfo = (info?: PositionInfoModel<T>) => {
        const selected = this.SelectedInfo.value
        if (selected) {
            selected.IsSelected.value = false
        }
        if (!info) return
        info.IsSelected.value = true
    }

    /** 初始化“位置信息”集合 */
    readonly InitInfoes = () => {
        const postions = this.rawPositions.value
        this.PositionInfoes.splice(0)
        this.Count.value = this.Positions.length
        this.pagination.GetPage(postions).forEach(position => {
            const info = new PositionInfoModel<T>(position)
            info._onClick = info => {
                this.SetSelectedInfo(info)
                this._onClick?.(info)
            }
            this.PositionInfoes.push(info)
        })
    }
    //#endregion 【Functions】
}