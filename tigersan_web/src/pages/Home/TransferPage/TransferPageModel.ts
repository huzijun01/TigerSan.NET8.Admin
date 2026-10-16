import { ref } from 'vue'
import { PaginationModel, FormItemConfig, IdName, Verify, FormConfig, FormModel, TableModel, ItemType, loading, ArrayHelper, GetSubmitResult, ObjectHelper, DialogHelper, DialogMode, Colors, DialogState, ApiResult, BigintHelper, Texts, SearchModel, IsEnd, StringHelper, TextModel } from '@/0_tigersan_ui/tigerui'
import { siteHelper, transferHelper, TransferModel } from '@/models'

export class TransferPageModel {
    //#region 【Fields】
    /** “编号”搜索框 */
    readonly searchCode = new SearchModel()
    /** “资产ID”搜索框 */
    readonly searchAssetId = new SearchModel()
    /** “起点”选择（筛选） */
    readonly selectOrigin = siteHelper.GetIdNameSelectModel()
    /** “终点”选择（筛选） */
    readonly selectTarget = siteHelper.GetIdNameSelectModel()
    /** “终点”选择（表单） */
    readonly selectTargetForm = siteHelper.GetIdNameSelectModel()

    /** 分页器 */
    readonly pagination = new PaginationModel()

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => {
        const transfer = new TransferModel()
        transfer.code = ObjectHelper.GetDateId()
        return transfer
    }

    /** “终点”项目配置 */
    readonly configTarget: FormItemConfig<TransferModel, IdName> = {
        _propName: 'target',
        PropText: Texts.Target,
        IsEquired: true,
        Target: this.selectTargetForm.Value,
        _getValue: source => this.selectTargetForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.target)),
        _setValue: (source, propName, value) => source.target = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.target, 0n, Texts.CannotBeEmpty.value)
    }

    /** “资产ID”项目配置 */
    readonly configAssetId: FormItemConfig<TransferModel, string> = {
        _propName: 'assetId',
        PropText: Texts.AssetId,
        IsEquired: true,
        Target: ref(),
    }

    /** “编号”项目配置 */
    readonly configCode: FormItemConfig<TransferModel, string> = {
        _propName: 'code',
        PropText: Texts.Code,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsNotUndefinedOrEmpty(source.code)
    }

    /** “物流”项目配置 */
    readonly configLogistics: FormItemConfig<TransferModel, string> = {
        _propName: 'logistics',
        PropText: Texts.Logistics,
        IsEquired: false,
        Target: ref(),
    }

    /** “司机”项目配置 */
    readonly configDriver: FormItemConfig<TransferModel, string> = {
        _propName: 'driver',
        PropText: Texts.Driver,
        IsEquired: false,
        Target: ref(),
    }

    /** “电话”项目配置 */
    readonly configPhone: FormItemConfig<TransferModel, string> = {
        _propName: 'phone',
        PropText: Texts.Phone,
        IsEquired: false,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidPhoneNumber(source.phone)
    }

    /** 表单配置 */
    readonly configForm: FormConfig<TransferModel> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            await siteHelper.UpdateIdNames()
            await this.selectTargetForm.UpdateItemsAsync()
        },
        _itemConfigs: [
            this.configAssetId,
            this.configCode,
            this.configTarget,
            this.configLogistics,
            this.configDriver,
            this.configPhone,
        ]
    }

    /** 表单模型 */
    readonly form: FormModel<TransferModel> = new FormModel(this.configForm)

    /** 表格模型 */
    readonly table = new TableModel<TransferModel>([
        {
            _propName: 'assetId',
            Text: Texts.AssetId,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'code',
            Text: Texts.Code,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'isEnd',
            Text: Texts.State,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
            _getSource: source => StringHelper.IsNotEmpty(source.endTime),
            _getString: source => IsEnd.ToString(StringHelper.IsNotEmpty(source.endTime)),
        },
        {
            _propName: 'site',
            Text: Texts.Origin,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getStringAsync: source => siteHelper.GetNameAsync(source.site)
        },
        {
            _propName: 'target',
            Text: Texts.Target,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getStringAsync: source => siteHelper.GetNameAsync(source.target)
        },
        {
            _propName: 'logistics',
            Text: Texts.Logistics,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'driver',
            Text: Texts.Driver,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'phone',
            Text: Texts.Phone,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'startTime',
            Text: Texts.StartTime,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getString: source => ObjectHelper.GetDateString(source.startTime)
        },
        {
            _propName: 'endTime',
            Text: Texts.EndTime,
            IsReadonly: true,
            IsRequired: false,
            Type: ItemType.TextBox,
            _getString: source => ObjectHelper.GetDateString(source.endTime)
        },
    ])
    //#endregion 【Fields】

    //#region 【Props】
    /** “资产ID”是否只读 */
    readonly IsAssetIdReadonly = ref(false)
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this.selectOrigin.Placeholder.value = Texts.Origin
        this.selectTarget.Placeholder.value = Texts.Target

        this.searchCode.Placeholder.value = Texts.Code
        this.searchCode._onChange = this.Refresh
        this.searchCode._onSearch = this.Refresh

        this.searchAssetId.Placeholder.value = Texts.AssetId
        this.searchAssetId._onChange = this.Refresh
        this.searchAssetId._onSearch = this.Refresh

        this.pagination.IsShowSelectedRowCount.value = true
        this.pagination._onChange = this.Refresh
        this.selectOrigin._onChange = this.Refresh
        this.selectTarget._onChange = this.Refresh

        this.table.IsAllowMultiSelect.value = true
        this.table._initItem = itemModel => {
            IsEnd.InitItemModel(itemModel)
        }
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            await siteHelper.UpdateIdNames()
            await this.selectOrigin.UpdateItemsAsync()
            await this.selectTarget.UpdateItemsAsync()

            this.pagination.Count.value = await transferHelper.GetCount({
                site: this.selectOrigin.Value.value?.id,
                target: this.selectTarget.Value.value?.id,
                code: this.searchCode.Value.value,
                assetId: this.searchAssetId.Value.value,
            })
            await transferHelper.GetList({
                pageSize: this.pagination.PageSize.value,
                pageNumber: this.pagination.SelectedNum.value,
                site: this.selectOrigin.Value.value?.id,
                target: this.selectTarget.Value.value?.id,
                code: this.searchCode.Value.value,
                assetId: this.searchAssetId.Value.value,
            }).then(arr => {
                ArrayHelper.Set(this.table.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = async () => {
        this.form.Title.value = TextModel.GetText('Add Transfer', '新增调拨')

        this.form._getSource = this.AddGetSource

        this.form._onSubmitAsync = async source => {
            const res = await transferHelper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.form.Show()
    }

    /** 改 */
    readonly Edit = async () => {
        this.form.Title.value = TextModel.GetText('Edit Transfer', '修改调拨')

        this.form._getSource = () => {
            const rowData = this.table.SelectedRowDatas.value[0]

            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new TransferModel()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.form._onSubmitAsync = async source => {
            const res = await transferHelper.Edit(source)
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

        const rowDatas = this.table.SelectedRowDatas.value.map(i => i.id)
        if (rowDatas.length < 1) {
            console.warn('The model is undefined!')
            return
        }

        transferHelper.DeleteRange(rowDatas).then(res => {
            this.Refresh()
            ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
        })
    }
    //#endregion 【Functions】
}
