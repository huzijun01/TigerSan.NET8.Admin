import { OnlineState, ItemType, ObjectHelper, TableModel, IsEnable, Battery, Texts, TextModel, IsMobile } from '@/0_tigersan_ui/tigerui'
import { BaseStationDto, LocationMode } from '@/models'
import { StationDetail } from '@/pages/0_Other/StationDetail/StationDetail'

/** 基站详情 */
export const stationDetail = new StationDetail(GetStationTable())

export function GetStationTable() {
    // 列头:
    const table = new TableModel<BaseStationDto>([
        {
            _propName: 'macAddr',
            Text: Texts.MacAddr,
            IsReadonly: true,
            IsFreeze: true,
            Type: ItemType.Link,
            _onItemClickAsync: async itemModel => {
                const rowData = itemModel._rowModel._rowData
                stationDetail.Show(rowData)
            }
        },
        {
            _propName: 'companyName',
            Text: Texts.Company,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'siteName',
            Text: Texts.Site,
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
            _propName: 'name',
            Text: Texts.Name,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'addr',
            Text: Texts.Addr,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'addrDetail',
            Text: Texts.AddrDetail,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'isMobile',
            Text: Texts.InstallMode,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getString: IsMobile.GetString,
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
            _propName: 'heartbeatInterval',
            Text: TextModel.Computed('HeartbeatInterval (s)', '心跳（秒）'),
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'reportInterval',
            Text: TextModel.Computed('ReportInterval (s)', '上报周期（秒）'),
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'monthOffline',
            Text: TextModel.Computed('MonthOffline', '当月离线总时长'),
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'createTime',
            Text: Texts.CreateTime,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getString: source => ObjectHelper.GetDateString(source.createTime)
        },
        {
            _propName: 'reportTime',
            Text: Texts.ReportTime,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getString: source => ObjectHelper.GetDateString(source.reportTime)
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
    ])

    // 初始化:
    table.IsAllowMultiSelect.value = true

    table._initItem = itemModel => {
        IsMobile.InitItemModel(itemModel)
        IsEnable.InitItemModel(itemModel)
        OnlineState.InitItemModel(itemModel)
        Battery.InitItemModel(itemModel)
    }

    return table
}