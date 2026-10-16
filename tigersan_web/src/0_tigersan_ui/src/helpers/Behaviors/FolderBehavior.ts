import { type Ref } from "vue"
import type { NumberAction } from "../../types"

export type FolderHandler<TFolder extends IFolder> = (folderModel: TFolder) => any
export type ButtonHandler<TButton extends IButton> = (buttonModel: TButton) => any

export class SubItemCount {
    FolderCount = 0
    ButtonCount = 0
}

export interface IButton {
    /** 所属“目录”模型 */
    ParentFolderModel?: IFolder
    /** 是否“允许显示” */
    IsAllowShow: Ref<boolean>
    /** 是否“具有权限” */
    IsHasAuthority?: Ref<boolean>
}

export interface IFolder {
    /** “目录”集合 */
    FolderModels: IFolder[]
    /** “按钮”集合 */
    ButtonModels?: IButton[]
    /** 所属“目录”模型 */
    ParentFolderModel?: IFolder
    /** 子项高度 */
    SubItemsHeight: Ref<number>
    /** 是否打开 */
    IsOpen: Ref<boolean>
    /** 是否“允许显示” */
    IsAllowShow: Ref<boolean>
    /** 是否“具有权限” */
    IsHasAuthority?: Ref<boolean>
}

export interface IRoot {
    /** 获取“文件夹”高度
     * （组件内部会自动添加回调） */
    _getFolderHeight?: NumberAction
    /** 获取“按钮”高度
     * （组件内部会自动添加回调） */
    _getButtonHeight?: NumberAction
}

/** “文件夹”行为 */
export class FolderBehavior<TRoot extends IRoot, TFolder extends IFolder> {
    //#region 【Fields】
    private _oldHeight: number = -1
    private _oldIsOpened: boolean = true
    private _rootModel: TRoot
    private _folderModel: TFolder
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor(
        rootModel: TRoot,
        folderModel: TFolder) {
        this._rootModel = rootModel
        this._folderModel = folderModel
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 递归操作“子项”集合（不包含根目录） */
    static RecursivelyOperateSubItems<TFolder extends IFolder, TButton extends IButton>(
        rootFolder: TFolder,
        fnFolder: FolderHandler<TFolder> | undefined,
        fnButton: ButtonHandler<TButton> | undefined = undefined,
        isIncludeNotShowItem: boolean = true) {
        if (!isIncludeNotShowItem && (!rootFolder.IsAllowShow.value || !rootFolder.IsOpen.value)) return

        // 子目录：
        for (const subFolderModel of rootFolder.FolderModels) {
            fnFolder?.(subFolderModel as TFolder)
            FolderBehavior.RecursivelyOperateSubItems(subFolderModel as TFolder, fnFolder, fnButton, isIncludeNotShowItem)
        }

        // 子按钮：
        if (!fnButton || !rootFolder.ButtonModels) return

        for (const buttonModel of rootFolder.ButtonModels) {
            if (!isIncludeNotShowItem && (rootFolder.IsHasAuthority && !rootFolder.IsHasAuthority.value)) continue
            fnButton?.(buttonModel as TButton)
        }
    }

    /** 更新“高度” */
    readonly UpdateHeight = () => {
        var newHeight = this.GetSubItemsHeight()
        if (this._oldHeight === newHeight
            && this._oldIsOpened === this._folderModel.IsOpen.value) return

        this._folderModel.SubItemsHeight.value = this._folderModel.IsOpen.value ? newHeight : 0
        this.UpdateOldState()
    }

    /** 更新“旧状态” */
    readonly UpdateOldState = () => {
        this._oldIsOpened = this._folderModel.IsOpen.value
        this._oldHeight = this.GetSubItemsHeight()
    }

    /** 获取“子项”的“个数” */
    readonly GetOpenedSubItemCount = (isExcludeNotAllowShowItem: boolean = true): SubItemCount => {
        var count = new SubItemCount()

        FolderBehavior.RecursivelyOperateSubItems(
            this._folderModel,
            folderModel => {
                if (isExcludeNotAllowShowItem && !folderModel.IsAllowShow.value) {
                    return
                }
                ++count.FolderCount
            },
            buttonModel => {
                if (isExcludeNotAllowShowItem && (!buttonModel.IsAllowShow.value
                    || buttonModel.ParentFolderModel
                    && !buttonModel.ParentFolderModel.IsOpen.value)) {
                    return
                }
                ++count.ButtonCount
            },
            false)

        return count;
    }

    /** 获取“子项”的“总高度 */
    readonly GetSubItemsHeight = (): number => {
        let count = this.GetOpenedSubItemCount()
        let height = 0

        if (this._rootModel._getFolderHeight) {
            height += count.FolderCount * this._rootModel._getFolderHeight()
        }

        if (this._rootModel._getButtonHeight) {
            height += count.ButtonCount * this._rootModel._getButtonHeight()
        }

        return height
    }
    //#endregion 【Functions】
}