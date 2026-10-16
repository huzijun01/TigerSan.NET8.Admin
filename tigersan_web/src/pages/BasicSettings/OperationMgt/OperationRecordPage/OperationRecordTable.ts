import { ItemType, TableModel } from '@/0_tigersan_ui/tigerui'

/** "操作记录"模型 */
export class OperationRecordModel {
    Index = 0
    OperationType = ''
    ProductType = ''
    StartTime = ''
    StopTime = ''
    TotalSpentTime = ''
    EqpCount = 0
    SuccessCount = 0
    FailCount = 0
    SuccessRate = 0
}

// 列头:
export const operationRecordTable = new TableModel<OperationRecordModel>([
    {
        _propName: 'Index',
        Text: 'ID',
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
        _propName: 'ProductType',
        Text: '设备类型',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'StartTime',
        Text: '开始时间',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'StopTime',
        Text: '结束时间',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'TotalSpentTime',
        Text: '总共用时',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'EqpCount',
        Text: '设备总数',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'SuccessCount',
        Text: '成功个数',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'FailCount',
        Text: '失败个数',
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'SuccessRate',
        Text: '成功率',
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getString: (obj: object, propName: string) => {
            const record = obj as OperationRecordModel
            return `${record.SuccessRate.toFixed(2)}%`
        }
    },
])

// 数据:
const arr: OperationRecordModel[] =
    [
        {
            Index: 1,
            OperationType: '传感器',
            ProductType: 'MBT02',
            StartTime: '2026-01-21 17:33:56',
            StopTime: '2026-01-21 17:33:56',
            TotalSpentTime: '9秒',
            EqpCount: 1,
            SuccessCount: 1,
            FailCount: 0,
            SuccessRate: 100,
        },
    ]
operationRecordTable.RowDatas.push(...arr)

// 初始化:
operationRecordTable._initHeader = headerModel => {
    if (headerModel._propName === 'Index') {
        headerModel.Width.value = 50
    }
}

operationRecordTable._initItem = itemModel => {
}