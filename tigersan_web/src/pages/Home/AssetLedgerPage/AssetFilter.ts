import { IsAuto, IsFall, IsInFence, OnlineState, SearchModel, Texts, WatchBehavior } from "@/0_tigersan_ui/tigerui"
import { CompanyMgtPageModel } from "@/pages/BasicSettings/BasicSettings/CompanyMgtPage/CompanyMgtPageModel"
import { companyHelper, departmentHelper, assetTypeHelper, AssetState, ErrorType, tagTypeHelper } from "@/models"

export class AssetFilter {
    //#region 【Fields】
    _refresh?: any
    /** “可访问公司”监听器 */
    readonly watchAccessibleCompanies
    /** 搜索框 */
    readonly searchRfid = new SearchModel()
    readonly searchName = new SearchModel()
    readonly searchAssetId = new SearchModel()
    readonly searchTagId = new SearchModel()
    readonly searchStationId = new SearchModel()
    /** 筛选 */
    readonly selectOnlineState = OnlineState.GetSelectModel()
    readonly selectIsAuto = IsAuto.GetSelectModel()
    readonly selectIsFall = IsFall.GetSelectModel()
    readonly selectIsInFence = IsInFence.GetSelectModel()
    readonly selectDepartment = departmentHelper.GetIdNameSelectModel()
    readonly selectAssetType = assetTypeHelper.GetIdNameSelectModel()
    readonly selectTagType = tagTypeHelper.GetIdNameSelectModel()
    readonly selectAssetState = AssetState.GetSelectModel()
    readonly selectErrorType = ErrorType.GetSelectModel()
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor(refresh?: Function) {
        this._refresh = refresh

        this.searchRfid.Placeholder.value = 'RFID'
        this.searchRfid._onChange = this._refresh
        this.searchRfid._onSearch = this._refresh

        this.searchName.Placeholder.value = Texts.Name
        this.searchName._onChange = this._refresh
        this.searchName._onSearch = this._refresh

        this.searchAssetId.Placeholder.value = Texts.AssetId
        this.searchAssetId._onChange = this._refresh
        this.searchAssetId._onSearch = this._refresh

        this.searchTagId.Placeholder.value = Texts.TagId
        this.searchTagId._onChange = this._refresh
        this.searchTagId._onSearch = this._refresh

        this.searchStationId.Placeholder.value = Texts.StationId
        this.searchStationId._onChange = this._refresh
        this.searchStationId._onSearch = this._refresh

        this.selectAssetState.IsSelectAll.value = true
        this.selectAssetState.IsAllowMultiSelect.value = true
        this.selectAssetType._getItemsAsync = async () => await assetTypeHelper.GetIdNamesByCompany(undefined, CompanyMgtPageModel.AccessibleCompanies.value)
        this.selectDepartment._getItemsAsync = async () => await departmentHelper.GetIdNamesByCompany(undefined, CompanyMgtPageModel.AccessibleCompanies.value)
        this.selectDepartment._onChange = this._refresh
        this.selectAssetType._onChange = this._refresh
        this.selectTagType._onChange = this._refresh
        this.selectAssetState._onCheckedItemsChange = this._refresh
        this.selectOnlineState._onChange = this._refresh
        this.selectIsAuto._onChange = this._refresh
        this.selectIsFall._onChange = this._refresh
        this.selectIsInFence._onChange = this._refresh
        this.selectErrorType._onChange = this._refresh

        this.watchAccessibleCompanies = new WatchBehavior(CompanyMgtPageModel.AccessibleCompanies, this._refresh)
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly UpdateIdNames = async () => {
        await companyHelper.UpdateIdNames()
        await departmentHelper.UpdateIdNames()
        await assetTypeHelper.UpdateIdNames()
        await this.selectDepartment.UpdateItemsAsync()
        await this.selectAssetType.UpdateItemsAsync()
    }

    readonly StartWatch = () => {
        this.watchAccessibleCompanies.Start()
    }

    readonly StopWatch = () => {
        this.watchAccessibleCompanies.Stop()
    }
    //#endregion 【Functions】
}