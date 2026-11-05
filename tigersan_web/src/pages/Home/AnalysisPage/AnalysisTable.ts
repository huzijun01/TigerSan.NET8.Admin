import { AssetStateRecordDto } from '@/models'
import { ItemType, ObjectHelper, TableModel, Texts } from '@/0_tigersan_ui/tigerui'
import { computed } from 'vue'

/** 列头 */
export const analysisTable = new TableModel<AssetStateRecordDto>([
    {
        _propName: 'companyName',
        Text: Texts.Company,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'time',
        Text: Texts.Time,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getString: source => ObjectHelper.GetDateString(source.time, true, false)
    },
    {
        _propName: 'count',
        Text: Texts.Count,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'noRecord',
        Text: Texts.NoRecord,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'noRecordPerc',
        Text: computed(() => Texts.NoRecord.value + '（%）'),
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'inbound',
        Text: Texts.Inbound,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'inboundPerc',
        Text: computed(() => Texts.Inbound.value + '（%）'),
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'inStore',
        Text: Texts.InStore,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'inStorePerc',
        Text: computed(() => Texts.InStore.value + '（%）'),
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'stolid',
        Text: Texts.Stolid,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'stolidPerc',
        Text: computed(() => Texts.Stolid.value + '（%）'),
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'outbound',
        Text: Texts.Outbound,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'outboundPerc',
        Text: computed(() => Texts.Outbound.value + '（%）'),
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'inTransit',
        Text: Texts.InTransit,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'inTransitPerc',
        Text: computed(() => Texts.InTransit.value + '（%）'),
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'timeout',
        Text: Texts.Timeout,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'timeoutPerc',
        Text: computed(() => Texts.Timeout.value + '（%）'),
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
])

// 初始化:
analysisTable.IsAllowMultiSelect.value = false