import { ItemType, TableModel, Texts } from '@/0_tigersan_ui/tigerui'
import { companyHelper, departmentHelper, RoleAuthorityEntity } from '@/models'

/** 列头 */
export const roleMgtTable = new TableModel<RoleAuthorityEntity>([
    {
        _propName: 'company',
        Text: Texts.Company,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getStringAsync: source => companyHelper.GetNameAsync(source.company)
    },
    {
        _propName: 'department',
        Text: Texts.Department,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getStringAsync: source => departmentHelper.GetNameAsync(source.department)
    },
    {
        _propName: 'name',
        Text: Texts.Name,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
])

// 初始化:
roleMgtTable.IsAllowMultiSelect.value = false