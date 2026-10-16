import { Battery, ItemType, ObjectHelper, OnlineState, PaginationModel, Signal, TableModel, TextModel, Texts } from '@/0_tigersan_ui/tigerui'
import { AssetRecordDto, AssetState, LocationMode } from '@/models'

// 字段:
/** 分页器 */
export const pagination = new PaginationModel()
pagination.IsShowSelectedRowCount.value = true

/** 列头 */
export const assetRecordTable = new TableModel<AssetRecordDto>([
    {
        _propName: 'tagId',
        Text: Texts.Tag,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'stationId',
        Text: Texts.BaseStation,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'stationName',
        Text: Texts.Name,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'siteName',
        Text: TextModel.Computed('Site', '所在场地'),
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'fullAddr',
        Text: TextModel.Computed('Addr', '所在地址'),
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'targetSiteName',
        Text: TextModel.Computed('TargetSite', '目标场地'),
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'fullTarget',
        Text: TextModel.Computed('TargetAddr', '目标地址'),
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'state',
        Text: Texts.State,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getString: source => AssetState.GetName(source.state)
    },
    {
        _propName: 'onlineState',
        Text: Texts.OnlineState,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getString: OnlineState.GetString,
    },
    {
        _propName: 'battery',
        Text: Texts.Battery,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'signal',
        Text: Texts.Signal,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
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
        _propName: 'temperature',
        Text: Texts.Temperature,
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
    {
        _propName: 'reportTime',
        Text: Texts.ReportTime,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
        _getString: source => ObjectHelper.GetDateString(source.reportTime)
    },
])

// 初始化:
assetRecordTable.IsAllowMultiSelect.value = false

assetRecordTable._initItem = itemModel => {
    AssetState.InitItemModel(itemModel)
    OnlineState.InitItemModel(itemModel)
    Battery.InitItemModel(itemModel)
    Signal.InitItemModel(itemModel)
}
