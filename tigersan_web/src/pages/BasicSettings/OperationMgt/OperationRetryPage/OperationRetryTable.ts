import { ItemType, TableModel, Texts } from '@/0_tigersan_ui/tigerui'

/** "操作重试"模型 */
export class OperationRetryModel {
    Index = 0
    macAddr = ''
    EqpType = ''
    OperationType = ''
    OperationTime = ''
    Operation = ''
}

// 列头:
export const operationRetryTable = new TableModel<OperationRetryModel>([
    {
        _propName: 'Index',
        Text: 'ID',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'macAddr',
        Text: Texts.MacAddr,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'EqpType',
        Text: Texts.EqpType,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'OperationType',
        Text: '操作类型',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'OperationTime',
        Text: '操作时间',
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
const arr: OperationRetryModel[] =
    [
        {
            Index: 1,
            macAddr: 'AC233FC21C39',
            EqpType: 'MBT02',
            OperationType: '传感器',
            OperationTime: '2026-01-21 17:33:56',
            Operation: '操作1',
        },
    ]
operationRetryTable.RowDatas.push(...arr)

// 初始化:
operationRetryTable._initHeader = headerModel => {
    if (headerModel._propName === 'Index') {
        headerModel.Width.value = 50
    }
}

operationRetryTable._initItem = itemModel => {
}