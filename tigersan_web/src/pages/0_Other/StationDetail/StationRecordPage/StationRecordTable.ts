import { ItemType, ObjectHelper, OnlineState, PaginationModel, TableModel, Texts } from '@/0_tigersan_ui/tigerui'
import { LocationMode, StationRecordEntity } from '@/models'

// 字段:
/** 分页器 */
export const pagination = new PaginationModel()
pagination.IsShowSelectedRowCount.value = true

/** 列头 */
export const stationRecordTable = new TableModel<StationRecordEntity>([
    {
        _propName: 'reportTime',
        Text: Texts.ReportTime,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
        _getString: source => ObjectHelper.GetDateString(source.reportTime)
    },
    {
        _propName: 'onlineState',
        Text: Texts.OnlineState,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getString: OnlineState.GetString,
    },
    {
        _propName: 'locationMode',
        Text: Texts.LocationMode,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
        _getString: LocationMode.GetString,
    },
    {
        _propName: 'longitude',
        Text: Texts.Longitude,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'latitude',
        Text: Texts.Latitude,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'address',
        Text: Texts.Address,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
])

// 初始化:
stationRecordTable.IsAllowMultiSelect.value = false

stationRecordTable._initItem = itemModel => {
    OnlineState.InitItemModel(itemModel)
}
