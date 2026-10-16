import { companyHelper, siteTypeHelper, SiteEntity } from '@/models'
import { ItemType, TableModel, Texts } from '@/0_tigersan_ui/tigerui'

/** 列头 */
export const siteMgtTable = new TableModel<SiteEntity>([
    {
        _propName: 'company',
        Text: Texts.Company,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getStringAsync: source => companyHelper.GetNameAsync(source.company)
    },
    {
        _propName: 'type',
        Text: Texts.Type,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getStringAsync: source => siteTypeHelper.GetNameAsync(source.type)
    },
    {
        _propName: 'code',
        Text: Texts.Code,
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
    // {
    //     _propName: 'longitude',
    //     Text: '经纬度',
    //     IsReadonly: true,
    //     Type: ItemType.TextBox,
    //     _getString: source => `${source.longitude}, ${source.latitude}`
    // },
    {
        _propName: 'manager',
        Text: Texts.Manager,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'phone',
        Text: Texts.Phone,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'comment',
        Text: Texts.Comment,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
])

// 初始化:
siteMgtTable.IsAllowMultiSelect.value = false