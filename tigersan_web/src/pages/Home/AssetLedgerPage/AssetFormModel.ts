import { ref } from "vue"
import { FormItemConfig, IdName, BigintHelper, Verify, Texts, FormConfig, FormModel, IsAuto } from "@/0_tigersan_ui/tigerui"
import { assetLedgerTable } from "./AssetLedgerTable"
import { companyHelper, departmentHelper, assetTypeHelper, vehicleHelper, AssetDto } from "@/models"

export class AssetFormModel {
    //#region 【Fields】
    // 选择框:
    readonly selectIsAutoForm = IsAuto.GetSelectModel()
    readonly selectCompanyForm = companyHelper.GetIdNameSelectModel()
    readonly selectDepartmentForm = departmentHelper.GetIdNameSelectModel()
    readonly selectAssetTypeForm = assetTypeHelper.GetIdNameSelectModel()
    readonly selectVehicleForm = vehicleHelper.GetIdPlateSelectModel()

    /** “公司”项目配置 */
    readonly configCompany: FormItemConfig<AssetDto, IdName> = {
        _propName: 'company',
        PropText: Texts.Company,
        IsEquired: true,
        Target: this.selectCompanyForm.Value,
        _getValue: source => this.selectCompanyForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.company)),
        _setValue: (source, propName, value) => source.company = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.company, 0n, Texts.CannotBeEmpty.value)
    }

    /** “部门”项目配置 */
    readonly configDepartment: FormItemConfig<AssetDto, IdName> = {
        _propName: 'department',
        PropText: Texts.Department,
        IsEquired: true,
        Target: this.selectDepartmentForm.Value,
        _getValue: source => this.selectDepartmentForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.department)),
        _setValue: (source, propName, value) => source.department = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.department, 0n, Texts.CannotBeEmpty.value)
    }

    /** “类型”项目配置 */
    readonly configAssetType: FormItemConfig<AssetDto, IdName> = {
        _propName: 'type',
        PropText: Texts.Type,
        IsEquired: true,
        Target: this.selectAssetTypeForm.Value,
        _getValue: source => this.selectAssetTypeForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.type)),
        _setValue: (source, propName, value) => source.type = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.type, 0n, Texts.CannotBeEmpty.value)
    }

    /** “调拨”项目配置 */
    readonly configIsAuto: FormItemConfig<AssetDto, boolean> = {
        _propName: 'isAuto',
        PropText: Texts.Allot,
        IsEquired: true,
        Target: this.selectIsAutoForm.Value,
        _isVerifyOk: source => Verify.IsNotUndefined(source.isAuto)
    }

    /** “资产ID”项目配置 */
    readonly configAssetId: FormItemConfig<AssetDto, string> = {
        _propName: 'assetId',
        PropText: Texts.AssetId,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsNotUndefinedOrEmpty(source.assetId)
    }

    /** “标签ID”项目配置 */
    readonly configTagId: FormItemConfig<AssetDto, string> = {
        _propName: 'tagId',
        PropText: Texts.TagId,
        IsEquired: false,
        Target: ref(),
    }

    /** “名称”项目配置 */
    readonly configName: FormItemConfig<AssetDto, string> = {
        _propName: 'name',
        PropText: Texts.Name,
        IsEquired: false,
        Target: ref(),
    }

    /** “备注”项目配置 */
    readonly configComment: FormItemConfig<AssetDto, string> = {
        _propName: 'comment',
        PropText: Texts.Comment,
        IsEquired: false,
        Target: ref(),
    }

    /** “名称”项目配置 */
    readonly configVehicle: FormItemConfig<AssetDto, IdName> = {
        _propName: 'name',
        PropText: Texts.Vehicle,
        IsEquired: false,
        Target: this.selectVehicleForm.Value,
        _getValue: source => this.selectVehicleForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.vehicle)),
        _setValue: (source, propName, value) => source.vehicle = value?.id,
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new AssetDto()

    /** “资产”表单配置 */
    readonly configAssetLedgerForm: FormConfig<AssetDto> = {
        _getSource: this.AddGetSource,
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
                await this.selectVehicleForm.UpdateItemsAsync()
                this.selectVehicleForm.Value.value = this.selectVehicleForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, rowData.vehicle))
            }
        },
        _itemConfigs: [
            this.configCompany,
            this.configDepartment,
            this.configAssetType,
            this.configIsAuto,
            this.configAssetId,
            this.configTagId,
            this.configName,
            this.configComment,
            this.configVehicle,
        ]
    }

    /** “资产”表单模型 */
    readonly assetForm = new FormModel(this.configAssetLedgerForm)
    //#endregion 【Fields】

    //#region 【Props】
    /** “公司”是否使能 */
    get IsCompanyEnable() { return this.selectCompanyForm.IsEnabled.value }
    set IsCompanyEnable(value) { this.selectCompanyForm.IsEnabled.value = value }

    /** “标签ID”是否使能 */
    readonly IsTagIdEnable = ref(true)
    /** “基站ID”是否使能 */
    readonly IsStationIdEnable = ref(true)
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this.selectIsAutoForm.Width.value = 208
        this.selectDepartmentForm._getItemsAsync = async () => await departmentHelper.GetIdNamesByCompany(this.selectCompanyForm.Value.value?.id)
        this.selectAssetTypeForm._getItemsAsync = async () => await assetTypeHelper.GetIdNamesByCompany(this.selectCompanyForm.Value.value?.id)
        this.selectVehicleForm._getItemsAsync = async () => await vehicleHelper.GetIdPlatesByCompany(this.selectCompanyForm.Value.value?.id)
        this.selectCompanyForm._onChange = () => {
            this.selectDepartmentForm.UpdateItemsAsync()
            this.selectAssetTypeForm.UpdateItemsAsync()
            this.selectVehicleForm.UpdateItemsAsync()
        }
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 刷新表单 */
    readonly RefreshForm = async () => {
        await this.selectCompanyForm.UpdateItemsAsync()
        await this.selectDepartmentForm.UpdateItemsAsync()
        await this.selectAssetTypeForm.UpdateItemsAsync()
        await this.selectVehicleForm.UpdateItemsAsync()
    }
    //#endregion 【Functions】
}