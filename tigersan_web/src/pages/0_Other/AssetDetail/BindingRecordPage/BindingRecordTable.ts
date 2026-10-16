import { BindingRecordDto, IsBinding } from '@/models'
import { ItemType, ObjectHelper, TableModel, Texts } from '@/0_tigersan_ui/tigerui'

/** 列头 */
export function GetTableModel() {
    const table = new TableModel<BindingRecordDto>([
        {
            _propName: 'isBinding',
            Text: Texts.Operation,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getString: IsBinding.GetString
        },
        {
            _propName: 'assetId',
            Text: Texts.AssetId,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'tagId',
            Text: Texts.TagId,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'time',
            Text: Texts.Time,
            IsReadonly: true,
            IsShowSlot: true,
            Type: ItemType.TextBox,
            _getString: source => ObjectHelper.GetDateString(source.time)
        },
    ])

    // 初始化:
    table.IsAllowMultiSelect.value = false

    table._initItem = itemModel => {
        IsBinding.InitItemModel(itemModel)
    }

    return table
}