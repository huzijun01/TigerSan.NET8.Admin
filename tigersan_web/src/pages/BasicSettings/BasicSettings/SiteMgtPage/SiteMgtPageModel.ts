import { ref } from 'vue'
import { Colors, DialogHelper, Verify, ObjectHelper, DialogMode, DialogState, FormModel, FormConfig, FormItemConfig, BigintHelper, ArrayHelper, PaginationModel, GetSubmitResult, IdName, ApiResult, loading, MapModel, Texts, SearchModel, TextModel } from '@/0_tigersan_ui/tigerui'
import { siteMgtTable } from './SiteMgtTable'
import { companyHelper, siteHelper, siteTypeHelper, SiteEntity } from '@/models'

export class SiteMgtPageModel {
    //#region 【Fields】
    /** 地图 */
    readonly map = new MapModel<any, any>({ animateEnable: false })
    /** 围栏路径 */
    readonly FencePath = ref<string | undefined>()
    /** 经度 */
    readonly Longitude = ref<number | undefined>()
    /** 纬度 */
    readonly Latitude = ref<number | undefined>()

    /** 分页器 */
    readonly pagination = new PaginationModel()

    /** 搜索框 */
    readonly searchCode = new SearchModel()

    // 选择框:
    /** 筛选 */
    readonly selectCompany = companyHelper.GetIdNameSelectModel()
    readonly selectType = siteTypeHelper.GetIdNameSelectModel()
    /** 表单 */
    readonly selectCompanyForm = companyHelper.GetIdNameSelectModel()
    readonly selectTypeForm = siteTypeHelper.GetIdNameSelectModel()

    /** “公司”项目配置 */
    readonly configCompany: FormItemConfig<SiteEntity, IdName> = {
        _propName: 'company',
        PropText: Texts.Company,
        IsEquired: true,
        Target: this.selectCompanyForm.Value,
        _getValue: source => this.selectCompanyForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.company)),
        _setValue: (source, propName, value) => source.company = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.company, 0n, Texts.CannotBeEmpty.value)
    }

    /** “类型”项目配置 */
    readonly configType: FormItemConfig<SiteEntity, IdName> = {
        _propName: 'type',
        PropText: Texts.Type,
        IsEquired: true,
        Target: this.selectTypeForm.Value,
        _getValue: source => this.selectTypeForm.Items.find(i => BigintHelper.IsEqualAndNotUndefined(i.id, source.type)),
        _setValue: (source, propName, value) => source.type = value && value.id != undefined ? value.id : 0n,
        _isVerifyOk: source => Verify.IsBigintGreaterThan(source.type, 0n, Texts.CannotBeEmpty.value)
    }

    /** “编号”项目配置 */
    readonly configCode: FormItemConfig<SiteEntity, string> = {
        _propName: 'code',
        PropText: Texts.Code,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsNotUndefinedOrEmpty(source.code)
    }

    /** “名称”项目配置 */
    readonly configName: FormItemConfig<SiteEntity, string> = {
        _propName: 'name',
        PropText: Texts.Name,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsNotUndefinedOrEmpty(source.name)
    }

    /** “地址”项目配置 */
    readonly configAddr: FormItemConfig<SiteEntity, string> = {
        _propName: 'addr',
        PropText: Texts.Addr,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsNotUndefinedOrEmpty(source.addr)
    }

    /** “详细地址”项目配置 */
    readonly configAddrDetail: FormItemConfig<SiteEntity, string> = {
        _propName: 'addrDetail',
        PropText: Texts.AddrDetail,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsNotUndefinedOrEmpty(source.addrDetail)
    }

    /** “围栏路径”项目配置 */
    readonly configFencePath: FormItemConfig<SiteEntity, string> = {
        _propName: 'fencePath',
        PropText: Texts.FencePath,
        IsEquired: true,
        Target: this.FencePath,
        _isVerifyOk: source => Verify.IsNotUndefinedOrEmpty(source.fencePath)
    }

    /** “经度”项目配置 */
    readonly configLongitude: FormItemConfig<SiteEntity, number> = {
        _propName: 'longitude',
        PropText: Texts.Longitude,
        IsEquired: true,
        Target: this.Longitude,
        _isVerifyOk: source => Verify.IsValidLongitude(source.longitude)
    }

    /** “纬度”项目配置 */
    readonly configLatitude: FormItemConfig<SiteEntity, number> = {
        _propName: 'latitude',
        PropText: Texts.Latitude,
        IsEquired: true,
        Target: this.Latitude,
        _isVerifyOk: source => Verify.IsValidLatitude(source.latitude)
    }

    /** “联系人”项目配置 */
    readonly configManager: FormItemConfig<SiteEntity, string> = {
        _propName: 'manager',
        PropText: Texts.Manager,
        IsEquired: false,
        Target: ref(),
        // _isVerifyOk: source => Verify.IsNotUndefinedOrEmpty(source.manager)
    }

    /** “电话”项目配置 */
    readonly configPhone: FormItemConfig<SiteEntity, string> = {
        _propName: 'phone',
        PropText: Texts.Phone,
        IsEquired: false,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidPhoneNumber(source.phone)
    }

    /** “备注”项目配置 */
    readonly configComment: FormItemConfig<SiteEntity, string> = {
        _propName: 'comment',
        PropText: Texts.Comment,
        IsEquired: false,
        Target: ref(),
        // _isVerifyOk: source => Verify.IsNotUndefinedOrEmpty(source.comment)
    }

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => {
        const site = new SiteEntity()
        site.code = ObjectHelper.GetDateId()
        return site
    }

    /** 更新“围栏” */
    readonly UpdateFence = () => {
        const site = this.form._source
        if (!site) {
            console.warn('The site is undefined!')
            return
        }

        if (site.fencePoints) {
            const points = MapModel.GetPathByPoints(site.fencePoints)
            this.map.AddPolygonByPoints(points, { fillOpacity: 0.05 })
            this.map.ZoomByVector2s(points)
        } else if (site.latitude > 0 && site.longitude > 0) {
            this.map.ZoomByVector2([site.latitude, site.longitude])
        }
    }

    /** “场地”表单配置 */
    readonly configSiteMgtPageModel: FormConfig<SiteEntity> = {
        _getSource: this.AddGetSource,
        _onInit: this.UpdateFence,
        _beforeInitAsync: async isEdit => {
            this.selectCompanyForm.IsEnabled.value = !isEdit
            this.selectTypeForm.IsEnabled.value = !isEdit

            if (isEdit) {
                const rowData = siteMgtTable.SelectedRowDatas.value[0]
                if (!rowData) {
                    console.warn('The rowData is undefined!')
                    return
                }

                await this.selectCompanyForm.UpdateItemsAsync()
                this.selectCompanyForm.Value.value = companyHelper.GetIdName(rowData.company)
                await this.selectTypeForm.UpdateItemsAsync()
                this.selectTypeForm.Value.value = siteTypeHelper.GetIdName(rowData.type)
            } else {
            }
        },
        _itemConfigs: [
            this.configCompany,
            this.configType,
            this.configCode,
            this.configName,
            this.configAddr,
            this.configAddrDetail,
            this.configFencePath,
            this.configLongitude,
            this.configLatitude,
            this.configManager,
            this.configPhone,
            this.configComment,
        ]
    }

    /** 表单模型 */
    readonly form = new FormModel(this.configSiteMgtPageModel)
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor() {
        this.map.IsAllowMultiPolygon.value = false
        this.map._onInitAsync = async () => {
            await companyHelper.UpdateIdNames()
            await this.map.InitPolygonEditorAsync({ end: this.SaveFence })
        }

        this.form.MinWidth.value = '80vw'
        this.form.MinHeight.value = '80vh'
        this.form.FillOpts.value = { right: true }

        this.selectCompany._getItemsAsync = async () => await siteHelper.GetBelongCompanyListAsync()
        this.selectType._getItemsAsync = async () => await siteHelper.GetBelongSiteTypeListAsync(this.selectCompany.Value.value?.id)
        this.selectTypeForm._getItemsAsync = async () => await siteTypeHelper.GetIdNamesByCompany(this.selectCompanyForm.Value.value?.id)

        // 更新:
        this.searchCode._onChange = this.Refresh
        this.searchCode._onSearch = this.Refresh
        this.selectCompanyForm._onChange = this.selectTypeForm.UpdateItemsAsync
        this.pagination.IsShowSelectedRowCount.value = true
        this.pagination._onChange = this.Refresh
        this.selectCompany._onChange = this.Refresh
        this.selectType._onChange = this.Refresh
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 保存“围栏” */
    readonly SaveFence = () => {
        this.FencePath.value = undefined
        this.Longitude.value = 0
        this.Latitude.value = 0
        const polygons = this.map.GetPolygons()
        if (!polygons) return
        const polygon = polygons[0]
        if (!polygon) return
        this.FencePath.value = MapModel.GetPathStringByPolygon(polygon)
        const center = polygon.getBounds().getCenter()
        this.Longitude.value = center.lng
        this.Latitude.value = center.lat
    }

    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            await companyHelper.UpdateIdNames()
            await siteTypeHelper.UpdateIdNames()
            await this.selectCompany.UpdateItemsAsync()
            await this.selectType.UpdateItemsAsync()

            this.pagination.Count.value = await siteHelper.GetCount({
                company: this.selectCompany.Value.value?.id,
                type: this.selectType.Value.value?.id,
                code: this.searchCode.Value.value
            })

            await siteHelper.GetList({
                pageSize: this.pagination.PageSize.value,
                pageNumber: this.pagination.SelectedNum.value,
                company: this.selectCompany.Value.value?.id,
                type: this.selectType.Value.value?.id,
                code: this.searchCode.Value.value
            }).then(arr => {
                ArrayHelper.Set(siteMgtTable.RowDatas, arr)
            })
        } finally {
            loading.IsShow.value = false
        }
    }

    /** 增 */
    readonly Add = () => {
        this.form.Title.value = TextModel.GetText('Add Site', '新增场地')

        this.form._getSource = this.AddGetSource

        this.form._onSubmitAsync = async source => {
            const res = await siteHelper.Add(source as SiteEntity)

            await this.Refresh()
            return GetSubmitResult(res, Texts.AddedSuccessfully.value)
        }

        this.form.Show()
    }

    /** 改 */
    readonly Edit = () => {
        this.form.Title.value = TextModel.GetText('Edit Site', '修改场地')

        this.form._getSource = () => {
            const rowData = siteMgtTable.SelectedRowDatas.value[0]

            if (!rowData) {
                console.warn('The rowData is undefined!')
                return new SiteEntity()
            }

            return ObjectHelper.ShallowCopy(rowData)
        }

        this.form._onSubmitAsync = async source => {
            const res = await siteHelper.Edit(source as SiteEntity)

            this.map._polygonEditor?.close()
            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.form.Show(true)
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

        const model = siteMgtTable.SelectedRowDatas.value[0]
        if (!model) {
            console.warn('The model is undefined!')
            return
        }

        try {
            loading.IsShow.value = true

            await siteHelper.Delete(model.id).then(res => {
                this.Refresh()
                ApiResult.ShowResult(res, Texts.DeletedSuccessfully.value)
            })
        } finally {
            loading.IsShow.value = false
        }
    }
    //#endregion 【Functions】
}