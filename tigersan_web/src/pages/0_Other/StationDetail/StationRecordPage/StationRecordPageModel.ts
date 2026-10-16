import { ref } from 'vue'
import { Colors, DialogHelper, Verify, ObjectHelper, DialogMode, DialogState, FormModel, FormConfig, FormItemConfig, ArrayHelper, BigintHelper, GetSubmitResult, IdName, ApiResult, loading, Texts, TextModel } from '@/0_tigersan_ui/tigerui'
import { stationRecordTable, pagination } from './StationRecordTable'
import { stationRecordHelper, StationRecordEntity, baseStationHelper, LocationMode } from '@/models'

export class StationRecordPageModel {
    _station?: bigint

    // 选择框:
    /** 筛选 */
    /** “定位方式”选择器 */
    readonly selectLocationMode = LocationMode.GetSelectModel()
    /** 表单 */
    readonly selectStationForm = baseStationHelper.GetIdNameSelectModel()

    /** “基站”项目配置 */
    readonly configStation: FormItemConfig<StationRecordEntity, IdName> = {
        _propName: 'station',
        PropText: Texts.BaseStation,
        IsEquired: true,
        Target: this.selectStationForm.Value,
        _getValue: source => this.selectStationForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.station)),
        _setValue: (source, propName, value) => source.station = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.station, 0n, Texts.CannotBeEmpty.value)
    }

    /** “经度”项目配置 */
    readonly configLongitude: FormItemConfig<StationRecordEntity, string> = {
        _propName: 'longitude',
        PropText: Texts.Longitude,
        IsEquired: false,
        Target: ref(),
    }

    /** “纬度”项目配置 */
    readonly configLatitude: FormItemConfig<StationRecordEntity, string> = {
        _propName: 'latitude',
        PropText: Texts.Latitude,
        IsEquired: false,
        Target: ref(),
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => new StationRecordEntity()

    /** “资产记录”表单配置 */
    readonly configStationRecordForm: FormConfig<StationRecordEntity> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            if (isEdit) {
                const rowData = stationRecordTable.SelectedRowDatas.value[0]
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
    readonly stationRecordForm = new FormModel(this.configStationRecordForm)

    constructor() {
        pagination._onChange = this.Refresh
        this.selectLocationMode._onChange = this.Refresh
    }

    /** 查 */
    readonly Refresh = async () => {
        if (!this._station || this._station == 0n) {
            console.warn('The _station is undefined!')
            return
        }

        try {
            loading.IsShow.value = true

            await baseStationHelper.UpdateIdNames()

            pagination.Count.value = await stationRecordHelper.GetCount({
                station: this._station,
                locationMode: this.selectLocationMode.Value.value,
            })
            await stationRecordHelper.GetList({
                pageSize: pagination.PageSize.value,
                pageNumber: pagination.SelectedNum.value,
                station: this._station,
                locationMode: this.selectLocationMode.Value.value,
            }).then(arr => {
                ArrayHelper.Set(stationRecordTable.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = () => {
        this.stationRecordForm.Title.value = TextModel.GetText('Add StationRecord', '新增资产记录')

        this.stationRecordForm._getSource = this.AddGetSource

        this.stationRecordForm._onSubmitAsync = async source => {
            source.station = this._station ?? 0n
            const res = await stationRecordHelper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.stationRecordForm.Show()
    }

    /** 改 */
    readonly Edit = () => {
        this.stationRecordForm.Title.value = TextModel.GetText('Edit StationRecord', '修改资产记录')

        this.stationRecordForm._getSource = () => {
            const rowData = stationRecordTable.SelectedRowDatas.value[0]
            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new StationRecordEntity()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.stationRecordForm._onSubmitAsync = async source => {
            source.station = this._station ?? 0n
            const res = await stationRecordHelper.Edit(source)
            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.stationRecordForm.Show(true)
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

        const model = stationRecordTable.SelectedRowDatas.value[0]
        if (!model) {
            console.warn('The model is undefined!')
            return
        }

        stationRecordHelper.Delete(model.id).then(res => {
            this.Refresh()
            ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
        })
    }
}