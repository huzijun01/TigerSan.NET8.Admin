import { Texts } from "../texts"
import { Colors, Icons } from "../base"
import { TableItemModel } from "../models"
import { SelectModel } from "./Inputs/SelectModel"
import { ObjectHelper } from "../helpers/ObjectHelper"

export enum OnlineStates {
    Offline = 0,
    Online = 1,
}

export class OnlineState {
    static ToString(value?: OnlineStates) {
        return value === OnlineStates.Online ? Texts.Online.value : Texts.Offline.value
    }

    static GetString(obj: object, propName: string = 'onlineState'): string {
        return ObjectHelper.DefaultNumberGetter(obj, propName) === OnlineStates.Online ? Texts.Online.value : Texts.Offline.value
    }

    static IsOnline(obj: object, propName: string = 'onlineState'): boolean {
        return ObjectHelper.DefaultNumberGetter(obj, propName) === OnlineStates.Online
    }

    static GetSelectModel() {
        const select = new SelectModel<OnlineStates>()
        select.Width.value = 120
        select.Value.value = undefined
        select.Placeholder.value = Texts.OnlineState
        select.SetItems([OnlineStates.Online, OnlineStates.Offline])
        select._converter = OnlineState.ToString
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'onlineState') {
        if (itemModel._headerModel._propName === propName) {
            if (itemModel.GetSource() === OnlineStates.Online) {
                itemModel.Color.value = Colors.Success
                itemModel.Background.value = Colors.Success10
            } else {
                itemModel.Color.value = Colors.Danger
                itemModel.Background.value = Colors.Danger10
            }
        }
    }
}

export class IsEnable {
    static ToString(value: boolean) {
        return value ? Texts.Enable.value : Texts.Disable.value
    }

    static GetString(obj: object, propName: string = 'isEnable'): string {
        return ObjectHelper.DefaultTGetter(obj, propName, false) ? Texts.Enable.value : Texts.Disable.value
    }

    static GetSelectModel() {
        const select = new SelectModel<boolean>()
        select.Width.value = 120
        select.Value.value = undefined
        select.Placeholder.value = Texts.IsEnable
        select.SetItems([true, false])
        select._converter = IsEnable.ToString
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'isEnable') {
        if (itemModel._headerModel._propName === propName) {
            if (itemModel.GetSource()) {
                itemModel.Color.value = Colors.Success
                itemModel.Background.value = Colors.Success10
            } else {
                itemModel.Color.value = Colors.Danger
                itemModel.Background.value = Colors.Danger10
            }
        }
    }
}

export class IsFall {
    static ToString(value?: boolean) {
        if (value === undefined || value === null) return ''
        return value ? Texts.Fall.value : Texts.Normal.value
    }

    static GetString(obj: object, propName: string = 'isFall'): string {
        return IsFall.ToString(ObjectHelper.DefaultTGetter(obj, propName, undefined))
    }

    static GetSelectModel() {
        const select = new SelectModel<boolean>()
        select.Width.value = 120
        select.Value.value = undefined
        select.Placeholder.value = Texts.IsFall
        select.SetItems([true, false])
        select._converter = IsFall.ToString
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'isFall') {
        if (itemModel._headerModel._propName === propName) {
            const source = itemModel.GetSource()
            if (source === undefined || source === null) {
                return
            }
            else if (source) {
                itemModel.Color.value = Colors.Danger
                itemModel.Background.value = Colors.Danger10
            } else {
                itemModel.Color.value = Colors.Success
                itemModel.Background.value = Colors.Success10
            }
        }
    }
}

export class IsAuto {
    static ToString(value?: boolean) {
        return value ? Texts.Auto.value : Texts.Manual.value
    }

    static GetString(obj: object, propName: string = 'isAuto'): string {
        return IsAuto.ToString(ObjectHelper.DefaultTGetter(obj, propName, true))
    }

    static GetSelectModel() {
        const select = new SelectModel<boolean>()
        select.Width.value = 120
        select.Value.value = undefined
        select.Placeholder.value = Texts.AllotMode
        select.SetItems([true, false])
        select._converter = IsAuto.ToString
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'isAuto') {
        if (itemModel._headerModel._propName === propName) {
            if (itemModel.GetSource()) {
                itemModel.Color.value = Colors.Success
                itemModel.Background.value = Colors.Success10
            } else {
                itemModel.Color.value = Colors.Brand
                itemModel.Background.value = Colors.Brand10
            }
        }
    }
}

export class IsInFence {
    static ToString(value?: boolean) {
        return value ? Texts.Enter.value : Texts.Leave.value
    }

    static GetString(obj: object, propName: string = 'isInFence'): string {
        return IsInFence.ToString(ObjectHelper.DefaultTGetter(obj, propName, true))
    }

    static GetSelectModel() {
        const select = new SelectModel<boolean>()
        select.Width.value = 120
        select.Value.value = undefined
        select.Placeholder.value = Texts.Fence
        select.SetItems([true, false])
        select._converter = IsInFence.ToString
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'isInFence') {
        if (itemModel._headerModel._propName === propName) {
            if (itemModel.GetSource()) {
                itemModel.Color.value = Colors.Success
                itemModel.Background.value = Colors.Success10
            } else {
                itemModel.Color.value = Colors.Danger
                itemModel.Background.value = Colors.Danger10
            }
        }
    }
}

export class IsEnd {
    static ToString(value?: boolean) {
        return value ? Texts.Done.value : Texts.Undone.value
    }

    static GetString(obj: object, propName: string = 'isEnd'): string {
        return IsEnd.ToString(ObjectHelper.DefaultTGetter(obj, propName, true))
    }

    static GetSelectModel() {
        const select = new SelectModel<boolean>()
        select.Width.value = 120
        select.Value.value = undefined
        select.Placeholder.value = Texts.IsEnd
        select.SetItems([true, false])
        select._converter = IsEnd.ToString
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'isEnd') {
        if (itemModel._headerModel._propName === propName) {
            if (itemModel.GetSource()) {
                itemModel.Color.value = Colors.Success
                itemModel.Background.value = Colors.Success10
            } else {
                itemModel.Color.value = Colors.Warning
                itemModel.Background.value = Colors.Warning10
            }
        }
    }
}

/** 是否移动 */
export class IsMobile {
    static ToString(value?: boolean) {
        if (value === undefined) return ''
        return value ? Texts.Mobile.value : Texts.Fixed.value
    }

    static GetString(obj: object, propName: string = 'isMobile'): string {
        return IsMobile.ToString(ObjectHelper.DefaultTGetter(obj, propName, false))
    }

    static GetSelectModel() {
        const select = new SelectModel<boolean>()
        select.Width.value = 120
        select.Value.value = undefined
        select.Placeholder.value = Texts.InstallMode
        select.SetItems([true, false])
        select._converter = IsMobile.ToString
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'isMobile') {
        if (itemModel._headerModel._propName === propName) {
            if (itemModel.GetSource()) {
                itemModel.Color.value = Colors.Success
                itemModel.Background.value = Colors.Success10
            } else {
                itemModel.Color.value = Colors.Brand
                itemModel.Background.value = Colors.Brand10
            }
        }
    }
}

export class IsBound {
    static ToString(value?: boolean) {
        if (value === undefined || value === null) return ''
        return value ? Texts.Bound.value : Texts.Unbound.value
    }

    static GetString(obj: object, propName: string = 'isBound'): string {
        return IsBound.ToString(ObjectHelper.DefaultTGetter(obj, propName, undefined))
    }

    static GetSelectModel() {
        const select = new SelectModel<boolean>()
        select.Width.value = 120
        select.Value.value = undefined
        select.Placeholder.value = Texts.BindingState
        select.SetItems([true, false])
        select._converter = IsBound.ToString
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'isBound') {
        if (itemModel._headerModel._propName === propName) {
            const source = itemModel.GetSource()
            if (source === undefined || source === null) {
                return
            }
            else if (source) {
                itemModel.Color.value = Colors.Danger
                itemModel.Background.value = Colors.Danger10
            } else {
                itemModel.Color.value = Colors.Success
                itemModel.Background.value = Colors.Success10
            }
        }
    }
}

export class Battery {
    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'battery') {
        if (itemModel._headerModel._propName === propName) {
            const battery = itemModel.GetSource() as number
            if (battery >= 50) {
                itemModel.Color.value = Colors.Success
            } else if (battery >= 25) {
                itemModel.Color.value = Colors.Warning
            } else {
                itemModel.Color.value = Colors.Danger
            }
        }
    }
}

export class Signal {
    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'signal') {
        if (itemModel._headerModel._propName === propName) {
            const signal = itemModel.GetSource() as number
            if (signal < 30) {
                itemModel.Color.value = Colors.Success
            } else if (signal < 90) {
                itemModel.Color.value = Colors.Warning
            } else {
                itemModel.Color.value = Colors.Danger
            }
        }
    }
}

export class Gender {
    static ToString(value?: boolean) {
        if (value === undefined || value === null) return ''
        return value ? Texts.Male.value : Texts.Female.value
    }

    static GetString(obj: object, propName: string = 'gender'): string {
        return Gender.ToString(ObjectHelper.DefaultTGetter(obj, propName, false))
    }

    static GetSelectModel() {
        const select = new SelectModel<boolean>()
        select.Width.value = 120
        select.Value.value = undefined
        select.Placeholder.value = Texts.Gender
        select.SetItems([true, false])
        select._converter = Gender.ToString
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'gender') {
        if (itemModel._headerModel._propName === propName) {
            if (itemModel.GetSource()) {
                itemModel.Color.value = Colors.Blue
                itemModel.Background.value = Colors.Blue10
            } else {
                itemModel.Color.value = Colors.PinkPurple
                itemModel.Background.value = Colors.PinkPurple10
            }
        }
    }
}

export class FileType {
    static ToString(isDir?: boolean) {
        if (isDir === undefined || isDir === null) return ''
        return isDir ? Texts.DIR.value : Texts.File.value
    }

    static ToIcon(value?: boolean) {
        return value ? Icons.Folder_Linear : Icons.File_Linear
    }

    static GetString(obj: object, propName: string = 'isDir'): string {
        return FileType.ToString(ObjectHelper.DefaultTGetter(obj, propName, false))
    }

    static GetSelectModel() {
        const select = new SelectModel<boolean>()
        select.Width.value = 120
        select.Value.value = undefined
        select.Placeholder.value = Texts.FileType
        select.SetItems([true, false])
        select._converter = FileType.ToString
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'isDir') {
        if (itemModel._headerModel._propName === propName) {
            if (itemModel.GetSource()) {
                itemModel.Color.value = Colors.Success
                itemModel.Background.value = Colors.Success10
            } else {
                itemModel.Color.value = Colors.Brand
                itemModel.Background.value = Colors.Brand10
            }
        }
    }
}