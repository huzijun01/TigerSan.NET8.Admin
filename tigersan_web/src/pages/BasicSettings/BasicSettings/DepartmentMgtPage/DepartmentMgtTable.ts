import { companyHelper, DepartmentEntity } from '@/models'
import { ItemType, TableModel, Texts } from '@/0_tigersan_ui/tigerui'

/** 列头 */
export const departmentMgtTable = new TableModel<DepartmentEntity>([
    {
        _propName: 'company',
        Text: Texts.Company,
        IsReadonly: true,
        Type: ItemType.TextBox,
        _getStringAsync: source => companyHelper.GetNameAsync(source.company)
    },
    {
        _propName: 'name',
        Text: Texts.Name,
        IsReadonly: true,
        Type: ItemType.TextBox,
    },
])

// 初始化:
departmentMgtTable.IsAllowMultiSelect.value = false