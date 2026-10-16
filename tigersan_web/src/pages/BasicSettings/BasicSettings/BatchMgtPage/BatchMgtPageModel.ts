import { ref } from 'vue'
import { Colors, DialogHelper, Verify, ObjectHelper, DialogMode, DialogState, FormModel, FormConfig, FormItemConfig, ArrayHelper, BigintHelper, PasswordModel, SearchModel, GetSubmitResult, IdName, ApiResult, loading, PaginationModel, Texts, TextModel } from '@/0_tigersan_ui/tigerui'
import { batchMgtTable } from './BatchMgtTable'
import { companyHelper, scenarioHelper, BatchEntity, batchHelper } from '@/models'

export class BatchMgtPageModel {
    //#region 【Fields】
    /** 密码是否改变 */
    isPasswordChanged = false

    /** 分页器 */
    readonly pagination = new PaginationModel()

    // 选择框:
    /** 筛选 */
    readonly selectCompany = companyHelper.GetIdNameSelectModel()
    readonly selectScenario = scenarioHelper.GetIdNameSelectModel()
    /** 表单 */
    readonly selectCompanyForm = companyHelper.GetIdNameSelectModel()
    readonly selectScenarioForm = scenarioHelper.GetIdNameSelectModel()

    /** 搜索框 */
    readonly searchBatchId = new SearchModel()

    /** 密码框 */
    readonly password = new PasswordModel()

    /** “公司”项目配置 */
    readonly configCompany: FormItemConfig<BatchEntity, IdName> = {
        _propName: 'company',
        PropText: Texts.Company,
        IsEquired: true,
        Target: this.selectCompanyForm.Value,
        _getValue: source => this.selectCompanyForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.company)),
        _setValue: (source, propName, value) => source.company = value && value.id != undefined ? value.id : 0n,
        // _isVerifyOk: source => Verify.IsBigintGreaterThan(source.company, 0n, Texts.CannotBeEmpty.value)
    }

    /** “场景”项目配置 */
    readonly configScenario: FormItemConfig<BatchEntity, IdName> = {
        _propName: 'scenario',
        PropText: Texts.Scenario,
        IsEquired: true,
        Target: this.selectScenarioForm.Value,
        _getValue: source => this.selectScenarioForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.scenario)),
        _setValue: (source, propName, value) => source.scenario = value && value.id != undefined ? value.id : 0n,
        // _isVerifyOk: source => Verify.IsBigintGreaterThan(source.scenario, 0n, Texts.CannotBeEmpty.value)
    }

    /** “批次”项目配置 */
    readonly configBatchId: FormItemConfig<BatchEntity, string> = {
        _propName: 'batchId',
        PropText: Texts.Batch,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsNotUndefinedOrEmpty(source.batchId)
    }

    /** “联系人”项目配置 */
    readonly configManager: FormItemConfig<BatchEntity, string> = {
        _propName: 'manager',
        PropText: Texts.Manager,
        IsEquired: false,
        Target: ref(),
    }

    /** “电话”项目配置 */
    readonly configPhone: FormItemConfig<BatchEntity, string> = {
        _propName: 'phone',
        PropText: Texts.Phone,
        IsEquired: false,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidPhoneNumber(source.phone)
    }

    /** “备注”项目配置 */
    readonly configComment: FormItemConfig<BatchEntity, string> = {
        _propName: 'comment',
        PropText: Texts.Comment,
        IsEquired: false,
        Target: ref(),
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new BatchEntity()

    /** “批次”表单配置 */
    readonly configBatchMgtForm: FormConfig<BatchEntity> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            this.isPasswordChanged = false
            this.password.IsShowValue.value = false
            if (isEdit) {
                const rowData = batchMgtTable.SelectedRowDatas.value[0]
                if (!rowData) {
                    console.warn('The rowData is undefined!')
                    return
                }

                await this.selectCompanyForm.UpdateItemsAsync()
                this.selectCompanyForm.Value.value = companyHelper.GetIdName(rowData.company)
                await this.selectScenarioForm.UpdateItemsAsync()
                this.selectScenarioForm.Value.value = scenarioHelper.GetIdName(rowData.scenario)
            }
        },
        _itemConfigs: [
            this.configCompany,
            this.configScenario,
            this.configBatchId,
            this.configManager,
            this.configPhone,
            this.configComment,
        ]
    }

    /** “批次”表单模型 */
    readonly batchForm = new FormModel(this.configBatchMgtForm)
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor() {
        this.password.Width.value = '108px'
        this.pagination.IsShowSelectedRowCount.value = true

        this.searchBatchId.Placeholder.value = Texts.Batch

        // 更新:
        this.searchBatchId._onChange = this.Refresh
        this.searchBatchId._onSearch = this.Refresh
        this.selectCompanyForm._onChange = this.selectScenarioForm.UpdateItemsAsync
        this.pagination._onChange = this.Refresh
        this.selectCompany._onChange = this.Refresh
        this.selectScenario._onChange = this.Refresh
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            await companyHelper.UpdateIdNames()
            await scenarioHelper.UpdateIdNames()
            await this.selectCompany.UpdateItemsAsync()
            await this.selectScenario.UpdateItemsAsync()

            this.pagination.Count.value = await batchHelper.GetCount({
                company: this.selectCompany.Value.value?.id,
                scenario: this.selectScenario.Value.value?.id,
                batchId: this.searchBatchId.Value.value,
            })

            await batchHelper.GetList({
                pageSize: this.pagination.PageSize.value,
                pageNumber: this.pagination.SelectedNum.value,
                company: this.selectCompany.Value.value?.id,
                scenario: this.selectScenario.Value.value?.id,
                batchId: this.searchBatchId.Value.value,
            }).then(arr => {
                ArrayHelper.Set(batchMgtTable.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = async () => {
        this.batchForm.Title.value = TextModel.GetText('Add Batch', '新增批次')

        this.batchForm._getSource = this.AddGetSource

        this.batchForm._onSubmitAsync = async source => {
            const res = await batchHelper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.batchForm.Show()
    }

    /** 改 */
    readonly Edit = async () => {
        this.batchForm.Title.value = TextModel.GetText('Edit Batch', '修改批次')

        this.batchForm._getSource = () => {
            const rowData = batchMgtTable.SelectedRowDatas.value[0]
            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new BatchEntity()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.batchForm._onSubmitAsync = async source => {
            const res = await batchHelper.Edit(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.batchForm.Show(true)
    }

    /** 删 */
    readonly Delete = async () => {
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

        const model = batchMgtTable.SelectedRowDatas.value[0]
        if (!model) {
            console.warn('The model is undefined!')
            return
        }

        try {
            loading.IsShow.value = true

            await batchHelper.Delete(model.id).then(res => {
                this.Refresh()
                ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
            })
        } finally {
            loading.IsShow.value = false
        }
    }
    //#endregion 【Functions】
}