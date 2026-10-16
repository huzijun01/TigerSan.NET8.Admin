import { Colors, DialogHelper, Verify, ObjectHelper, DialogMode, DialogState, FormModel, FormConfig, FormItemConfig, ArrayHelper, BigintHelper, GetSubmitResult, IdName, ApiResult, loading, Texts, IsFall, TextModel } from '@/0_tigersan_ui/tigerui'
import { AssetFilter } from './AssetFilter'
import { AssetFormModel } from './AssetFormModel'
import { assetLedgerTable, pagination } from './AssetLedgerTable'
import { TransferPageModel } from '../TransferPage/TransferPageModel'
import { CompanyMgtPageModel } from '@/pages/BasicSettings/BasicSettings/CompanyMgtPage/CompanyMgtPageModel'
import { companyHelper, assetHelper, departmentHelper, assetTypeHelper, AssetDto, siteHelper, tagTypeHelper, TransferModel, transferHelper } from '@/models'

export class OutboundModel {
    company: bigint = 0n
    site: bigint = 0n
}

export class AssetLedgerPageModel extends AssetFormModel {
    //#region 【Fields】
    /** 筛选器 */
    readonly filter: AssetFilter
    // 调拨:
    readonly transferPage = new TransferPageModel()
    // 出库:
    readonly selectCompanyOutboundForm = companyHelper.GetIdNameSelectModel()
    readonly selectSiteOutboundForm = siteHelper.GetIdNameSelectModel()
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor() {
        super()
        this.filter = new AssetFilter(this.Refresh)
        this.transferPage.IsAssetIdReadonly.value = true
        this.selectSiteOutboundForm._getItemsAsync = async () => await siteHelper.GetIdNamesByCompany(this.selectCompanyForm.Value.value?.id)
        this.selectCompanyForm._getItemsAsync = undefined
        this.selectCompanyForm._getItems = () => CompanyMgtPageModel.selectCompanyGlobal.CheckedValues.value as []
        // 更新:
        pagination._onChange = this.Refresh
        this.selectCompanyOutboundForm._onChange = this.selectSiteOutboundForm.UpdateItemsAsync
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            const filter = this.filter
            await this.filter.UpdateIdNames()
            await tagTypeHelper.UpdateIdNames()

            pagination.Count.value = await assetHelper.GetCount({
                companies: CompanyMgtPageModel.AccessibleCompanies.value,
                department: filter.selectDepartment.Value.value?.id,
                type: filter.selectAssetType.Value.value?.id,
                tagType: filter.selectTagType.Value.value?.id,
                state: filter.selectAssetState.Value.value,
                states: filter.selectAssetState.NotCheckAllCheckedValues.value,
                onlineState: filter.selectOnlineState.Value.value,
                isAuto: filter.selectIsAuto.Value.value,
                isFall: filter.selectIsFall.Value.value,
                isInFence: filter.selectIsInFence.Value.value,
                errorType: filter.selectErrorType.Value.value,
                name: filter.searchName.Value.value,
                rfid: filter.searchRfid.Value.value,
                assetId: filter.searchAssetId.Value.value,
                tagId: filter.searchTagId.Value.value,
                stationId: filter.searchStationId.Value.value,
            })

            await assetHelper.GetList({
                pageSize: pagination.PageSize.value,
                pageNumber: pagination.SelectedNum.value,
                companies: CompanyMgtPageModel.AccessibleCompanies.value,
                department: filter.selectDepartment.Value.value?.id,
                type: filter.selectAssetType.Value.value?.id,
                tagType: filter.selectTagType.Value.value?.id,
                state: filter.selectAssetState.Value.value,
                states: filter.selectAssetState.NotCheckAllCheckedValues.value,
                onlineState: filter.selectOnlineState.Value.value,
                isAuto: filter.selectIsAuto.Value.value,
                isFall: filter.selectIsFall.Value.value,
                isInFence: filter.selectIsInFence.Value.value,
                errorType: filter.selectErrorType.Value.value,
                name: filter.searchName.Value.value,
                rfid: filter.searchRfid.Value.value,
                assetId: filter.searchAssetId.Value.value,
                tagId: filter.searchTagId.Value.value,
                stationId: filter.searchStationId.Value.value,
            }).then(arr => {
                ArrayHelper.Set(assetLedgerTable.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = async () => {
        this.assetForm.Title.value = TextModel.GetText('Add Asset', '新增资产')

        this.assetForm._getSource = this.AddGetSource

        this.assetForm._onSubmitAsync = async source => {
            const res = await assetHelper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.assetForm.Show()
    }

    /** 改 */
    readonly Edit = async () => {
        this.assetForm.Title.value = TextModel.GetText('Edit Asset', '修改资产')

        this.assetForm._getSource = () => {
            const rowData = assetLedgerTable.SelectedRowDatas.value[0]
            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new AssetDto()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.assetForm._onSubmitAsync = async source => {
            const res = await assetHelper.Edit(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.assetForm.Show(true)
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

        const models = assetLedgerTable.SelectedRowDatas.value
        if (!models) {
            console.warn('The models is undefined!')
            return
        }

        try {
            loading.IsShow.value = true

            await assetHelper.DeleteRange(models.map(i => i.id)).then(res => {
                this.Refresh()
                ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 调拨 */
    readonly Transfer = async () => {
        const rowData = assetLedgerTable.SelectedRowDatas.value[0]
        if (!rowData) {
            console.warn('The rowData is undefined!')
            return new AssetDto()
        }

        this.transferPage.form.Title.value = Texts.Transfer.value

        this.transferPage.form._getSource = () => {
            const transfer = new TransferModel()
            transfer.assetId = rowData.assetId
            transfer.code = ObjectHelper.GetDateId()
            return transfer
        }

        this.transferPage.form._onSubmitAsync = async source => {
            const res = await transferHelper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.transferPage.form.Show()
    }

    /** “公司”项目配置 */
    readonly configOutboundCompany: FormItemConfig<OutboundModel, IdName> = {
        _propName: 'company',
        PropText: Texts.Company,
        IsEquired: true,
        Target: this.selectCompanyOutboundForm.Value,
        _getValue: source => this.selectCompanyOutboundForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.company)),
        _setValue: (source, propName, value) => source.company = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.company, 0n, Texts.CannotBeEmpty.value)
    }

    /** “场地”项目配置 */
    readonly configSite: FormItemConfig<OutboundModel, IdName> = {
        _propName: 'site',
        PropText: Texts.Site,
        IsEquired: true,
        Target: this.selectSiteOutboundForm.Value,
        _getValue: source => this.selectSiteOutboundForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.site)),
        _setValue: (source, propName, value) => source.site = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.site, 0n, Texts.CannotBeEmpty.value)
    }

    /** “出库”表单配置 */
    readonly configOutbundForm: FormConfig<OutboundModel> = {
        _getSource: () => new OutboundModel(),
        _beforeInitAsync: async isEdit => {
            if (isEdit) {
                const rowData = assetLedgerTable.SelectedRowDatas.value[0]
                if (!rowData) {
                    console.warn('The rowData is undefined!')
                    return
                }

                await this.selectCompanyForm.UpdateItemsAsync()
                this.selectCompanyForm.Value.value = companyHelper.GetIdName(rowData.company)
                await this.selectDepartmentForm.UpdateItemsAsync()
                this.selectDepartmentForm.Value.value = departmentHelper.GetIdName(rowData.department)
                await this.selectAssetTypeForm.UpdateItemsAsync()
                this.selectAssetTypeForm.Value.value = assetTypeHelper.GetIdName(rowData.type)
            }
        },
        _itemConfigs: [
            this.configOutboundCompany,
            this.configSite,
        ]
    }

    /** “出库”表单模型 */
    readonly assetOutbundForm = new FormModel(this.configOutbundForm)

    /** 导出“CSV” */
    readonly ExportCsv = async () => {
        try {
            loading.IsShow.value = true

            const res = await assetHelper.DownloadCsv(Texts.Asset.value, {})
            ApiResult.ShowResult(res, Texts.DownloadSuccessfully.value)
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 导出“XLSX” */
    readonly ExportXlsx = async () => {
        try {
            loading.IsShow.value = true

            const res = await assetHelper.DownloadXlsx(Texts.Asset.value, {})
            ApiResult.ShowResult(res, Texts.DownloadSuccessfully.value)
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 入库 */
    readonly Inbound = async () => {
        DialogHelper.Show(
            Texts.Confirm.value,
            TextModel.GetText('Are you sure to inbound?', '是否确定入库？'),
            undefined,
            this.InboundRowData,
            DialogMode.YesOrNo,
            Colors.Warning)
    }

    readonly InboundRowData = (state: DialogState) => {
        if (state != DialogState.Yes) return

        const rowDatas = assetLedgerTable.SelectedRowDatas.value
        if (rowDatas.length < 1) {
            console.warn('No row was selected!')
            return
        }

        assetHelper.Inbound(rowDatas.map(r => r.id)).then(res => {
            this.Refresh()
            ApiResult.ShowResult(res, Texts.InboundSuccessful.value)
        })
    }

    /** 出库 */
    readonly Outbound = async () => {
        const rowDatas = assetLedgerTable.SelectedRowDatas.value
        if (rowDatas.length < 1) {
            console.warn('No row was selected!')
            return
        }

        this.assetOutbundForm.Title.value = Texts.Outbound.value

        this.assetOutbundForm._onSubmitAsync = async source => {
            const res = await assetHelper.Outbound(source.site, rowDatas.map(r => r.id))
            await this.Refresh()
            return GetSubmitResult(res, Texts.OutboundSuccessful.value)
        }

        this.assetOutbundForm.Show(true)
    }
    //#endregion 【Functions】
}