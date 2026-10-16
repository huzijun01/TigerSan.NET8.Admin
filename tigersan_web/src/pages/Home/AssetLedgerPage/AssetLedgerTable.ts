
import { computed } from 'vue'
import { Battery, PopWindowModel, ItemType, ObjectHelper, OnlineState, PaginationModel, TableModel, ColumnSelectModel, StringHelper, Texts, IsAuto, IsFall, RowDataModel, ApiResult, IsEnd, TextModel, IsInFence } from '@/0_tigersan_ui/tigerui'
import { VehiclePageModel } from '../VehiclePage/VehiclePageModel'
import { TransferPageModel } from '../TransferPage/TransferPageModel'
import { AssetDetail } from '@/pages/0_Other/AssetDetail/AssetDetail'
import { StationDetail } from '@/pages/0_Other/StationDetail/StationDetail'
import { GetTagTable } from '@/pages/BasicSettings/Equipments/TagMgt/TagMgtPage/TagMgtTable'
import { GetStationTable } from '@/pages/BasicSettings/Equipments/BaseStationMgtPage/BaseStationMgtTable'
import { AssetDto, AssetState, AssetStates, baseStationHelper, BindingState, ErrorType, tagHelper, tagTypeHelper, transferHelper, vehicleHelper } from '@/models'

// 字段:
/** 资产详情 */
export const assetDetail = new AssetDetail()
/** 标签详情 */
export const tagDetail = new PopWindowModel()
export const tag = new RowDataModel(GetTagTable())
/** 基站详情 */
export const stationDetail = new StationDetail(GetStationTable())
/** 调拨详情 */
export const transferDetail = new PopWindowModel()
export const transfer = new RowDataModel(new TransferPageModel().table)
/** 车辆详情 */
export const vehicleDetail = new PopWindowModel()
export const vehicle = new RowDataModel(new VehiclePageModel().table)

/** 分页器 */
export const pagination = new PaginationModel()
pagination.IsShowSelectedRowCount.value = true

/** 列头 */
export const assetLedgerTable = new TableModel<AssetDto>([
    {
        _propName: 'assetId',
        Text: Texts.AssetId,
        IsFreeze: true,
        IsReadonly: true,
        Type: ItemType.Link,
        _onItemClickAsync: async itemModel => {
            const rowData = itemModel._rowModel._rowData
            assetDetail.Show(rowData.id, rowData.assetId)
        }
    },
    {
        _propName: 'tagId',
        Text: Texts.TagId,
        IsFreeze: true,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.Link,
        _onItemClickAsync: async itemModel => {
            const rowData = itemModel._rowModel._rowData
            if (!rowData.tag) {
                console.warn('The tag is undefined!')
                return
            }
            tagDetail.Title.value = `${Texts.TagDetail.value} - ${rowData.assetId}`
            const res = await tagHelper.Get(rowData.tag)
            if (!res.data) {
                ApiResult.ShowResult(res)
                return
            }
            tag.Data.value = res.data
            tagDetail.Show()
        }
    },
    {
        _propName: 'stationId',
        Text: Texts.StationId,
        IsFreeze: true,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.Link,
        _onItemClickAsync: async itemModel => {
            const rowData = itemModel._rowModel._rowData
            if (!rowData.station) {
                console.warn('The station is undefined!')
                return
            }
            const res = await baseStationHelper.GetFull(rowData.station, rowData.stationId)
            if (!res.data) {
                ApiResult.ShowResult(res)
                return
            }
            stationDetail.Show(res.data)
        }
    },
    {
        _propName: 'companyName',
        Text: Texts.Company,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'departmentName',
        Text: Texts.Department,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'name',
        Text: Texts.Name,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'typeName',
        Text: Texts.Type,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'tagType',
        Text: Texts.TagType,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getStringAsync: source => tagTypeHelper.GetNameAsync(source.tagType)
    },
    {
        _propName: 'siteName',
        Text: Texts.Site,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'fullAddr',
        Text: Texts.Addr,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'isBound',
        Text: Texts.BindingState,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
        _getSource: source => StringHelper.IsNotEmpty(source.tagId),
        _getString: source => BindingState.GetName(StringHelper.IsNotEmpty(source.tagId))
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
        _propName: 'isAuto',
        Text: Texts.AllotMode,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getString: IsAuto.GetString,
    },
    {
        _propName: 'isInFence',
        Text: Texts.Fence,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getString: IsInFence.GetString,
    },
    {
        _propName: 'isEnd',
        Text: Texts.IsEnd,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
        _getSource: source => !source.transfer,
        _getString: source => IsEnd.ToString(!source.transfer)
    },
    {
        _propName: 'isFall',
        Text: Texts.IsFall,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getString: IsFall.GetString,
    },
    {
        _propName: 'errorType',
        Text: Texts.ErrorType,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
        _getString: source => ErrorType.GetName(source.errorType)
    },
    {
        _propName: 'transferCode',
        Text: Texts.Transfer,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.Link,
        _onItemClickAsync: async itemModel => {
            const rowData = itemModel._rowModel._rowData
            if (!rowData.transfer) {
                console.warn('The transfer is undefined!')
                return
            }
            transferDetail.Title.value = `${Texts.TransferDetail.value} - ${rowData.assetId}`
            const res = await transferHelper.Get(rowData.transfer)
            if (!res.data) {
                ApiResult.ShowResult(res)
                return
            }
            transfer.Data.value = res.data
            transferDetail.Show()
        }
    },
    {
        _propName: 'plate',
        Text: Texts.Vehicle,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.Link,
        _onItemClickAsync: async itemModel => {
            const rowData = itemModel._rowModel._rowData
            if (!rowData.vehicle) {
                console.warn('The vehicle is undefined!')
                return
            }
            vehicleDetail.Title.value = `${Texts.Vehicle.value} - ${rowData.assetId}`
            const res = await vehicleHelper.Get(rowData.vehicle)
            if (!res.data) {
                ApiResult.ShowResult(res)
                return
            }
            vehicle.Data.value = res.data
            vehicleDetail.Show()
        }
    },
    {
        _propName: 'battery',
        Text: Texts.Battery,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'rfid',
        Text: 'RFID',
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
        _propName: 'bindingTime',
        Text: Texts.BindingTime,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
        _getString: source => ObjectHelper.GetDateString(source.bindingTime)
    },
    {
        _propName: 'calculationTime',
        Text: Texts.CalculateTime,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
        _getString: source => ObjectHelper.GetDateString(source.calculationTime)
    },
    {
        _propName: 'dailyMove',
        Text: Texts.DailyMove,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'monthlyMove',
        Text: Texts.MonthlyMove,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'totalMove',
        Text: Texts.TotalMove,
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'stayDuration',
        Text: TextModel.Computed('StayDuration (h)', '在库时长（时）'),
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'travelDuration',
        Text: TextModel.Computed('TravelDuration (h)', '在途时长（时）'),
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'offlineDuration',
        Text: TextModel.Computed('OfflineDuration (h)', '离线时长（时）'),
        IsReadonly: true,
        IsRequired: false,
        Type: ItemType.TextBox,
    },
])

// 初始化:
assetLedgerTable.IsAllowMultiSelect.value = true

assetLedgerTable._initItem = itemModel => {
    IsEnd.InitItemModel(itemModel)
    IsAuto.InitItemModel(itemModel)
    IsFall.InitItemModel(itemModel)
    IsInFence.InitItemModel(itemModel)
    Battery.InitItemModel(itemModel)
    AssetState.InitItemModel(itemModel)
    OnlineState.InitItemModel(itemModel)
    BindingState.InitItemModel(itemModel)
}

/** 是否允许“调拨” */
export const IsAllowTransfer = computed(() =>
    assetLedgerTable.IsOnlySelected.value
    && !assetLedgerTable.SelectedRowDatas.value[0]?.transfer)
/** 是否允许“入库” */
export const IsAllowInbound = computed(() =>
    assetLedgerTable.IsSelected.value
    && assetLedgerTable.SelectedRowDatas.value.every(r => r.state === AssetStates.Inbound))
/** 是否允许“出库” */
export const IsAllowOutbound = computed(() =>
    assetLedgerTable.IsSelected.value
    && assetLedgerTable.SelectedRowDatas.value.every(r => r.state === AssetStates.InStore || r.state === AssetStates.Stolid))

/** “列筛选”选择器类型 */
export const selectColumnFilter = new ColumnSelectModel(assetLedgerTable, 'assetLedgerTable_Columns')
