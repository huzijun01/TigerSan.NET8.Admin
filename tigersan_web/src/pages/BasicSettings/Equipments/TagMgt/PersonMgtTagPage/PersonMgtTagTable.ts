import { ref } from 'vue'
import { OnlineStates, PaginationModel, TableModel, OnlineState, Colors, ItemType, Battery } from '@/0_tigersan_ui/tigerui'

/** “人员管理标签”模型 */
export class PersonMgtTagModel {
    Index = 0
    IMEI = ''
    EqpName = ''
    EqpType = ''
    OnlineState = OnlineStates.Offline
    BluetoothFirmware = ''
    KeyEvent = ''
    TriggerEvent = ''
    Battery = 0
    LastMsgTime = ''
}

// 字段:
export const onlineCount = ref(0)
export const offlineCount = ref(0)

// 分页器:
export const pagination = new PaginationModel()
pagination.IsShowSelectedRowCount.value = true

// 列头:
export const personMgtTagTable = new TableModel<PersonMgtTagModel>([
    {
        _propName: 'Index',
        Text: 'ID',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'IMEI',
        Text: 'IMEI',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'EqpName',
        Text: '设备名称',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'OnlineState',
        Text: '状态',
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getString: OnlineState.GetString,
    },
    {
        _propName: 'EqpType',
        Text: '设备型号',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'BluetoothFirmware',
        Text: '蓝牙固件',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'KeyEvent',
        Text: '按键事件',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'TriggerEvent',
        Text: '触发事件',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'Battery',
        Text: '电量（%）',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'LastMsgTime',
        Text: '最近通讯时间',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
])

// 数据:
const arr: PersonMgtTagModel[] =
    [
        {
            Index: 1,
            IMEI: '863184079495485',
            EqpName: 'EQP1',
            EqpType: 'g1-e-grapes',
            OnlineState: OnlineStates.Online,
            BluetoothFirmware: '固件1',
            KeyEvent: '事件1',
            TriggerEvent: '触发1',
            Battery: 100,
            LastMsgTime: '2026-01-21 17:33:56',
        },
        {
            Index: 2,
            IMEI: '863184079495485',
            EqpName: 'EQP2',
            EqpType: 'g1-e-grapes',
            OnlineState: OnlineStates.Online,
            BluetoothFirmware: '固件2',
            KeyEvent: '事件2',
            TriggerEvent: '触发2',
            Battery: 45,
            LastMsgTime: '2026-01-21 17:33:56',
        },
        {
            Index: 3,
            IMEI: '863184079495485',
            EqpName: 'EQP1',
            EqpType: 'g1-e-grapes',
            OnlineState: OnlineStates.Offline,
            BluetoothFirmware: '固件3',
            KeyEvent: '事件3',
            TriggerEvent: '触发3',
            Battery: 20,
            LastMsgTime: '2026-01-21 17:33:56',
        },
    ]
personMgtTagTable.RowDatas.push(...arr)

// 初始化:
personMgtTagTable.IsAllowMultiSelect.value = false

personMgtTagTable._initHeader = headerModel => {
    if (headerModel._propName === 'Index') {
        headerModel.Width.value = 50
    }
}

personMgtTagTable._initItem = itemModel => {
    OnlineState.InitItemModel(itemModel)
    Battery.InitItemModel(itemModel)
}

personMgtTagTable._onInitRowModels = rowDatas => {
    pagination.Count.value = rowDatas.length
    onlineCount.value = rowDatas.filter(r => OnlineState.IsOnline(r)).length
    offlineCount.value = rowDatas.filter(r => !OnlineState.IsOnline(r)).length
}