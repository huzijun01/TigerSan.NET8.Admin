import { ref } from 'vue'
import { OnlineStates, PaginationModel, TableModel, OnlineState, Colors, ItemType, Battery } from '@/0_tigersan_ui/tigerui'

/** "环境传感器"模型 */
export class EnvSensorModel {
    Index = 0
    macAddr = ''
    Version = ''
    OnlineState = OnlineStates.Offline
    Battery = 0
    EqpTime = ''
    LastMsgTime = ''
    Operation = ''
}

// 字段:
export const onlineCount = ref(0)
export const offlineCount = ref(0)

// 分页器:
export const pagination = new PaginationModel()
pagination.IsShowSelectedRowCount.value = true

// 列头:
export const envSensorTable = new TableModel<EnvSensorModel>([
    {
        _propName: 'Index',
        Text: 'ID',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'macAddr',
        Text: 'MAC地址',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'Version',
        Text: '固件版本',
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
        _propName: 'Battery',
        Text: '电量（%）',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'EqpTime',
        Text: '设备时间',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'LastMsgTime',
        Text: '最近广播时间',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'Operation',
        Text: '操作',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
])

// 数据:
const arr: EnvSensorModel[] =
    [
        {
            Index: 1,
            macAddr: 'EQP1',
            Version: '1.0.0',
            OnlineState: OnlineStates.Online,
            Battery: 100,
            EqpTime: '2026-01-21 17:33:56',
            LastMsgTime: '2026-01-21 17:33:56',
            Operation: '操作1',
        },
        {
            Index: 2,
            macAddr: 'EQP2',
            Version: '1.0.0',
            OnlineState: OnlineStates.Online,
            Battery: 45,
            EqpTime: '2026-01-21 17:33:56',
            LastMsgTime: '2026-01-21 17:33:56',
            Operation: '操作1',
        },
        {
            Index: 3,
            macAddr: 'EQP3',
            Version: '1.0.0',
            OnlineState: OnlineStates.Offline,
            Battery: 20,
            EqpTime: '2026-01-21 17:33:56',
            LastMsgTime: '2026-01-21 17:33:56',
            Operation: '操作1',
        },
    ]
envSensorTable.RowDatas.push(...arr)

// 初始化:
envSensorTable.IsAllowMultiSelect.value = false

envSensorTable._initHeader = headerModel => {
    if (headerModel._propName === 'Index') {
        headerModel.Width.value = 50
    }
}

envSensorTable._initItem = itemModel => {
    OnlineState.InitItemModel(itemModel)
    Battery.InitItemModel(itemModel)
}

envSensorTable._onInitRowModels = rowDatas => {
    pagination.Count.value = rowDatas.length
    onlineCount.value = rowDatas.filter(r => OnlineState.IsOnline(r)).length
    offlineCount.value = rowDatas.filter(r => !OnlineState.IsOnline(r)).length
}