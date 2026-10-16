import { ref } from 'vue'
import { Colors, OnlineState, ItemType, OnlineStates, PaginationModel, TableModel, Battery } from '@/0_tigersan_ui/tigerui'

/** “资产管理标签”模型 */
export class AssetMgtTagModel {
    Index = 0
    macAddr = ''
    EqpType = ''
    Version = ''
    OnlineState = OnlineStates.Offline
    Battery = 0
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
export const assetMgtTagTable = new TableModel<AssetMgtTagModel>([
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
        _propName: 'EqpType',
        Text: '设备型号',
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
const arr: AssetMgtTagModel[] =
    [
        {
            Index: 1,
            macAddr: 'EQP1',
            EqpType: 'Type1',
            Version: '1.0.0',
            OnlineState: OnlineStates.Online,
            Battery: 100,
            LastMsgTime: '2026-01-21 17:33:56',
            Operation: '操作1',
        },
        {
            Index: 2,
            macAddr: 'EQP2',
            EqpType: 'Type2',
            Version: '1.0.0',
            OnlineState: OnlineStates.Online,
            Battery: 45,
            LastMsgTime: '2026-01-21 17:33:56',
            Operation: '操作2',
        },
        {
            Index: 3,
            macAddr: 'EQP3',
            EqpType: 'Type3',
            Version: '1.0.0',
            OnlineState: OnlineStates.Offline,
            Battery: 20,
            LastMsgTime: '2026-01-21 17:33:56',
            Operation: '操作3',
        },
    ]
assetMgtTagTable.RowDatas.push(...arr)

// 初始化:
assetMgtTagTable._initHeader = headerModel => {
    if (headerModel._propName === 'Index') {
        headerModel.Width.value = 50
    }
}

assetMgtTagTable._initItem = itemModel => {
    OnlineState.InitItemModel(itemModel)
    Battery.InitItemModel(itemModel)
}

assetMgtTagTable._onInitRowModels = rowDatas => {
    pagination.Count.value = rowDatas.length
    onlineCount.value = rowDatas.filter(r => OnlineState.IsOnline(r)).length
    offlineCount.value = rowDatas.filter(r => !OnlineState.IsOnline(r)).length
}