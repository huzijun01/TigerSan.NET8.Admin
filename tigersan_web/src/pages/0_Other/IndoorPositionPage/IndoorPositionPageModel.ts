import PositionList from '@/pages/Home/AssetMapPage/PositionList/PositionList.vue'
import { computed, ref, shallowReactive, shallowRef } from "vue"
import { ApiResult, ApiResultCode, Colors, EditorModes, FormConfig, FormItemConfig, FormModel, GetSubmitResult, Icons, loading, PointModel, SvgModel, TabViewModel, TextModel, Texts } from "@/0_tigersan_ui/tigerui"
import { PositionListModel } from "@/pages/Home/AssetMapPage/PositionList/PositionListModel"
import { BaseStationDto, baseStationHelper, imageModelHelper, PositionDto, PositionTypes, SiteEntity, siteHelper, tagHelper } from "@/models"

export type XY = { x?: number, y?: number }

function Correct(p?: XY) {
    if (!p || !p.x || !p.y) return false
    return p.x > 0 && p.y > 0
}

export class IndoorPositionPageModel {
    //#region 【Fields】
    /** 场地 */
    _site?: SiteEntity
    /** 上传器 */
    readonly upload = imageModelHelper.GetUploadModel()
    /** “SVG”模型 */
    readonly _svg = new SvgModel(imageModelHelper.Get)
    /** “标签”列表 */
    readonly tagList = new PositionListModel()
    /** “基站”列表 */
    readonly stationList = new PositionListModel<BaseStationDto>()
    /** “列表”标签页 */
    readonly tabList = new TabViewModel([
        {
            Title: Texts.Tag,
            _component: PositionList,
            _rootProps: { model: this.tagList },
        },
        {
            Title: Texts.BaseStation,
            _component: PositionList,
            _rootProps: { model: this.stationList },
        }
    ])

    /** “图片”项目配置 */
    readonly configImage: FormItemConfig<SiteEntity, string> = {
        _propName: 'image',
        PropText: Texts.Image,
        IsEquired: false,
        Target: ref<string | undefined>(),
    }

    /** “上传图片”表单配置 */
    readonly configUploadImageForm: FormConfig<SiteEntity> = {
        Title: Texts.UploadImage,
        _getSource: () => this._site ?? new SiteEntity(),
        _beforeInitAsync: async isEdit => {
            if (isEdit) {
            }
        },
        _onInitAsync: async isEdit => {
            await this.upload.Load()
        },
        _itemConfigs: [
            this.configImage,
        ]
    }

    /** “上传图片”表单模型 */
    readonly formUploadImage = new FormModel(this.configUploadImageForm)
    //#endregion 【Fields】

    //#region 【Props】
    readonly IsEditing = this._svg.IsEditing
    /** 被选中的位置 */
    readonly SelectedStation = shallowRef<PositionDto<BaseStationDto>>()
    readonly Tags = shallowReactive<PointModel<PositionDto>[]>([])
    readonly Stations = shallowReactive<PointModel<PositionDto<BaseStationDto>>[]>([])
    readonly AllowedEdit = computed(() => this.SelectedStation.value != undefined && !this.IsEditing.value)
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this._svg._isAutoClear = false
        this._svg.SetLayers([{ Points: this.Tags }])
        this._svg.AddLayer({ Points: this.Stations })
        this._svg._onSaveAsync = async () => {
            const p = this._svg.TempPoint.value
            const station = this.SelectedStation.value?.data
            if (!p || !station) return
            station.x = p.X.value
            station.y = p.Y.value

            try {
                loading.IsShow.value = true

                const res = await baseStationHelper.Edit(station)
                if (res.code === ApiResultCode.Error) {
                    ApiResult.ShowResult(res, undefined, false)
                }
            } finally {
                loading.IsShow.value = false
            }

            await this.Refresh()
        }

        this.stationList._onClick = info => {
            this.SelectedStation.value = info.Position

            const station = info.Position.data
            if (!station || !station.x || !station.y) {
                this._svg.DeletePosition()
            } else {
                this._svg.SetPosition(station.x, station.y)
            }
        }

        // 上传器:
        this.upload._isAutoLoad = false
        this.upload.IsAllowMulti.value = false
        this.upload._getImages = async () => {
            const image = this._site?.image
            if (!image) return
            return [{ name: image, url: imageModelHelper.BaseUrl + image }]
        }
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true

            this.SelectedStation.value = undefined
            this.tagList.SetSelectedInfo(undefined)
            this.stationList.SetSelectedInfo(undefined)
            this.Tags.splice(0)
            this.Stations.splice(0)

            this._svg.Clear()
            this._svg.Cancel()
            this._svg.SetBg(this._site?.image)
            await this.RefreshStations()
            await this.RefreshTags()
        } finally {
            loading.IsShow.value = false
        }
    }

    readonly RefreshStations = async () => {
        if (!this._site) {
            console.warn('The _site is undefined!')
            return
        }

        // 基站：
        const stations = await baseStationHelper.GetList({
            site: this._site.id,
        })

        const positions: PositionDto<BaseStationDto>[] = []
        stations.forEach(i => {
            const dto = new PositionDto<BaseStationDto>()
            dto.info = i.macAddr
            dto.type = PositionTypes.Station
            dto.reportTime = i.reportTime
            dto.data = i

            const p = new PointModel<PositionDto<BaseStationDto>>({ X: i.x, Y: i.y })
            p._data = dto
            p.Text.value = i.name
            p.IconFill.value = p.TextFill.value = Colors.Warning
            p.Icon.value = Icons.Router_Planar_2
            p._onClick = model => {
                this.SelectedStation.value = model._data
                this.tabList.SetSelectedPage(1)
                if (model._data) this.stationList.GoToPage(model._data)
                this._svg.SetPosition(model.X.value, model.Y.value)
            }
            positions.push(dto)
            if (Correct(i)) this.Stations.push(p)
        })
        this.stationList.SetPositions(positions)
    }

    readonly RefreshTags = async () => {
        if (!this._site) {
            console.warn('The _site is undefined!')
            return
        }

        // 基站：
        const res = await tagHelper.GetIndoorPositionList(this._site.id)
        const positions = res.data
        if (!positions) {
            ApiResult.ShowResult(res, undefined, false)
            return
        }

        positions.forEach(i => {
            i.type = PositionTypes.Tag

            const p = new PointModel<PositionDto>({ X: i.x, Y: i.y })
            p._data = i
            p.Text.value = i.info
            // p.IconFill.value = p.TextFill.value = Colors.Brand
            p.Icon.value = Icons.Tag_Planar_2
            p._onClick = model => {
                this.tabList.SetSelectedPage(0)
                if (model._data) this.tagList.GoToPage(model._data)
                this._svg.SetPosition(model.X.value, model.Y.value)
            }
            this.Tags.push(p)
        })
        this.tagList.SetPositions(positions)
    }

    readonly EditStation = () => {
        this._svg.Edit(EditorModes.Point)
    }

    readonly EditLine = () => {
        this._svg.Edit(EditorModes.Line)
    }

    readonly EditRect = () => {
        this._svg.Edit(EditorModes.Rect)
    }

    readonly Save = () => {
        this._svg.Save()
    }

    readonly Cancel = () => {
        this._svg.Cancel()
    }

    readonly OnPointClick = (p: PointModel<PositionDto>) => {
    }

    readonly UploadImage = () => {
        if (!this._site) {
            console.warn('The _site is undefined!')
            return
        }

        this.formUploadImage._onSubmitAsync = async source => {
            const resUpload = await this.upload.Submit()
            if (resUpload.code === ApiResultCode.Error) return GetSubmitResult(resUpload)

            const imgs = this.upload.UsedImages.value
            source.image = imgs ? imgs[0]?._config.name : undefined

            const res = await siteHelper.Edit(source)
            if (res.code === ApiResultCode.Error
                && this.formUploadImage._getSource().image != source.image) {
                const resDelete = await this.upload.Delete()
                if (resDelete.code === ApiResultCode.Error) {
                    ApiResult.ShowResult(res, undefined, false)
                }
            }

            await this.Refresh()
            return GetSubmitResult(res, Texts.EditedSuccessfully.value)
        }

        this.formUploadImage.Show(true)
    }
    //#endregion 【Functions】
}
