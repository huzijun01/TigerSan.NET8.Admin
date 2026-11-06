import { ref } from 'vue'
import { PaginationModel, FormItemConfig, Verify, FormConfig, FormModel, TableModel, ItemType, loading, ArrayHelper, GetSubmitResult, ObjectHelper, DialogHelper, DialogMode, Colors, DialogState, ApiResult, BigintHelper, Texts, SearchModel, IdName } from '@/0_tigersan_ui/tigerui'
import { companyHelper, repairHelper, RepairDto, RepairState, repairTypeHelper } from '@/models'

export class RepairPageModel {
    //#region 【Fields】
    /** 搜索框 */
    readonly searchCode = new SearchModel()
    // 筛选:
    readonly selectCompany = companyHelper.GetIdNameSelectModel()
    readonly selectState = RepairState.GetSelectModel()
    readonly selectType = repairTypeHelper.GetIdNameSelectModel()
    // 表单:
    readonly selectCompanyForm = companyHelper.GetIdNameSelectModel()
    readonly selectStateForm = RepairState.GetSelectModel()
    readonly selectTypeForm = repairTypeHelper.GetIdNameSelectModel()

    /** 分页器 */
    readonly pagination = new PaginationModel()

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new RepairDto()

    /** “资产ID”项目配置 */
    readonly configAssetId: FormItemConfig<RepairDto, string> = {
        _propName: 'assetId',
        PropText: Texts.AssetId,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.assetId)
        }
    }

    /** “类型”项目配置 */
    readonly configType: FormItemConfig<RepairDto, IdName> = {
        _propName: 'type',
        PropText: Texts.Type,
        IsEquired: true,
        Target: this.selectTypeForm.Value,
        _getValue: source => this.selectTypeForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.type)),
        _setValue: (source, propName, value) => source.type = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.type, 0n, Texts.CannotBeEmpty.value)
    }

    /** “费用”项目配置 */
    readonly configCost: FormItemConfig<RepairDto, string> = {
        _propName: 'cost',
        PropText: Texts.Cost,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => {
            return Verify.IsGreaterThan(source.cost)
        }
    }

    /** “编号”项目配置 */
    readonly configCode: FormItemConfig<RepairDto, string> = {
        _propName: 'code',
        PropText: Texts.Code,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.code)
        }
    }

    /** “备注”项目配置 */
    readonly configComment: FormItemConfig<RepairDto, string> = {
        _propName: 'comment',
        PropText: Texts.Comment,
        IsEquired: false,
        Target: ref(),
    }

    /** 表单配置 */
    readonly configForm: FormConfig<RepairDto> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            await companyHelper.UpdateIdNames()
            await this.selectCompanyForm.UpdateItemsAsync()
            await repairTypeHelper.UpdateIdNames()
            await this.selectTypeForm.UpdateItemsAsync()
        },
        _itemConfigs: [
            this.configAssetId,
            this.configType,
            this.configCost,
            this.configCode,
            this.configComment,
        ]
    }

    /** 表单模型 */
    readonly form: FormModel<RepairDto> = new FormModel(this.configForm)

    /** 表格模型 */
    readonly table = new TableModel<RepairDto>([
        {
            _propName: 'company',
            Text: Texts.Company,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getStringAsync: source => companyHelper.GetNameAsync(source.company)
        },
        {
            _propName: 'assetId',
            Text: Texts.AssetId,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'type',
            Text: Texts.Type,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getStringAsync: source => repairTypeHelper.GetNameAsync(source.type)
        },
        {
            _propName: 'state',
            Text: Texts.State,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getString: source => RepairState.GetName(source.state)
        },
        {
            _propName: 'logistics',
            Text: Texts.Logistics,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'cost',
            Text: Texts.Cost,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'comment',
            Text: Texts.Comment,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
        },
    ])
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor() {
        this.selectType._isAutoUpdate = false
        this.selectTypeForm._isAutoUpdate = false
        this.searchCode.Placeholder.value = Texts.Code
        this.searchCode._onChange = this.Refresh
        this.searchCode._onSearch = this.Refresh
        this.table.IsAllowMultiSelect.value = false
        this.pagination.IsShowSelectedRowCount.value = true
        this.pagination._onChange = this.Refresh
        this.selectCompany._onChange = this.Refresh
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            await companyHelper.UpdateIdNames()
            await this.selectCompany.UpdateItemsAsync()
            await repairTypeHelper.UpdateIdNames()
            await this.selectType.UpdateItemsAsync()

            this.pagination.Count.value = await repairHelper.GetCount({
                company: this.selectCompany.Value.value?.id,
                code: this.searchCode.Value.value,
            })
            await repairHelper.GetList({
                pageSize: this.pagination.PageSize.value,
                pageNumber: this.pagination.SelectedNum.value,
                company: this.selectCompany.Value.value?.id,
                code: this.searchCode.Value.value,
            }).then(arr => {
                ArrayHelper.Set(this.table.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = async () => {
        this.form.Title.value = `${Texts.Add.value}${Texts.Repair.value}`

        this.form._getSource = this.AddGetSource

        this.form._onSubmitAsync = async source => {
            const res = await repairHelper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.form.Show()
    }


    /** 改 */
    readonly Edit = async () => {
        this.form.Title.value = `${Texts.Edit.value} ${Texts.Repair.value}`

        this.form._getSource = () => {
            const rowData = this.table.SelectedRowDatas.value[0]

            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new RepairDto()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.form._onSubmitAsync = async source => {
            const res = await repairHelper.Edit(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.form.Show()
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

        const model = this.table.SelectedRowDatas.value[0]
        if (!model) {
            console.warn('The model is undefined!')
            return
        }

        repairHelper.Delete(model.id).then(res => {
            this.Refresh()
            ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
        })
    }
    //#endregion 【Functions】
}
