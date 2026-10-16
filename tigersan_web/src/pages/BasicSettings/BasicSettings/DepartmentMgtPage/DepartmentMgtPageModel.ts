import { ref } from 'vue'
import { Colors, DialogHelper, Verify, ObjectHelper, DialogMode, DialogState, FormModel, FormConfig, FormItemConfig, BigintHelper, ArrayHelper, PaginationModel, GetSubmitResult, IdName, ApiResult, loading, Texts, TextModel } from '@/0_tigersan_ui/tigerui'
import { departmentMgtTable } from './DepartmentMgtTable'
import { companyHelper, departmentHelper, DepartmentEntity } from '@/models'

export class DepartmentMgtPageModel {
    //#region 【Fields】
    /** “公司”选择（筛选） */
    readonly selectCompany = companyHelper.GetIdNameSelectModel()
    /** “公司”选择（表单） */
    readonly selectCompanyForm = companyHelper.GetIdNameSelectModel()

    /** 分页器 */
    readonly pagination = new PaginationModel()

    /** “公司”项目配置 */
    readonly configCompany: FormItemConfig<DepartmentEntity, IdName> = {
        _propName: 'company',
        PropText: Texts.Company,
        IsEquired: true,
        Target: this.selectCompanyForm.Value,
        _getValue: source => this.selectCompanyForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.company)),
        _setValue: (source, propName, value) => source.company = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.company, 0n, Texts.CannotBeEmpty.value)
    }

    /** “名称”项目配置 */
    readonly configName: FormItemConfig<DepartmentEntity, string> = {
        _propName: 'name',
        PropText: Texts.Name,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.name)
        }
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new DepartmentEntity()

    /** “部门”表单配置 */
    readonly configDepartmentMgtPageModel: FormConfig<DepartmentEntity> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            await companyHelper.UpdateIdNames()
            await this.selectCompanyForm.UpdateItemsAsync()
        },
        _itemConfigs: [
            this.configCompany,
            this.configName,
        ]
    }

    /** “部门”表单模型 */
    readonly departmentForm = new FormModel(this.configDepartmentMgtPageModel)
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor() {
        this.pagination.IsShowSelectedRowCount.value = true
        this.pagination._onChange = this.Refresh
        this.selectCompany._onChange = this.Refresh
        this.selectCompany._getItemsAsync = async () => await departmentHelper.GetBelongCompanyListAsync()
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            await companyHelper.UpdateIdNames()
            await this.selectCompany.UpdateItemsAsync()

            this.pagination.Count.value = await departmentHelper.GetCount({
                company: this.selectCompany.Value.value?.id
            })

            await departmentHelper.GetList({
                pageSize: this.pagination.PageSize.value,
                pageNumber: this.pagination.SelectedNum.value,
                company: this.selectCompany.Value.value?.id,
            }).then(arr => {
                ArrayHelper.Set(departmentMgtTable.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = async () => {
        this.departmentForm.Title.value = TextModel.GetText('Add Department', '新增部门')

        this.departmentForm._getSource = this.AddGetSource

        this.departmentForm._onSubmitAsync = async source => {
            const res = await departmentHelper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.departmentForm.Show()
    }

    /** 改 */
    readonly Edit = async () => {
        this.departmentForm.Title.value = TextModel.GetText('Edit Department', '修改部门')

        this.departmentForm._getSource = () => {
            const rowData = departmentMgtTable.SelectedRowDatas.value[0]

            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new DepartmentEntity()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.departmentForm._onSubmitAsync = async source => {
            const res = await departmentHelper.Edit(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.departmentForm.Show()
    }

    /** 删 */
    readonly Delete = () => {
        DialogHelper.Show(
            Texts.Confirm,
            Texts.DeleteConfirm.value,
            undefined,
            this.DeleteRowData,
            DialogMode.YesOrNo,
            Colors.Warning)
    }

    readonly DeleteRowData = async (state: DialogState) => {
        if (state != DialogState.Yes) return

        const rowData = departmentMgtTable.SelectedRowDatas.value[0]
        if (!rowData) {
            console.warn('The rowData is undefined!')
            return
        }

        try {
            loading.IsShow.value = true

            await departmentHelper.Delete(rowData.id).then(res => {
                this.Refresh()
                ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
            })
        } finally {
            loading.IsShow.value = false
        }
    }
    //#endregion 【Functions】
}