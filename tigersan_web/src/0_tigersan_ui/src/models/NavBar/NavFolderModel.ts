import { ref, shallowReactive, type ShallowReactive } from 'vue'
import { NavBarModel } from './NavBarModel'
import { NavItemModel } from './NavItemModel'
import { NavButtonModel } from './NavButtonModel'
import { FolderBehavior } from '../../helpers/Behaviors/FolderBehavior'

export type NavFolderHandler = (folderModel: NavFolderModel) => any

export class NavFolderModel extends NavItemModel {
    //#region 【Fields】
    /** “目录”行为 */
    private readonly _behavior = new FolderBehavior(this.NavBarModel, this)
    //#endregion 【Fields】

    //#region 【Props】
    /** 所属“目录”模型 */
    ParentFolderModel?: NavFolderModel
    /** 是否打开 */
    readonly IsOpen = ref(true)
    /** 子项高度 */
    readonly SubItemsHeight = ref(0)
    /** “按钮”集合 */
    readonly ButtonModels: ShallowReactive<NavButtonModel[]> = shallowReactive([])
    /** “目录”集合 */
    readonly FolderModels: ShallowReactive<NavFolderModel[]> = shallowReactive([])
    //#endregion 【Props】

    //#region 【Events】
    /** 点击后 */
    Clicked?: NavFolderHandler
    /** 打开后 */
    Opened?: NavFolderHandler
    /** 关闭后 */
    Closed?: NavFolderHandler
    //#endregion 【Events】

    //#region 【Ctor】
    constructor(navModel: NavBarModel, parentFolderModel?: NavFolderModel) {
        super(navModel)
        this.ParentFolderModel = parentFolderModel
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 添加“按钮” */
    readonly AddButton = (buttonModel: NavButtonModel) => {
        this.ButtonModels.push(buttonModel)
    }

    /** 添加“文件夹” */
    readonly AddFolder = (folderModel: NavFolderModel) => {
        this.FolderModels.push(folderModel)
    }

    /** 更新“高度” */
    readonly UpdateHeight = () => {
        this._behavior.UpdateHeight()
    }

    /** 更新“旧状态” */
    readonly UpdateOldState = () => {
        this._behavior.UpdateOldState()
    }
    //#endregion 【Functions】
}