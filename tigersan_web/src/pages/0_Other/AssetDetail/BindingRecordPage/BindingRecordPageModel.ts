import { ref } from 'vue'
import { Colors, DialogHelper, Verify, ObjectHelper, DialogMode, DialogState, FormModel, FormConfig, FormItemConfig, ArrayHelper, PaginationModel, GetSubmitResult, IdName, ApiResult, loading, Texts, TextModel } from '@/0_tigersan_ui/tigerui'
import { GetTableModel } from './BindingRecordTable'
import { bindingRecordHelper, BindingRecordDto } from '@/models'

export class BindingRecordPageModel {
    //#region 【Fields】
    _tag?: bigint
    _asset?: bigint
    /** 分页器 */
    readonly pagination = new PaginationModel()

    /** “标签ID”项目配置 */
    readonly configTagId: FormItemConfig<BindingRecordDto, IdName> = {
        _propName: 'tagId',
        PropText: Texts.TagId,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.tagId)
        }
    }

    /** “资产ID”项目配置 */
    readonly configAssetId: FormItemConfig<BindingRecordDto, string> = {
        _propName: 'assetId',
        PropText: Texts.AssetId,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => {
            return Verify.IsNotUndefinedOrEmpty(source.assetId)
        }
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new BindingRecordDto()

    /** 表单配置 */
    readonly configBindingRecordPageModel: FormConfig<BindingRecordDto> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
        },
        _itemConfigs: [
            this.configTagId,
            this.configAssetId,
        ]
    }

    /** 表单模型 */
    readonly form = new FormModel(this.configBindingRecordPageModel)

    /** 表格 */
    readonly table = GetTableModel()
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor() {
        this.table.IsAllowMultiSelect.value = false
        this.table._onInitHeaderModels = () => {
            this.table.SetSlotHeader('time', false)
        }
        this.pagination.IsShowSelectedRowCount.value = true
        this.table._onSlotChange = this.Refresh
        this.pagination._onChange = this.Refresh
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            if (!this._tag && !this._asset) {
                console.warn('The _tag and _asset is undefined!')
                return
            }

            this.pagination.Count.value = await bindingRecordHelper.GetCount({
                tag: this._tag,
                asset: this._asset,
            })

            await bindingRecordHelper.GetList({
                pageSize: this.pagination.PageSize.value,
                pageNumber: this.pagination.SelectedNum.value,
                sort: this.table.SlotHeader.value?._propName,
                ascending: this.table.IsAscending.value,
                tag: this._tag,
                asset: this._asset,
            }).then(arr => {
                ArrayHelper.Set(this.table.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = async () => {
        this.form.Title.value = TextModel.GetText('Add BindingRecord', '新增绑定记录')

        this.form._getSource = this.AddGetSource

        this.form._onSubmitAsync = async source => {
            const res = await bindingRecordHelper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.form.Show()
    }

    /** 改 */
    readonly Edit = async () => {
        this.form.Title.value = TextModel.GetText('Edit BindingRecord', '修改绑定记录')

        this.form._getSource = () => {
            const rowData = this.table.SelectedRowDatas.value[0]

            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new BindingRecordDto()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.form._onSubmitAsync = async source => {
            const res = await bindingRecordHelper.Edit(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.form.Show()
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

        const rowDatas = this.table.SelectedRowDatas.value.map(i => i.id)
        if (rowDatas.length < 1) {
            console.warn('No row was selected!')
            return
        }

        try {
            loading.IsShow.value = true

            await bindingRecordHelper.DeleteRange(rowDatas).then(res => {
                this.Refresh()
                ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
            })
        } finally {
            loading.IsShow.value = false
        }
    }
    //#endregion 【Functions】
}