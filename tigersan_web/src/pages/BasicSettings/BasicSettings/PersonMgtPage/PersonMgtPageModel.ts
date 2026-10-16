import { ref } from 'vue'
import { Colors, DialogHelper, Verify, ObjectHelper, DialogMode, DialogState, FormModel, FormConfig, FormItemConfig, ArrayHelper, BigintHelper, PasswordModel, SearchModel, GetSubmitResult, IdName, ApiResult, loading, PaginationModel, Texts, TextModel } from '@/0_tigersan_ui/tigerui'
import { personMgtTable } from './PersonMgtTable'
import { companyHelper, personHelper, departmentHelper, roleHelper, PersonEntity } from '@/models'

export class PersonMgtPageModel {
    //#region 【Fields】
    // 选择框:
    /** 筛选 */
    readonly selectCompany = companyHelper.GetIdNameSelectModel()
    readonly selectDepartment = departmentHelper.GetIdNameSelectModel()
    readonly selectRole = roleHelper.GetIdNameSelectModel()
    /** 表单 */
    readonly selectCompanyForm = companyHelper.GetIdNameSelectModel()
    readonly selectDepartmentForm = departmentHelper.GetIdNameSelectModel()
    readonly selectRoleForm = roleHelper.GetIdNameSelectModel()
    /** 搜索框 */
    readonly searchName = new SearchModel()
    /** 密码框 */
    readonly password = new PasswordModel()
    /** 分页器 */
    readonly pagination = new PaginationModel()

    /** “公司”项目配置 */
    readonly configCompany: FormItemConfig<PersonEntity, IdName> = {
        _propName: 'company',
        PropText: Texts.Company,
        IsEquired: false,
        Target: ref(),
        _getValue: source => this.selectCompanyForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.company)),
        _setValue: (source, propName, value) => source.company = value && value.id != undefined ? value.id : 0n,
        // _isVerifyOk: source => Verify.IsBigintGreaterThan(source.company, 0n, Texts.CannotBeEmpty.value)
    }

    /** “部门”项目配置 */
    readonly configDepartment: FormItemConfig<PersonEntity, IdName> = {
        _propName: 'department',
        PropText: Texts.Department,
        IsEquired: false,
        Target: ref(),
        _getValue: source => this.selectDepartmentForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.department)),
        _setValue: (source, propName, value) => source.department = value && value.id != undefined ? value.id : 0n,
        // _isVerifyOk: source => Verify.IsBigintGreaterThan(source.department, 0n, Texts.CannotBeEmpty.value)
    }

    /** “角色”项目配置 */
    readonly configRole: FormItemConfig<PersonEntity, IdName> = {
        _propName: 'role',
        PropText: Texts.Role,
        IsEquired: true,
        Target: this.selectRoleForm.Value,
        _getValue: source => this.selectRoleForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.role)),
        _setValue: (source, propName, value) => source.role = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.role, 0n, Texts.CannotBeEmpty.value)
    }

    /** “用户名”项目配置 */
    readonly configUsername: FormItemConfig<PersonEntity, string> = {
        _propName: 'username',
        PropText: Texts.Username,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidUsername(source.username)
    }

    /** “昵称”项目配置 */
    readonly configTagId: FormItemConfig<PersonEntity, string> = {
        _propName: 'nickname',
        PropText: Texts.Nickname,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidNickname(source.nickname)
    }

    /** “密码”项目配置 */
    readonly configPassword: FormItemConfig<PersonEntity, string> = {
        _propName: 'password',
        PropText: Texts.Password,
        IsEquired: true,
        Target: this.password.Value,
        _isVerifyOk: (source, isEdit) => {
            if (isEdit && source.password === '') return Verify.OK()
            return Verify.IsValidWeekPassword(source.password)
        }
    }

    /** “电话”项目配置 */
    readonly configPhone: FormItemConfig<PersonEntity, string> = {
        _propName: 'phone',
        PropText: Texts.Phone,
        IsEquired: false,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidPhoneNumber(source.phone)
    }

    /** “邮箱”项目配置 */
    readonly configMail: FormItemConfig<PersonEntity, string> = {
        _propName: 'mail',
        PropText: Texts.Mail,
        IsEquired: false,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidEmail(source.mail)
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new PersonEntity()

    /** “人员”表单配置 */
    readonly configPersonMgtForm: FormConfig<PersonEntity> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            this.password.IsShowValue.value = false
            if (isEdit) {
                const rowData = personMgtTable.SelectedRowDatas.value[0]
                if (!rowData) {
                    console.warn('The rowData is undefined!')
                    return
                }

                await this.selectCompanyForm.UpdateItemsAsync()
                this.selectCompanyForm.Value.value = companyHelper.GetIdName(rowData.company)
                await this.selectDepartmentForm.UpdateItemsAsync()
                this.selectDepartmentForm.Value.value = departmentHelper.GetIdName(rowData.department)
                await this.selectRoleForm.UpdateItemsAsync()
                this.selectRoleForm.Value.value = roleHelper.GetIdName(rowData.role)
            }
        },
        _itemConfigs: [
            this.configCompany,
            this.configDepartment,
            this.configRole,
            this.configUsername,
            this.configTagId,
            this.configPassword,
            this.configPhone,
            this.configMail,
        ]
    }

    /** “人员”表单模型 */
    readonly personForm = new FormModel(this.configPersonMgtForm)
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor() {
        this.selectCompany._getItemsAsync = async () => await personHelper.GetBelongCompanyListAsync()
        this.selectDepartment._getItemsAsync = async () => await personHelper.GetBelongDepartmentListAsync(this.selectCompany.Value.value?.id)
        this.selectRole._getItemsAsync = async () => await personHelper.GetBelongRoleListAsync(this.selectDepartment.Value.value?.id)
        this.selectDepartmentForm._getItemsAsync = async () => await departmentHelper.GetIdNamesByCompany(this.selectCompanyForm.Value.value?.id)
        this.selectRoleForm._getItemsAsync = async () => await roleHelper.SelectIdNameByDepartment(this.selectDepartmentForm.Value.value?.id)
        // 更新:
        this.selectCompanyForm._onChange = this.selectDepartmentForm.UpdateItemsAsync
        this.selectDepartmentForm._onChange = this.selectRoleForm.UpdateItemsAsync
        this.pagination._onChange = this.Refresh
        this.selectCompany._onChange = this.Refresh
        this.selectDepartment._onChange = this.Refresh
        this.selectRole._onChange = this.Refresh


        this.password.Width.value = '108px'
        this.searchName.Placeholder.value = TextModel.Computed("Username/Nickname", "用户名/昵称")
        this.searchName._onChange = this.Refresh
        this.searchName._onSearch = this.Refresh
        this.pagination.IsShowSelectedRowCount.value = true
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            await companyHelper.UpdateIdNames()
            await departmentHelper.UpdateIdNames()
            await roleHelper.UpdateIdNames()
            await this.selectCompany.UpdateItemsAsync()
            await this.selectDepartment.UpdateItemsAsync()
            await this.selectRole.UpdateItemsAsync()

            this.pagination.Count.value = await personHelper.GetCount({
                company: this.selectCompany.Value.value?.id,
                department: this.selectDepartment.Value.value?.id,
                role: this.selectRole.Value.value?.id,
                name: this.searchName.Value.value,
            })

            await personHelper.GetList({
                pageSize: this.pagination.PageSize.value,
                pageNumber: this.pagination.SelectedNum.value,
                company: this.selectCompany.Value.value?.id,
                department: this.selectDepartment.Value.value?.id,
                role: this.selectRole.Value.value?.id,
                name: this.searchName.Value.value,
            }).then(arr => {
                ArrayHelper.Set(personMgtTable.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = async () => {
        this.personForm.Title.value = TextModel.GetText('Add Person', '新增人员')

        this.personForm._getSource = this.AddGetSource

        this.personForm._onSubmitAsync = async source => {
            const res = await personHelper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.personForm.Show()
    }

    /** 改 */
    readonly Edit = () => {
        this.personForm.Title.value = TextModel.GetText('Edit Person', '修改人员')

        this.personForm._getSource = () => {
            const rowData = personMgtTable.SelectedRowDatas.value[0]
            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new PersonEntity()
            }

            const data = ObjectHelper.ShallowCopy(rowData)
            data.password = ''
            return data
        }

        this.personForm._onSubmitAsync = async source => {
            const res = await personHelper.Edit(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.personForm.Show(true)
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

        const model = personMgtTable.SelectedRowDatas.value[0]
        if (!model) {
            console.warn('The model is undefined!')
            return
        }

        try {
            loading.IsShow.value = true

            await personHelper.Delete(model.id).then(res => {
                this.Refresh()
                ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
            })
        } finally {
            loading.IsShow.value = false
        }
    }
    //#endregion 【Functions】
}