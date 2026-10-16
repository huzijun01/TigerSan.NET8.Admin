import { ref } from 'vue'
import { Colors, DialogHelper, Verify, ObjectHelper, DialogMode, DialogState, FormModel, FormConfig, FormItemConfig, ArrayHelper, BigintHelper, GetSubmitResult, IdName, ApiResult, loading, Texts, TextModel } from '@/0_tigersan_ui/tigerui'
import { AssetFilter } from '../../../Home/AssetLedgerPage/AssetFilter'
import { assetRecordTable, pagination } from './AssetRecordTable'
import { assetRecordHelper, AssetRecordDto, baseStationHelper, LocationMode } from '@/models'

export class AssetRecordPageModel {
    _asset?: bigint
    _filter: AssetFilter

    // 选择框:
    /** 筛选 */
    /** “定位方式”选择器 */
    readonly selectLocationMode = LocationMode.GetSelectModel()
    get selectAssetState() { return this._filter.selectAssetState }
    /** 表单 */
    readonly selectStationForm = baseStationHelper.GetIdNameSelectModel()

    /** “基站”项目配置 */
    readonly configStation: FormItemConfig<AssetRecordDto, IdName> = {
        _propName: 'station',
        PropText: Texts.BaseStation,
        IsEquired: true,
        Target: this.selectStationForm.Value,
        _getValue: source => this.selectStationForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.station)),
        _setValue: (source, propName, value) => source.station = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.station, 0n, Texts.CannotBeEmpty.value)
    }

    /** “经度”项目配置 */
    readonly configLongitude: FormItemConfig<AssetRecordDto, string> = {
        _propName: 'longitude',
        PropText: Texts.Longitude,
        IsEquired: false,
        Target: ref(),
    }

    /** “纬度”项目配置 */
    readonly configLatitude: FormItemConfig<AssetRecordDto, string> = {
        _propName: 'latitude',
        PropText: Texts.Latitude,
        IsEquired: false,
        Target: ref(),
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new AssetRecordDto()

    /** “资产记录”表单配置 */
    readonly configAssetRecordForm: FormConfig<AssetRecordDto> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            if (isEdit) {
                const rowData = assetRecordTable.SelectedRowDatas.value[0]
                if (!rowData) {
                    console.warn('The rowData is undefined!')
                    return
                }

                await this.selectStationForm.UpdateItemsAsync()
                this.selectStationForm.Value.value = baseStationHelper.GetIdName(rowData.station ?? 0n)
            }
        },
        _itemConfigs: [
            this.configStation,
            this.configLongitude,
            this.configLatitude,
        ]
    }

    /** “资产记录”表单模型 */
    readonly assetRecordForm = new FormModel(this.configAssetRecordForm)

    constructor() {
        pagination._onChange = this.Refresh
        this._filter = new AssetFilter(this.Refresh)
        this.selectLocationMode._onChange = this.Refresh
    }

    /** 查 */
    readonly Refresh = async () => {
        if (!this._asset || this._asset == 0n) {
            console.warn('The _asset is undefined!')
            return
        }

        try {
            loading.IsShow.value = true

            await baseStationHelper.UpdateIdNames()

            pagination.Count.value = await assetRecordHelper.GetCount({
                asset: this._asset,
                states: this.selectAssetState.NotCheckAllCheckedValues.value,
                locationMode: this.selectLocationMode.Value.value,
            })
            await assetRecordHelper.GetList({
                pageSize: pagination.PageSize.value,
                pageNumber: pagination.SelectedNum.value,
                asset: this._asset,
                states: this.selectAssetState.NotCheckAllCheckedValues.value,
                locationMode: this.selectLocationMode.Value.value,
            }).then(arr => {
                ArrayHelper.Set(assetRecordTable.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = () => {
        this.assetRecordForm.Title.value = TextModel.GetText('Add AssetRecord', '新增资产记录')

        this.assetRecordForm._getSource = this.AddGetSource

        this.assetRecordForm._onSubmitAsync = async source => {
            source.asset = this._asset ?? 0n
            const res = await assetRecordHelper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.assetRecordForm.Show()
    }

    /** 改 */
    readonly Edit = () => {
        this.assetRecordForm.Title.value = TextModel.GetText('Edit AssetRecord', '修改资产记录')

        this.assetRecordForm._getSource = () => {
            const rowData = assetRecordTable.SelectedRowDatas.value[0]
            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new AssetRecordDto()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.assetRecordForm._onSubmitAsync = async source => {
            source.asset = this._asset ?? 0n
            const res = await assetRecordHelper.Edit(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.assetRecordForm.Show(true)
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

    readonly DeleteRowData = (state: DialogState) => {
        if (state != DialogState.Yes) return

        const model = assetRecordTable.SelectedRowDatas.value[0]
        if (!model) {
            console.warn('The model is undefined!')
            return
        }

        assetRecordHelper.Delete(model.id).then(res => {
            this.Refresh()
            ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
        })
    }
}