import { computed, ref, watch } from 'vue'
import { Colors, DialogHelper, Verify, ObjectHelper, DialogMode, DialogState, FormModel, FormConfig, FormItemConfig, SearchModel, BigintHelper, PaginationModel, ArrayHelper, SwitchModel, GetSubmitResult, IdName, IdValue, ApiResult, OnlineStates, IsEnable, OnlineState, loading, Texts, StringHelper, IsFall, TextModel, ApiResultCode, IsBound } from '@/0_tigersan_ui/tigerui'
import { GetTagTable } from './TagMgtTable'
import { AssetFilter } from '@/pages/Home/AssetLedgerPage/AssetFilter'
import { AssetFormModel } from '@/pages/Home/AssetLedgerPage/AssetFormModel'
import { TagDto, batchHelper, tagHelper, tagTypeHelper, baseStationHelper, EqpTypes, EqpType, companyHelper, assetHelper, imageModelHelper } from '@/models'

export class TagMgtPageModel {
    //#region 【Props】
    /** 是否为“编辑” */
    readonly IsEdit = ref(false)
    /** “在线”总数 */
    readonly OnlineCount = ref(0)
    /** “离线”总数 */
    readonly OfflineCount = ref(0)

    //#region [computed]
    /** 是否“允许绑定” */
    readonly IsAllowBinding = computed(() => {
        const rowData = this.table.SelectedRowDatas.value[0]
        return rowData && !StringHelper.IsNotEmpty(rowData.assetId)
    })
    //#endregion [computed]
    //#endregion 【Props】

    //#region 【Fields】
    /** 设备类型 */
    readonly eqpType: EqpTypes
    /** 设备类型 */
    readonly eqpTypeName: string
    /** 表格 */
    readonly table = GetTagTable()
    /** 分页器 */
    readonly pagination = new PaginationModel()
    /** 开关 */
    readonly switchIsEnable = new SwitchModel()
    /** 资产表单 */
    readonly assetForm = new AssetFormModel()
    /** 上传器 */
    readonly upload = imageModelHelper.GetUploadModel()

    // 选择框:
    /** 筛选 */
    readonly searchRfid: SearchModel
    readonly selectCompany = companyHelper.GetIdNameSelectModel()
    readonly selectOnlineState = OnlineState.GetSelectModel()
    readonly selectIsFall = IsFall.GetSelectModel()
    readonly selectIsEnable = IsEnable.GetSelectModel()
    readonly selectIsBound = IsBound.GetSelectModel()
    readonly selectBatch = batchHelper.GetIdNameSelectModel()
    readonly selectTagType = tagTypeHelper.GetIdNameSelectModel()
    readonly selectStation = baseStationHelper.GetIdNameSelectModel()
    /** 表单 */
    readonly selectBatchForm = batchHelper.GetIdNameSelectModel()
    readonly selectTagTypeForm = tagTypeHelper.GetIdNameSelectModel()

    // 搜索框:
    readonly searchTagId = new SearchModel()
    readonly searchStationId = new SearchModel()

    /** “批次”项目配置 */
    readonly configBatch: FormItemConfig<TagDto, IdValue> = {
        _propName: 'batch',
        PropText: Texts.Batch,
        IsEquired: true,
        Target: this.selectBatchForm.Value,
        _getValue: source => this.selectBatchForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.batch)),
        _setValue: (source, propName, value) => source.batch = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.batch, 0n, Texts.CannotBeEmpty.value)
    }

    /** “类型”项目配置 */
    readonly configType: FormItemConfig<TagDto, IdName> = {
        _propName: 'type',
        PropText: Texts.Type,
        IsEquired: true,
        Target: this.selectTagTypeForm.Value,
        _getValue: source => this.selectTagTypeForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.type)),
        _setValue: (source, propName, value) => source.type = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.type, 0n, Texts.CannotBeEmpty.value)
    }

    /** “标签ID”项目配置 */
    readonly configTagId: FormItemConfig<TagDto, string> = {
        _propName: 'tagId',
        PropText: Texts.TagId,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidMacAddrs(source.tagId, !this.form._isEdit)
    }

    /** “资产ID”项目配置 */
    readonly configAssetId: FormItemConfig<TagDto, string> = {
        _propName: 'assetId',
        PropText: Texts.AssetId,
        IsEquired: false,
        Target: ref(),
    }

    /** “基站ID”项目配置 */
    readonly configStationId: FormItemConfig<TagDto, string> = {
        _propName: 'stationId',
        PropText: Texts.StationId,
        IsEquired: false,
        Target: ref(),
    }

    /** “RFID”项目配置 */
    readonly configRFID: FormItemConfig<TagDto, string> = {
        _propName: 'rfid',
        PropText: 'RFID',
        IsEquired: false,
        Target: ref(),
    }

    /** “备注”项目配置 */
    readonly configComment: FormItemConfig<TagDto, string> = {
        _propName: 'comment',
        PropText: Texts.Comment,
        IsEquired: false,
        Target: ref(),
    }

    /** “图片”项目配置 */
    readonly configImage: FormItemConfig<TagDto, string | undefined> = {
        _propName: 'image',
        PropText: TextModel.Computed('Image', '图片'),
        IsEquired: false,
        Target: ref<string | undefined>(),
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => {
        const tag = new TagDto()
        tag.eqpType = this.eqpType
        return tag
    }

    /** “标签”表单配置 */
    readonly configTagForm: FormConfig<TagDto> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
            this.IsEdit.value = isEdit
            if (isEdit) {
                const rowData = this.table.SelectedRowDatas.value[0]
                if (!rowData) {
                    console.warn('The rowData is undefined!')
                    return
                }

                await this.selectBatchForm.UpdateItemsAsync()
                this.selectBatchForm.Value.value = batchHelper.GetIdValue(rowData.batch)
                await this.selectTagTypeForm.UpdateItemsAsync()
                this.selectTagTypeForm.Value.value = baseStationHelper.GetIdName(rowData.type)
            }
        },
        _onInitAsync: async isEdit => {
            await this.upload.Load()
        },
        _itemConfigs: [
            this.configBatch,
            this.configType,
            this.configTagId,
            this.configAssetId,
            this.configStationId,
            this.configRFID,
            this.configComment,
            this.configImage,
        ]
    }

    /** “标签”表单模型 */
    readonly form = new FormModel(this.configTagForm)
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor(eqpType: EqpTypes) {
        this.eqpType = eqpType
        this.eqpTypeName = EqpType.GetName(eqpType)
        watch(this.table.IsSelected, isSelected => this.switchIsEnable.IsEnable.value = isSelected)
        this.searchRfid = new AssetFilter(this.Refresh).searchRfid
        this.pagination.IsShowSelectedRowCount.value = true
        this.switchIsEnable.IsEnable.value = false
        this.switchIsEnable._onChange = this.EditIsEnable
        this.searchTagId.Placeholder.value = Texts.TagId
        this.searchStationId.Placeholder.value = Texts.StationId
        this.assetForm.IsCompanyEnable = false
        this.assetForm.IsTagIdEnable.value = false
        this.assetForm.IsStationIdEnable.value = false

        // 更新:
        this.table._onSlotChange = this.Refresh
        this.table._onSelectStateChange = this.InitSelectIsEnableState
        this.searchTagId._onSearch = this.Refresh
        this.searchTagId._onChange = this.Refresh
        this.searchStationId._onSearch = this.Refresh
        this.searchStationId._onChange = this.Refresh
        this.pagination._onChange = this.Refresh
        this.selectCompany._onChange = this.Refresh
        this.selectBatch._onChange = this.Refresh
        this.selectStation._onChange = this.Refresh
        this.selectTagType._onChange = this.Refresh
        this.selectOnlineState._onChange = this.Refresh
        this.selectIsFall._onChange = this.Refresh
        this.selectIsEnable._onChange = this.Refresh
        this.selectIsBound._onChange = this.Refresh

        // 上传器:
        this.upload._isAutoLoad = false
        this.upload.IsAllowMulti.value = false
        this.upload._getImages = async () => {
            const image = this.form._source.image
            if (!image) return
            return [{ name: image, url: imageModelHelper.BaseUrl + image }]
        }
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly RefreshBase = async () => {
        this.InitSelectIsEnableState()

        await companyHelper.UpdateIdNames()
        await batchHelper.UpdateIdValues()
        await this.selectBatch.UpdateItemsAsync()
        await tagTypeHelper.UpdateIdNames()
        await this.selectTagType.UpdateItemsAsync()
        await baseStationHelper.UpdateIdNames()
        await this.selectStation.UpdateItemsAsync()

        this.OnlineCount.value = await tagHelper.GetCount({
            company: this.selectCompany.Value.value?.id,
            batch: this.selectBatch.Value.value?.id,
            type: this.selectTagType.Value.value?.id,
            station: this.selectStation.Value.value?.id,
            eqpType: this.eqpType,
            isEnable: this.selectIsEnable.Value.value,
            isBound: this.selectIsBound.Value.value,
            state: OnlineStates.Online,
            isFall: this.selectIsFall.Value.value,
            tagId: this.searchTagId.Value.value,
            stationId: this.searchStationId.Value.value,
            rfid: this.searchRfid.Value.value,
        })
        this.OfflineCount.value = await tagHelper.GetCount({
            company: this.selectCompany.Value.value?.id,
            batch: this.selectBatch.Value.value?.id,
            type: this.selectTagType.Value.value?.id,
            station: this.selectStation.Value.value?.id,
            eqpType: this.eqpType,
            isEnable: this.selectIsEnable.Value.value,
            isBound: this.selectIsBound.Value.value,
            state: OnlineStates.Offline,
            isFall: this.selectIsFall.Value.value,
            tagId: this.searchTagId.Value.value,
            stationId: this.searchStationId.Value.value,
            rfid: this.searchRfid.Value.value,
        })
        this.pagination.Count.value = await tagHelper.GetCount({
            company: this.selectCompany.Value.value?.id,
            batch: this.selectBatch.Value.value?.id,
            type: this.selectTagType.Value.value?.id,
            station: this.selectStation.Value.value?.id,
            eqpType: this.eqpType,
            isEnable: this.selectIsEnable.Value.value,
            isBound: this.selectIsBound.Value.value,
            isFall: this.selectIsFall.Value.value,
            state: this.selectOnlineState.Value.value,
            tagId: this.searchTagId.Value.value,
            stationId: this.searchStationId.Value.value,
            rfid: this.searchRfid.Value.value,
        })
    }

    /** 更新“行数据” */
    readonly UpdateRowDatas = async () => {
        await this.RefreshBase()

        await tagHelper.GetList({
            pageSize: this.pagination.PageSize.value,
            pageNumber: this.pagination.SelectedNum.value,
            company: this.selectCompany.Value.value?.id,
            batch: this.selectBatch.Value.value?.id,
            station: this.selectStation.Value.value?.id,
            eqpType: this.eqpType,
            isEnable: this.selectIsEnable.Value.value,
            isBound: this.selectIsBound.Value.value,
            state: this.selectOnlineState.Value.value,
            type: this.selectTagType.Value.value?.id,
            tagId: this.searchTagId.Value.value,
            rfid: this.searchRfid.Value.value,
        }).then(arr => {
            this.table.UpdateRowDatas(arr, (r, n) => BigintHelper.IsEqualAndNotUndefined(r.id, n.id))
        })
    }

    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            await this.RefreshBase()

            await tagHelper.GetList({
                pageSize: this.pagination.PageSize.value,
                pageNumber: this.pagination.SelectedNum.value,
                sort: this.table.SlotHeader.value?._propName,
                ascending: this.table.IsAscending.value,
                company: this.selectCompany.Value.value?.id,
                batch: this.selectBatch.Value.value?.id,
                station: this.selectStation.Value.value?.id,
                eqpType: this.eqpType,
                isEnable: this.selectIsEnable.Value.value,
                isBound: this.selectIsBound.Value.value,
                state: this.selectOnlineState.Value.value,
                isFall: this.selectIsFall.Value.value,
                type: this.selectTagType.Value.value?.id,
                tagId: this.searchTagId.Value.value,
                stationId: this.searchStationId.Value.value,
                rfid: this.searchRfid.Value.value,
            }).then(arr => {
                ArrayHelper.Set(this.table.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = () => {
        this.form.Title.value = `${Texts.Add.value}${this.eqpTypeName}`

        this.form._getSource = this.AddGetSource

        this.form._onSubmitAsync = async source => {
            const resUpload = await this.upload.Submit()
            if (resUpload.code === ApiResultCode.Error) return GetSubmitResult(resUpload)

            const imgs = this.upload.UsedImages.value
            source.image = imgs ? imgs[0]?._config.name : undefined

            const res = await tagHelper.AddBatch(source)
            if (res.code === ApiResultCode.Error
                && this.form._getSource().image != source.image) {
                const resDelete = await this.upload.Delete()
                if (resDelete.code === ApiResultCode.Error) {
                    ApiResult.ShowResult(res, undefined, false)
                }
            }

            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.form.Show()
    }

    /** 改 */
    readonly Edit = () => {
        this.form.Title.value = `${Texts.Edit.value}${this.eqpTypeName}`

        this.form._getSource = () => {
            const rowData = this.table.SelectedRowDatas.value[0]

            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new TagDto()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.form._onSubmitAsync = async source => {
            const resUpload = await this.upload.Submit()
            if (resUpload.code === ApiResultCode.Error) return GetSubmitResult(resUpload)

            const imgs = this.upload.UsedImages.value
            source.image = imgs ? imgs[0]?._config.name : undefined

            const res = await tagHelper.Edit(source)
            if (res.code === ApiResultCode.Error
                && this.form._getSource().image != source.image) {
                const resDelete = await this.upload.Delete()
                if (resDelete.code === ApiResultCode.Error) {
                    ApiResult.ShowResult(res, undefined, false)
                }
            }

            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.form.Show(true)
    }

    readonly EditIsEnable = (isEnable: boolean) => {
        if (!this.table.IsSelected.value) return

        DialogHelper.Show(
            '修改启用状态',
            isEnable ? '是否启用' : '是否禁用',
            undefined,
            async (state) => {
                try {
                    loading.IsShow.value = true

                    if (state != DialogState.Yes) {
                        this.InitSelectIsEnableState()
                        return
                    }

                    const rowDatas: TagDto[] = []
                    this.table.SelectedRowDatas.value.forEach(rowData => {
                        const newRowData = ObjectHelper.ShallowCopy(rowData)
                        newRowData.isEnable = isEnable
                        rowDatas.push(newRowData)
                    })

                    const res = await tagHelper.EditRange(rowDatas)
                    this.Refresh()
                    this.InitSelectIsEnableState()
                    ApiResult.ShowResult(res)
                } finally {
                    loading.IsShow.value = false
                }
            },
            DialogMode.YesOrNo,
            Colors.Warning)
    }

    readonly InitSelectIsEnableState = () => {
        this.switchIsEnable.Value.value = this.table.IsSelected.value && this.table.SelectedRowDatas.value.every(r => r.isEnable)
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

        const ids = this.table.SelectedRowDatas.value.map(i => i.id)
        if (ids.length < 1) {
            console.warn('No row was selected!')
            return
        }

        try {
            loading.IsShow.value = true

            await tagHelper.DeleteRange(ids).then(res => {
                this.Refresh()
                ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 绑定 */
    readonly Binding = async () => {
        const rowData = this.table.SelectedRowDatas.value[0]
        if (!rowData) {
            console.warn('The rowData is undefined!')
            return
        }
        const tag = ObjectHelper.ShallowCopy(rowData)

        if (StringHelper.IsNotEmpty(tag.assetId)) return

        this.assetForm.assetForm.Title.value = `${Texts.Binding.value}${Texts.Asset.value}`

        this.assetForm.assetForm._getSource = () => {
            const source = this.assetForm.AddGetSource()
            source.company = tag.company ?? 0n
            source.tagId = tag.tagId
            source.assetId = ObjectHelper.GetDateId()
            return source
        }

        this.assetForm.assetForm._onSubmitAsync = async source => {
            const res = await assetHelper.Add(source)
            await this.Refresh()
            return GetSubmitResult(res, '绑定成功')
        }

        this.assetForm.assetForm.Show()
    }

    /** 维修 */
    readonly Repair = () => {
        DialogHelper.Information('维修')
    }

    /** 导出“CSV” */
    readonly ExportCsv = async () => {
        try {
            loading.IsShow.value = true

            const res = await tagHelper.DownloadCsv(EqpType.GetName(this.eqpType), { eqpType: this.eqpType })
            ApiResult.ShowResult(res, Texts.DownloadSuccessfully.value)
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 导出“XLSX” */
    readonly ExportXlsx = async () => {
        try {
            loading.IsShow.value = true

            const res = await tagHelper.DownloadXlsx(EqpType.GetName(this.eqpType), { eqpType: this.eqpType })
            ApiResult.ShowResult(res, Texts.DownloadSuccessfully.value)
        } finally {
            loading.IsShow.value = false
        }
    }
    //#endregion 【Functions】
}