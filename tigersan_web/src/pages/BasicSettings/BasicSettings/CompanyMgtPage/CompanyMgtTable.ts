import { CompanyEntity } from '@/models'
import { ItemType, TableModel, Texts } from '@/0_tigersan_ui/tigerui'

export const companyMgtTable = new TableModel<CompanyEntity>([
    {
        _propName: 'Name',
        Text: Texts.Name,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'Addr',
        Text: Texts.Addr,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
])
companyMgtTable.IsAllowMultiSelect.value = false

// 初始化:
companyMgtTable._initHeader = headerModel => {
    if (headerModel._propName === 'id') {
        headerModel.Width.value = 100
    }
}

companyMgtTable._initItem = itemModel => {
}