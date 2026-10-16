import { Colors, ObjectHelper, SelectModel, TableItemModel, TextModel, Texts } from "@/0_tigersan_ui/tigerui"

/** 资产状态 */
export enum AssetStates {
    /** 无记录 */
    NoRecord = 0,
    /** 入库 */
    Inbound = 1,
    /** 在库 */
    InStore = 2,
    /** 滞留 */
    Stolid = 3,
    /** 出库 */
    Outbound = 4,
    /** 在途 */
    InTransit = 5,
    /** 超时 */
    Timeout = 6,
}

export class AssetState {
    static GetName(state: AssetStates): string {
        switch (state) {
            case AssetStates.NoRecord:
                return Texts.NoRecord.value
            case AssetStates.Inbound:
                return Texts.Inbound.value
            case AssetStates.InStore:
                return Texts.InStore.value
            case AssetStates.Stolid:
                return Texts.Stolid.value
            case AssetStates.Outbound:
                return Texts.Outbound.value
            case AssetStates.InTransit:
                return Texts.InTransit.value
            case AssetStates.Timeout:
                return Texts.Timeout.value
            default:
                return Texts.Unknown.value
        }
    }

    /** 获取“筛选框模型” */
    static GetSelectModel(): SelectModel<AssetStates> {
        const select = new SelectModel<AssetStates>()
        select.Width.value = 120
        select.Placeholder.value = Texts.AssetState
        select.Items.push(...[0, 1, 2, 3, 4, 5, 6])
        select._converter = this.GetName
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'state') {
        if (itemModel._headerModel._propName === propName) {
            const source = itemModel.GetSource()
            if (source === AssetStates.Inbound) {
                itemModel.Color.value = Colors.Warning
                itemModel.Background.value = Colors.Warning10
            } else if (source === AssetStates.InStore) {
                itemModel.Color.value = Colors.Success
                itemModel.Background.value = Colors.Success10
            } else if (source === AssetStates.Stolid) {
                itemModel.Color.value = Colors.Orange
                itemModel.Background.value = Colors.Orange10
            } else if (source === AssetStates.Outbound) {
                itemModel.Color.value = Colors.Info
                itemModel.Background.value = Colors.Info10
            } else if (source === AssetStates.Timeout) {
                itemModel.Color.value = Colors.Danger
                itemModel.Background.value = Colors.Danger10
            } else {
                itemModel.Color.value = Colors.Brand
                itemModel.Background.value = Colors.Brand10
            }
        }
    }
}

/** 异常类型 */
export enum ErrorTypes {
    /** 无信号 */
    NoSignal = 0,
    /** 故障 */
    Breakdown = 1,
    /** 丢失 */
    Lose = 2,
}

export class ErrorType {
    static GetName(state?: ErrorTypes): string {
        if (state === undefined || state === null) return ''

        switch (state) {
            case ErrorTypes.NoSignal:
                return Texts.NoSignal.value
            case ErrorTypes.Breakdown:
                return Texts.Breakdown.value
            case ErrorTypes.Lose:
                return Texts.Lose.value
            default:
                return Texts.Unknown.value
        }
    }

    /** 获取“筛选框模型” */
    static GetSelectModel(): SelectModel<ErrorTypes> {
        const select = new SelectModel<ErrorTypes>()
        select.Width.value = 120
        select.Placeholder.value = Texts.ErrorType
        select.Items.push(...[0, 1, 2])
        select._converter = this.GetName
        return select
    }
}

export class BindingState {
    static GetName(state?: boolean): string {
        if (state === undefined || state === null) return ''

        return state ? Texts.Bound.value : Texts.Unbound.value
    }

    /** 获取“筛选框模型” */
    static GetSelectModel(): SelectModel<boolean> {
        const select = new SelectModel<boolean>()
        select.Width.value = 120
        select.Placeholder.value = Texts.IsBinding
        select.Items.push(...[true, false])
        select._converter = this.GetName
        return select
    }

    /** 初始化“项目模型” */
    static InitItemModel(itemModel: TableItemModel<any>, propName: string = 'isBound') {
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

/** 定位方式 */
export enum LocationModes {
    /** 基站 */
    BaseStation = 0,
    /** 4G */
    _4G = 1,
    /** GPS */
    GPS = 2,
    /** WiFi */
    WiFi = 3,
    /** 4G+蓝牙 */
    _4G_Bluetooth = 4,
    /** GPS+蓝牙 */
    GPS_Bluetooth = 5,
    /** WiFi+蓝牙 */
    WiFi_Bluetooth = 6,
    /** 4G校准 */
    _4G_Calibrate = 7,
    /** WiFi校准 */
    WiFi_Calibrate = 8,
    /** 4G+蓝牙校准 */
    _4G_Bluetooth_Calibrate = 9,
    /** WiFi+蓝牙校准 */
    WiFi_Bluetooth_Calibrate = 10,
    /** 信标辅助定位 */
    Beacon_Assistance = 11,
}

export class LocationMode {
    static GetString(obj: object, propName: string = 'locationMode'): string {
        return LocationMode.GetName(ObjectHelper.DefaultTGetter(obj, propName, undefined))
    }

    static GetName(state?: LocationModes): string {
        if (state === undefined || state === null) return ''
        switch (state) {
            case LocationModes.BaseStation:
                return Texts.BaseStation.value
            case LocationModes._4G:
                return '4G'
            case LocationModes.GPS:
                return 'GPS'
            case LocationModes.WiFi:
                return 'WiFi'
            case LocationModes._4G_Bluetooth:
                return TextModel.Computed('4G+Bluetooth', '4G+蓝牙').value
            case LocationModes.GPS_Bluetooth:
                return TextModel.Computed('GPS+Bluetooth', 'GPS+蓝牙').value
            case LocationModes.WiFi_Bluetooth:
                return TextModel.Computed('WiFi+Bluetooth', 'WiFi+蓝牙').value
            case LocationModes._4G_Calibrate:
                return TextModel.Computed('4G Calibrate', '4G校准').value
            case LocationModes.WiFi_Calibrate:
                return TextModel.Computed('WiFi Calibrate', 'WiFi校准').value
            case LocationModes._4G_Bluetooth_Calibrate:
                return TextModel.Computed('4G+Bluetooth Calibrate', '4G+蓝牙校准').value
            case LocationModes.WiFi_Bluetooth_Calibrate:
                return TextModel.Computed('WiFi+Bluetooth Calibrate', 'WiFi+蓝牙校准').value
            case LocationModes.Beacon_Assistance:
                return TextModel.Computed('Beacon Assistance', '信标辅助定位').value
            default:
                return Texts.Unknown.value
        }
    }

    /** 获取“筛选框模型” */
    static GetSelectModel(): SelectModel<LocationModes> {
        const select = new SelectModel<LocationModes>()
        select.Width.value = 208
        select.Placeholder.value = Texts.LocationMode
        select.Items.push(...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        select._converter = this.GetName
        return select
    }
}