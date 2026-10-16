import { computed, ref, watch, type Component } from 'vue'
import { Icons } from '../../base'
import { NavBarModel } from './NavBarModel'
import { NavItemModel } from './NavItemModel'
import { NavFolderModel } from './NavFolderModel'

export type NavButtonHandler = (buttonModel: NavButtonModel) => any

export class NavButtonModel extends NavItemModel {
    //#region 【Fields】
    /** 组件 */
    _component?: Component
    //#endregion 【Fields】

    //#region 【Props】
    /** 所属“目录”模型 */
    ParentFolderModel?: NavFolderModel
    /** 是否显示关闭按钮 */
    IsShowCloseButton = ref(true)
    /** 是否选中 */
    IsSelected = computed(() => {
        return this.NavBarModel._SelectedButtonModel.value === this
    })
    /** 是否打开 */
    IsOpened = computed(() => {
        return this.NavBarModel.OpenedButtonModels.some(b => b === this)
    })
    //#endregion 【Props】

    //#region 【Events】
    /** 点击后 */
    Clicked?: NavButtonHandler
    /** 选中后 */
    Checked?: NavButtonHandler
    /** “是否选中”改变后 */
    IsSelectedChanged?: NavButtonHandler
    //#endregion 【Events】

    //#region 【Ctor】
    constructor(
        navModel: NavBarModel,
        parentFolderModel?: NavFolderModel,
        component?: Component
    ) {
        super(navModel)
        this._component = component
        this.Icon.value = Icons.File_Linear
        this.ParentFolderModel = parentFolderModel
        watch(this.IsSelected, () => { this.IsSelectedChanged?.(this) })
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    //#endregion 【Functions】
}