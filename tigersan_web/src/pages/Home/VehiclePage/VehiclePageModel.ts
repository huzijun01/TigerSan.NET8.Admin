import { ref } from 'vue'
import { PaginationModel, FormItemConfig, IdName, Verify, FormConfig, FormModel, TableModel, ItemType, loading, ArrayHelper, GetSubmitResult, ObjectHelper, DialogHelper, DialogMode, Colors, DialogState, ApiResult, BigintHelper, Texts, SearchModel } from '@/0_tigersan_ui/tigerui'
import { companyHelper, vehicleHelper, VehicleEntity } from '@/models'

export class VehiclePageModel {
    //#region 【Fields】
    /** 搜索框 */
    readonly searchPlate = new SearchModel()
    /** “公司”选择（筛选） */
    readonly selectCompany = companyHelper.GetIdNameSelectModel()
    /** “公司”选择（表单） */
    readonly selectCompanyForm = companyHelper.GetIdNameSelectModel()

    /** 分页器 */
    readonly pagination = new PaginationModel()

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new VehicleEntity()

    /** “车牌号”项目配置 */
    readonly configPlate: FormItemConfig<VehicleEntity, string> = {
        _propName: 'plate',
        PropText: Texts.Plate,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.plate)
        }
    }

    /** “公司”项目配置 */
    readonly configCompany: FormItemConfig<VehicleEntity, IdName> = {
        _propName: 'company',
        PropText: Texts.Company,
        IsEquired: true,
        Target: this.selectCompanyForm.Value,
        _getValue: source => this.selectCompanyForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.company)),
        _setValue: (source, propName, value) => source.company = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.company, 0n, Texts.CannotBeEmpty.value)
    }

    /** “物流公司”项目配置 */
    readonly configLogistics: FormItemConfig<VehicleEntity, string> = {
        _propName: 'logistics',
        PropText: Texts.Logistics,
        IsEquired: false,
        Target: ref(),
    }

    /** “司机”项目配置 */
    readonly configDriver: FormItemConfig<VehicleEntity, string> = {
        _propName: 'driver',
        PropText: Texts.Driver,
        IsEquired: false,
        Target: ref(),
    }

    /** “电话”项目配置 */
    readonly configPhone: FormItemConfig<VehicleEntity, string> = {
        _propName: 'phone',
        PropText: Texts.Phone,
        IsEquired: false,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidPhoneNumber(source.phone)
    }

    /** 表单配置 */
    readonly configForm: FormConfig<VehicleEntity> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            await companyHelper.UpdateIdNames()
            await this.selectCompanyForm.UpdateItemsAsync()
        },
        _itemConfigs: [
            this.configPlate,
            this.configCompany,
            this.configLogistics,
            this.configDriver,
            this.configPhone,
        ]
    }

    /** 表单模型 */
    readonly form: FormModel<VehicleEntity> = new FormModel(this.configForm)

    /** 表格模型 */
    readonly table = new TableModel<VehicleEntity>([
        {
            _propName: 'plate',
            Text: Texts.Plate,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
        {
            _propName: 'company',
            Text: Texts.Company,
            IsReadonly: true,
            Type: ItemType.TextBox,
            _getStringAsync: source => companyHelper.GetNameAsync(source.company)
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
    ])
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor() {
        this.searchPlate.Placeholder.value = Texts.Plate
        this.searchPlate._onChange = this.Refresh
        this.searchPlate._onSearch = this.Refresh
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

            this.pagination.Count.value = await vehicleHelper.GetCount({
                company: this.selectCompany.Value.value?.id,
                plate: this.searchPlate.Value.value,
            })
            await vehicleHelper.GetList({
                pageSize: this.pagination.PageSize.value,
                pageNumber: this.pagination.SelectedNum.value,
                company: this.selectCompany.Value.value?.id,
                plate: this.searchPlate.Value.value,
            }).then(arr => {
                ArrayHelper.Set(this.table.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = async () => {
        this.form.Title.value = `${Texts.Add.value} ${Texts.Vehicle.value}`

        this.form._getSource = this.AddGetSource

        this.form._onSubmitAsync = async source => {
            const res = await vehicleHelper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.form.Show()
    }


    /** 改 */
    readonly Edit = async () => {
        this.form.Title.value = `${Texts.Edit.value} ${Texts.Vehicle.value}`

        this.form._getSource = () => {
            const rowData = this.table.SelectedRowDatas.value[0]

            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new VehicleEntity()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.form._onSubmitAsync = async source => {
            const res = await vehicleHelper.Edit(source)
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

        vehicleHelper.Delete(model.id).then(res => {
            this.Refresh()
            ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
        })
    }
    //#endregion 【Functions】
}
