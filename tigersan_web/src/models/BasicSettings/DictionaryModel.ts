import { ref } from 'vue'
import { PaginationModel, IdNameCompany, FormItemConfig, Verify, FormConfig, FormModel, TableModel, ItemType, loading, ArrayHelper, GetSubmitResult, ObjectHelper, DialogHelper, DialogMode, Colors, DialogState, ApiResult, BigintHelper, Texts } from '@/0_tigersan_ui/tigerui'
import { DictionaryHelper } from '@/helpers'
import { companyHelper } from './CompanyModel'

export class DictionaryModel {
    //#region 【Fields】
    /** 名称 */
    readonly _name: string
    /** 帮助类实例 */
    readonly _helper: DictionaryHelper
    /** 是否“显示公司” */
    readonly _isShowCompany: boolean
    /** “公司”选择（筛选） */
    readonly selectCompany = companyHelper.GetIdNameSelectModel()
    /** “公司”选择（表单） */
    readonly selectCompanyForm = companyHelper.GetIdNameSelectModel()

    /** 分页器 */
    readonly pagination = new PaginationModel()

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new IdNameCompany()

    /** “名称”项目配置 */
    readonly configName: FormItemConfig<IdNameCompany, string> = {
        _propName: 'name',
        PropText: Texts.Name,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.name)
        }
    }

    /** “公司”项目配置 */
    readonly configCompany: FormItemConfig<IdNameCompany, IdNameCompany> = {
        _propName: 'companyName',
        PropText: Texts.Company,
        IsEquired: true,
        Target: this.selectCompanyForm.Value,
        _getValue: source => this.selectCompanyForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.company)),
        _setValue: (source, propName, value) => source.company = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.company, 0n, Texts.CannotBeEmpty.value)
    }

    /** 表单配置 */
    readonly configForm: FormConfig<IdNameCompany> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            if (this._isShowCompany) {
                await companyHelper.UpdateIdNames()
                await this.selectCompanyForm.UpdateItemsAsync()
            }
        },
        _itemConfigs: [
            this.configName,
        ]
    }

    /** 表单模型 */
    readonly form: FormModel<IdNameCompany>

    /** 表格模型 */
    readonly table = new TableModel<IdNameCompany>([
        {
            _propName: 'name',
            Text: Texts.Name,
            IsReadonly: true,
            Type: ItemType.TextBox,
        },
    ])
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor(
        name: string,
        helper: DictionaryHelper,
        isShowCompany: boolean = false) {
        this._name = name
        this._helper = helper
        this._isShowCompany = isShowCompany
        this.table.IsAllowMultiSelect.value = true
        this.pagination.IsShowSelectedRowCount.value = true
        this.pagination._onChange = this.Refresh
        this.selectCompany._onChange = this.Refresh
        if (isShowCompany) {
            this.table._headerConfigs.unshift({
                _propName: 'companyName',
                Text: Texts.Company,
                IsReadonly: true,
                Type: ItemType.TextBox,
            })
            this.configForm._itemConfigs?.unshift(this.configCompany)
        }

        this.form = new FormModel(this.configForm)
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            if (this._isShowCompany) {
                await companyHelper.UpdateIdNames()
                await this.selectCompany.UpdateItemsAsync()
            }

            this.pagination.Count.value = await this._helper.GetCount({
                company: this.selectCompany.Value.value?.id
            })
            await this._helper.GetList({
                pageSize: this.pagination.PageSize.value,
                pageNumber: this.pagination.SelectedNum.value,
                company: this.selectCompany.Value.value?.id
            }).then(arr => {
                ArrayHelper.Set(this.table.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = async () => {
        this.form.Title.value = `新增${this._name}`

        this.form._getSource = this.AddGetSource

        this.form._onSubmitAsync = async source => {
            const res = await this._helper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.form.Show()
    }

    /** 改 */
    readonly Edit = async () => {
        this.form.Title.value = `修改${this._name}`

        this.form._getSource = () => {
            const rowData = this.table.SelectedRowDatas.value[0]

            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new IdNameCompany()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.form._onSubmitAsync = async source => {
            const res = await this._helper.Edit(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.form.Show()
    }

    /** 删 */
    readonly Delete = async () => {
        DialogHelper.Show(
            Texts.ConfirmPassword,
            Texts.DeleteConfirm.value,
            undefined,
            this.DeleteRowData,
            DialogMode.YesOrNo,
            Colors.Warning)
    }

    readonly DeleteRowData = async (state: DialogState) => {
        if (state != DialogState.Yes) return

        const models = this.table.SelectedRowDatas.value
        if (!models) {
            console.warn('The model is undefined!')
            return
        }

        this._helper.DeleteRange(models.map(i => i.id)).then(res => {
            this.Refresh()
            ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
        })
    }
    //#endregion 【Functions】
}
