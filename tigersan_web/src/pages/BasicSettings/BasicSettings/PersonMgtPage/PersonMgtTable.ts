import { ItemType, TableModel, Texts } from '@/0_tigersan_ui/tigerui'
import { companyHelper, departmentHelper, PersonEntity, roleHelper } from '@/models'

/** 列头 */
export const personMgtTable = new TableModel<PersonEntity>([
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
        _propName: 'role',
        Text: Texts.Role,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getStringAsync: source => roleHelper.GetNameAsync(source.role)
    },
    {
        _propName: 'username',
        Text: Texts.Username,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
    {
        _propName: 'nickname',
        Text: Texts.Nickname,
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
        _propName: 'mail',
        Text: Texts.Mail,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
])

// 初始化:
personMgtTable.IsAllowMultiSelect.value = false