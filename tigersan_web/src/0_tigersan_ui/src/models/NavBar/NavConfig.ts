import { type Component, type ComputedRef } from 'vue'
import { NavBarModel } from './NavBarModel'
import { NavItemModel } from './NavItemModel'
import { AuthorityVerify } from '../Authority/AuthorityVerify'
import { type NavButtonHandler, NavButtonModel } from "./NavButtonModel"
import { type NavFolderHandler, NavFolderModel } from './NavFolderModel'

export class NavItemConfig {
    /** 权限 */
    _authority?: AuthorityVerify
    /** 键（用于权限） */
    Key?: string
    /** 图标 */
    Icon?: string
    /** 标题 */
    Title?: string | ComputedRef<string>
    /** 是否显示 */
    IsShow?: boolean
}

export class NavFolderConfig extends NavItemConfig {
    /** 是否打开 */
    IsOpen?: boolean
    /** 子项高度 */
    SubItemsHeight?: number
    /** 按钮集合 */
    Buttons?: NavButtonConfig[]
    /** 目录集合 */
    Folders?: NavFolderConfig[]
    /** 点击后 */
    Clicked?: NavFolderHandler
    /** 打开后 */
    Opened?: NavFolderHandler
    /** 关闭后 */
    Closed?: NavFolderHandler
}

export class NavButtonConfig extends NavItemConfig {
    /** 组件 */
    _component?: Component
    /** 是否打开 */
    IsOpen?: boolean
    /** 是否选中 */
    IsSelected?: boolean
    /** 是否显示关闭按钮 */
    IsShowCloseButton?: boolean
    /** 点击后 */
    Clicked?: NavButtonHandler
    /** 选中后 */
    Checked?: NavButtonHandler
    /** “是否选中”改变后 */
    IsSelectedChanged?: NavButtonHandler
}

export function SetNavItemModel(model: NavItemModel, config: NavItemConfig) {
    if (config.Key != undefined) model.Key.value = config.Key
    if (config.Icon != undefined) model.Icon.value = config.Icon
    if (config.Title != undefined) model.Title.value = config.Title
    if (config.IsShow != undefined) model.IsShow.value = config.IsShow
    if (config._authority != undefined) model._authority = config._authority
}

export function SetNavFolderModel(model: NavFolderModel, config: NavFolderConfig) {
    SetNavItemModel(model, config)
    if (config.IsOpen != undefined) model.IsOpen.value = config.IsOpen
    if (config.SubItemsHeight != undefined) model.SubItemsHeight.value = config.SubItemsHeight
    model.Clicked = config.Clicked
    model.Opened = config.Opened
    model.Closed = config.Closed
}

export function SetNavButtonModel(model: NavButtonModel, config: NavButtonConfig) {
    model._component = config._component
    SetNavItemModel(model, config)
    if (config.IsShowCloseButton != undefined) model.IsShowCloseButton.value = config.IsShowCloseButton
    model.Clicked = config.Clicked
    model.Checked = config.Checked
    model.IsSelectedChanged = config.IsSelectedChanged
}

export function CreateNavFolderModel(
    barModel: NavBarModel,
    folderConfig: NavFolderConfig,
    folderModel?: NavFolderModel) {
    let newFolderModel = new NavFolderModel(barModel, folderModel)
    SetNavFolderModel(newFolderModel, folderConfig)

    // 子文件夹:
    if (folderConfig.Folders) {
        folderConfig.Folders.forEach(f => {
            newFolderModel.FolderModels.push(CreateNavFolderModel(barModel, f, newFolderModel))
        })
    }

    // 子按钮:
    if (folderConfig.Buttons) {
        folderConfig.Buttons.forEach(b => {
            let buttonModel = new NavButtonModel(barModel, newFolderModel)
            SetNavButtonModel(buttonModel, b)
            newFolderModel.ButtonModels.push(buttonModel)

            if (!b._authority || b._authority.IsEnable.value) {
                // 打开:
                if (b.IsOpen == true || b.IsSelected == true) {
                    barModel.OpenedButtonModels.push(buttonModel)
                }

                // 选中:
                if (b.IsSelected == true) {
                    barModel.SelectedButtonModel = buttonModel
                }
            }
        })
    }

    // 默认选中:
    if (barModel.OpenedButtonModels.length > 0 && !barModel.SelectedButtonModel) {
        barModel.SelectedButtonModel = barModel.OpenedButtonModels[0]
    }

    return newFolderModel
}
