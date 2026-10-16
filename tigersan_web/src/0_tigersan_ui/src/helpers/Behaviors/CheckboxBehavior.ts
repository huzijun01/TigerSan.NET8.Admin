import { watch, type Ref, type ComputedRef, type WatchHandle } from 'vue'

/** “复选框行为”模型 */
export class CheckboxBehaviorModel {
    //#region 【Fields】
    /** “选中状态”监听 */
    private _watchIsChecked?: WatchHandle
    /** 行模型 */
    _itemModel: object
    /** “选中状态”改变后
     * （由“CheckboxBehavior”传入） */
    _onIsCheckedChanged?: (itemModel?: object) => any
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否“选中” */
    readonly IsChecked: Ref<boolean>
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(
        itemModel: object,
        isChecked: Ref<boolean>,
    ) {
        this._itemModel = itemModel
        this.IsChecked = isChecked
        this.StartWatch()
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly StartWatch = () => {
        this._watchIsChecked?.stop()
        this._watchIsChecked = watch(this.IsChecked, () => {
            this._onIsCheckedChanged?.(this._itemModel)
        })
    }

    readonly StopWatch = () => {
        this._watchIsChecked?.stop()
    }
    //#endregion 【Functions】
}

/** “复选框”行为 */
export class CheckboxBehavior {
    //#region 【Fields】
    /** 是否“联动” */
    private _isJoint = true
    /** “全选状态”监听 */
    private _watchIsSelectAll: WatchHandle
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否“全选” */
    readonly IsSelectAll
    /** 是否“允许多选” */
    readonly IsAllowMultiSelect
    /** “复选框模型”集合 */
    readonly CheckboxModels
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(
        isSelectAll: Ref<boolean>,
        isAllowMultiSelect: Ref<boolean>,
        checkboxModels: ComputedRef<CheckboxBehaviorModel[]>,
    ) {
        this.IsSelectAll = isSelectAll
        this.CheckboxModels = checkboxModels
        this.IsAllowMultiSelect = isAllowMultiSelect
        watch(this.CheckboxModels, this.InitState)
        watch(this.IsAllowMultiSelect, this.InitState)
        this._watchIsSelectAll = this.InitIsSelectAllWatch()
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    //#region [private]
    private InitIsSelectAllWatch = () => watch(this.IsSelectAll, this.onIsSelectAllChanged)

    /** 取消选择“其它复选框” */
    private UncheckOtherCheckboxs = (itemModel?: object) => {
        this.CheckboxModels.value.forEach(c => {
            if (c._itemModel === itemModel) return
            c.StopWatch()
            c.IsChecked.value = false
            c.StartWatch()
        })
    }

    /** 初始化“状态" */
    private InitState = () => {
        this.CheckboxModels.value.forEach(c => c._onIsCheckedChanged = this.onIsCheckedChanged)
    }

    /** “全选状态”改变后 */
    private onIsSelectAllChanged = (isSelectAll: boolean) => {
        if (!this._isJoint || !this.IsAllowMultiSelect.value) return

        this._isJoint = false

        this.CheckboxModels.value.forEach(c => c.IsChecked.value = isSelectAll)

        this._isJoint = true
    }

    /** “选中状态”改变后 */
    private onIsCheckedChanged = (itemModel?: object) => {
        if (!this._isJoint) return

        this._isJoint = false

        if (!this.IsAllowMultiSelect.value) {
            this.UncheckOtherCheckboxs(itemModel)
        }

        this._watchIsSelectAll.stop()
        this.IsSelectAll.value = this.CheckboxModels.value.every(cm => cm.IsChecked.value)
        this._watchIsSelectAll = this.InitIsSelectAllWatch()

        this._isJoint = true
    }
    //#endregion [private]

    /** 反转“全选状态” */
    Toggle = () => {
        this.IsSelectAll.value = !this.IsSelectAll.value
    }
    //#endregion 【Functions】
}