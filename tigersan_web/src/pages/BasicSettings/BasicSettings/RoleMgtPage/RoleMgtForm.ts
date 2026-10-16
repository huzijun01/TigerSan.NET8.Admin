import { ref, computed } from 'vue'
import { Colors, DialogHelper, Verify, ObjectHelper, DialogMode, DialogState, FormModel, FormConfig, FormItemConfig, BigintHelper, ArrayHelper, PaginationModel, AuthorityHelper, authorityHelper, GetSubmitResult, IdName, ApiResult, AuthorityModel, loading, Texts, TextModel } from '@/0_tigersan_ui/tigerui'
import { useUserInfo } from '@/stores'
import { roleMgtTable } from './RoleMgtTable'
import { companyHelper, roleHelper, departmentHelper, RoleAuthorityEntity } from '@/models'

export class RoleMgtForm {
    //#region 【Fields】
    /** “权限助手”实例 */
    readonly authorityHelperForm = new AuthorityHelper()
    /** 是否显示“只读复选框” */
    readonly isShowIsReadonly = computed(() => {
        const userInfo = useUserInfo()
        return this.authorityHelperForm._tree.IsActive.value && (userInfo.isRoot || userInfo.authorities.some(
            a => a.path === this.authorityHelperForm._tree.ActiveNode.value?.Path.value && !a.isReadonly
        ))
    })

    // 选择框:
    /** 筛选 */
    readonly selectCompany = companyHelper.GetIdNameSelectModel()
    readonly selectDepartment = departmentHelper.GetIdNameSelectModel()
    /** 表单 */
    readonly selectCompanyForm = companyHelper.GetIdNameSelectModel()
    readonly selectDepartmentForm = departmentHelper.GetIdNameSelectModel()
    /** 分页器 */
    readonly pagination = new PaginationModel()

    /** “公司”项目配置 */
    readonly configCompany: FormItemConfig<RoleAuthorityEntity, IdName> = {
        _propName: 'company',
        PropText: Texts.Company,
        IsEquired: true,
        Target: this.selectCompanyForm.Value,
        _getValue: source => this.selectCompanyForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.company)),
        _setValue: (source, propName, value) => source.company = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.company, 0n, Texts.CannotBeEmpty.value)
    }

    /** “部门”项目配置 */
    readonly configDepartment: FormItemConfig<RoleAuthorityEntity, IdName> = {
        _propName: 'department',
        PropText: Texts.Department,
        IsEquired: true,
        Target: this.selectDepartmentForm.Value,
        _getValue: source => this.selectDepartmentForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.department)),
        _setValue: (source, propName, value) => source.department = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.department, 0n, Texts.CannotBeEmpty.value)
    }

    /** “名称”项目配置 */
    readonly configName: FormItemConfig<RoleAuthorityEntity, string> = {
        _propName: 'name',
        PropText: Texts.Name,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsNotUndefinedOrEmpty(source.name)
    }

    /** “权限”项目配置 */
    readonly configAuthorities: FormItemConfig<RoleAuthorityEntity, number> = {
        _propName: 'authorities',
        PropText: Texts.Authorities,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsNotUndefined(source.authorities)
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new RoleAuthorityEntity()

    /** “角色”表单配置 */
    readonly configRoleMgtForm: FormConfig<RoleAuthorityEntity> = {
        _itemConfigs: [
            this.configCompany,
            this.configDepartment,
            this.configName,
            this.configAuthorities,
        ],
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            this.selectCompanyForm.IsEnabled.value = !isEdit
            this.selectDepartmentForm.IsEnabled.value = !isEdit

            await companyHelper.UpdateIdNames()

            const userInfo = useUserInfo()
            let authorities: AuthorityModel[] = []
            if (isEdit) {
                const rowData = roleMgtTable.SelectedRowDatas.value[0]
                if (!rowData) {
                    console.warn('The rowData is undefined!')
                    return
                }

                await this.selectCompanyForm.UpdateItemsAsync()
                this.selectCompanyForm.Value.value = companyHelper.GetIdName(rowData.company)
                await this.selectDepartmentForm.UpdateItemsAsync()
                this.selectDepartmentForm.Value.value = departmentHelper.GetIdName(rowData.department)

                this.authorityHelperForm.InitTree(rowData.authorities)
                authorities = this.authorityHelperForm.GetAuthorities()
            } else {
                this.authorityHelperForm.InitTree()
                authorities = this.authorityHelperForm.GetAuthorities()
            }

            if (!userInfo.isRoot) {
                this.FilterAuthorities(authorities)
                this.authorityHelperForm.InitTree(authorities)

                this.authorityHelperForm._tree.NodeArray.value.forEach(node => {
                    node.IsShow.value = userInfo.authorities.some(a => a.path === node.Path.value)
                })

                this.authorityHelperForm._tree.UpdateHeight()
            }
        }
    }

    /** “角色”表单模型 */
    readonly roleForm = new FormModel(this.configRoleMgtForm)
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor() {
        this.authorityHelperForm._tree._configs = authorityHelper._tree._configs
        this.selectCompany._getItemsAsync = async () => await roleHelper.GetBelongCompanyListAsync()
        this.selectDepartment._getItemsAsync = async () => await roleHelper.GetBelongDepartmentListAsync(this.selectCompany.Value.value?.id)
        this.selectDepartmentForm._getItemsAsync = async () => await departmentHelper.GetIdNamesByCompany(this.selectCompanyForm.Value.value?.id)

        // 更新:
        this.selectCompanyForm._onChange = this.selectDepartmentForm.UpdateItemsAsync
        this.pagination.IsShowSelectedRowCount.value = true
        this.pagination._onChange = this.Refresh
        this.selectCompany._onChange = this.Refresh
        this.selectDepartment._onChange = this.Refresh
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            await companyHelper.UpdateIdNames()
            await departmentHelper.UpdateIdNames()
            await this.selectCompany.UpdateItemsAsync()
            await this.selectDepartment.UpdateItemsAsync()

            this.pagination.Count.value = await roleHelper.GetCount({
                company: this.selectCompany.Value.value?.id,
                department: this.selectDepartment.Value.value?.id,
            })

            await roleHelper.GetList({
                pageSize: this.pagination.PageSize.value,
                pageNumber: this.pagination.SelectedNum.value,
                company: this.selectCompany.Value.value?.id,
                department: this.selectDepartment.Value.value?.id,
            }).then(arr => {
                ArrayHelper.Set(roleMgtTable.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = () => {
        this.roleForm.Title.value = TextModel.GetText('Add Role', '新增角色')

        this.roleForm._getSource = this.AddGetSource

        this.roleForm._onSubmitAsync = async source => {
            source.authorities = this.authorityHelperForm.GetAuthorities()
            const res = await roleHelper.Add(source)

            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.roleForm.Show()
    }

    /** 改 */
    readonly Edit = () => {
        this.roleForm.Title.value = TextModel.GetText('Edit Role', '修改角色')

        this.roleForm._getSource = () => {
            const rowData = roleMgtTable.SelectedRowDatas.value[0]

            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new RoleAuthorityEntity()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.roleForm._onSubmitAsync = async source => {
            source.authorities = this.authorityHelperForm.GetAuthorities()
            const res = await roleHelper.Edit(source)

            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.roleForm.Show(true)
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

        const model = roleMgtTable.SelectedRowDatas.value[0]
        if (!model) {
            console.warn('The model is undefined!')
            return
        }

        try {
            loading.IsShow.value = true

            await roleHelper.Delete(model.id).then(res => {
                this.Refresh()
                ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 过滤权限 */
    readonly FilterAuthorities = (authorities: AuthorityModel[]) => {
        const userInfo = useUserInfo()
        const unavailables = new Array<AuthorityModel>

        authorities.forEach(authority => {
            const find = userInfo.authorities.find(i => i.path === authority.path);
            if (!find) {
                unavailables.push(authority)
                return
            }

            if (find.isReadonly) {
                authority.isReadonly = true
                return
            }
        })

        unavailables.forEach(u => ArrayHelper.Delete(authorities, u))
    }
    //#endregion 【Functions】
}