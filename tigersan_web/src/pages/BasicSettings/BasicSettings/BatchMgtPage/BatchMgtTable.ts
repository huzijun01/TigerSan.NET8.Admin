import { ItemType, ObjectHelper, TableModel, Texts } from '@/0_tigersan_ui/tigerui'
import { companyHelper, scenarioHelper, BatchEntity } from '@/models'

/** 列头 */
export const batchMgtTable = new TableModel<BatchEntity>([
    {
        _propName: 'company',
        Text: Texts.Company,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getStringAsync: source => companyHelper.GetNameAsync(source.company)
    },
    {
        _propName: 'scenario',
        Text: Texts.Scenario,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getStringAsync: source => scenarioHelper.GetNameAsync(source.scenario)
    },
    {
        _propName: 'batchId',
        Text: Texts.Batch,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'shipmentTime',
        Text: Texts.ShipmentTime,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getString: source => ObjectHelper.GetDateString(source.shipmentTime)
    },
    {
        _propName: 'manager',
        Text: Texts.Manager,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'phone',
        Text: Texts.Phone,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'comment',
        Text: Texts.Comment,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
])

// 初始化:
batchMgtTable.IsAllowMultiSelect.value = false