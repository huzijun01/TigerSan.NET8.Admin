import { Battery, IsEnable, IsFall, ItemType, ObjectHelper, OnlineState, Signal, TableModel, Texts } from '@/0_tigersan_ui/tigerui'
import { TagDto, LocationMode } from '@/models'

export function GetTagTable() {
    // 列头:
    const table = new TableModel<TagDto>([
        {
            _propName: 'tagId',
            Text: Texts.TagId,
            IsFreeze: true,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'assetId',
            Text: Texts.AssetId,
            IsFreeze: true,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'companyName',
            Text: Texts.Company,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'batchId',
            Text: Texts.Batch,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'typeName',
            Text: Texts.Type,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'stationId',
            Text: Texts.BaseStation,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'siteName',
            Text: Texts.Site,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'isEnable',
            Text: Texts.IsEnable,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getString: IsEnable.GetString,
        },
        {
            _propName: 'onlineState',
            Text: Texts.OnlineState,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getString: OnlineState.GetString,
        },
        {
            _propName: 'isFall',
            Text: Texts.IsFall,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getString: IsFall.GetString,
        },
        {
            _propName: 'rfid',
            Text: 'RFID',
            IsReadonly: true,
            IsRequired: false,
            IsShowSlot: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'imei',
            Text: 'IMEI',
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'iccid',
            Text: 'ICCID',
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
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
        {
            _propName: 'address',
            Text: Texts.Address,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
        },
    ])

    // 初始化:
    table.IsAllowMultiSelect.value = true

    table._initItem = itemModel => {
        IsEnable.InitItemModel(itemModel)
        IsFall.InitItemModel(itemModel)
        OnlineState.InitItemModel(itemModel)
        Signal.InitItemModel(itemModel)
        Battery.InitItemModel(itemModel)
    }

    return table
}