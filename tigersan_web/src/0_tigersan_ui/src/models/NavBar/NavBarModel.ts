import { ref, shallowRef, shallowReactive, type ShallowReactive, type ComputedRef } from 'vue'
import type { NumberAction } from '../../types'
import { NavFolderConfig, CreateNavFolderModel } from './NavConfig'
import { NavButtonModel, type NavButtonHandler } from './NavButtonModel'
import { NavFolderModel, type NavFolderHandler } from './NavFolderModel'
import { FolderBehavior, type IRoot } from '../../helpers/Behaviors/FolderBehavior'

export type TryNavButtonHandler = (buttonModel: NavButtonModel | undefined) => any

export class NavBarModel implements IRoot {
    //#region 【Fields】
    static readonly _defaultFolderModel = () => new NavFolderModel(new NavBarModel())
    static readonly _defaultButtonModel = () => new NavButtonModel(new NavBarModel())
    /** 获取“文件夹”高度
     * （NavBar内部会自动添加回调） */
    _getFolderHeight?: NumberAction
    /** 获取“按钮”高度
     * （NavBar内部会自动添加回调） */
    _getButtonHeight?: NumberAction
    /** 获取“导航栏”宽度
     * （NavBar内部会自动添加回调） */
    _getNavWidth?: NumberAction
    /** “选中按钮”改变后委托
     * （PageView内部会自动添加回调） */
    _onSelectedButtonModelChanged: TryNavButtonHandler | undefined
    //#endregion 【Fields】

    //#region 【Props】
    /** 宽度 */
    readonly Width = ref(220)
    /** 是否打开 */
    readonly IsOpen = ref(true)
    /** “根文件夹”模型 */
    readonly RootFolder: NavFolderModel = new NavFolderModel(this)
    /** 已打开的“按钮模型”集合 */
    readonly OpenedButtonModels: ShallowReactive<NavButtonModel[]> = shallowReactive([])

    get RootFolderTitle(): string {
        return this.RootFolder.ShowTitle.value
    }
    set RootFolderTitle(value: string | ComputedRef<string>) {
        this.RootFolder.Title.value = value
    }

    /** 选中的“按钮模型”
     * （会触发“选中状态”更新） */
    get SelectedButtonModel(): NavButtonModel | undefined {
        return this._SelectedButtonModel.value
    }
    set SelectedButtonModel(value: NavButtonModel | undefined) {
        if (value === this._SelectedButtonModel.value) return
        this._SelectedButtonModel.value = value
        this._onSelectedButtonModelChanged?.(value)
    }
    /** 用于IsSelected计算属性 
     * （请勿直接修改） */
    readonly _SelectedButtonModel = shallowRef<NavButtonModel | undefined>()
    //#endregion 【Props】

    //#region 【Events】
    /** 点击“导航栏开关”按钮 */
    readonly btnNavSwitch_Click = () => {
        this.IsOpen.value = !this.IsOpen.value
    }
    //#endregion 【Events】

    //#region 【Ctor】
    constructor(folder?: NavFolderConfig, rootFolderTitle?: string) {
        if (folder) this.Init(folder)
        if (rootFolderTitle) this.RootFolderTitle = rootFolderTitle
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 递归操作“项目”集合 */
    readonly RecursivelyOperateItems = (
        fnFolder: NavFolderHandler | undefined,
        fnButton: NavButtonHandler | undefined = undefined,
        isIncludeNotShowFolder: boolean = true) => {
        FolderBehavior.RecursivelyOperateSubItems(this.RootFolder, fnFolder, fnButton, isIncludeNotShowFolder)
    }

    /** 初始化 */
    readonly Init = (folder: NavFolderConfig) => {
        // 状态:
        this.OpenedButtonModels.splice(0)
        this.SelectedButtonModel = undefined
        // 内容:
        let folderModel = CreateNavFolderModel(this, folder)
        this.RootFolder.FolderModels.splice(0)
        this.RootFolder.FolderModels.push(...folderModel.FolderModels)
        this.RootFolder.ButtonModels.splice(0)
        this.RootFolder.ButtonModels.push(...folderModel.ButtonModels)
        folderModel.FolderModels.forEach(f => f.ParentFolderModel = this.RootFolder)
        folderModel.ButtonModels.forEach(b => b.ParentFolderModel = this.RootFolder)
        this.UpdateHeight()
    }

    /** 获取“文件夹” */
    readonly GetFolder = () => {
        return new NavFolderModel(this)
    }

    /** 获取“按钮” */
    readonly GetButton = () => {
        return new NavButtonModel(this, this.RootFolder)
    }

    /** 添加“文件夹” */
    readonly AddFolder = (folderModel: NavFolderModel) => {
        this.RootFolder.FolderModels.push(folderModel)
    }

    /** 添加“按钮” */
    readonly AddButton = (buttonModel: NavButtonModel) => {
        this.RootFolder.ButtonModels.push(buttonModel)
    }

    /** 更新“高度” */
    readonly UpdateHeight = () => {
        FolderBehavior.RecursivelyOperateSubItems(this.RootFolder, folderModel => {
            folderModel.UpdateHeight()
        })
    }
    //#endregion 【Functions】
}