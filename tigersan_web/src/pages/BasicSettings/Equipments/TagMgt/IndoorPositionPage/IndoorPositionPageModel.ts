import PositionList from '@/pages/Home/AssetMapPage/PositionList/PositionList.vue'
import { ref, shallowReactive } from "vue"
import { Colors, FormConfig, FormItemConfig, FormModel, Icons, SubmitResult, TabViewModel, Texts, Verify } from "@/0_tigersan_ui/tigerui"
import { BlobBehavior } from "./BlobBehavior"
import { CsvModel, EditorModes } from "@/models/Shapes/CsvModel"
import { PointModel } from "@/models/Shapes/Shapes"
import { PositionListModel } from "@/pages/Home/AssetMapPage/PositionList/PositionListModel"
import { PositionDto, PositionTypes } from "@/models"

export class StationEntity {
    macAddr = ''
    x = 0
    y = 0
}

export class IndoorPositionPageModel {
    //#region 【Fields】
    /** 背景文件 */
    readonly _bgBlob = new BlobBehavior()
    readonly _svg = new CsvModel()
    /** “标签”列表 */
    readonly tagList = new PositionListModel()
    /** “基站”列表 */
    readonly stationList = new PositionListModel()
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

    /** “增”源数据获取方法 */
    readonly AddGetSource = () => {
        const station = new StationEntity()
        const p = this._svg.TempPoint.value
        if (!p) return station
        station.x = p.X.value
        station.y = p.Y.value
        return station
    }

    /** “MAC地址”项目配置 */
    readonly configMacAddr: FormItemConfig<StationEntity, string> = {
        _propName: 'macAddr',
        PropText: Texts.MacAddr,
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsValidMacAddr(source.macAddr)
    }

    /** “X”项目配置 */
    readonly configX: FormItemConfig<StationEntity, string> = {
        _propName: 'x',
        PropText: 'X',
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsGreaterThan(source.x)
    }

    /** “Y”项目配置 */
    readonly configY: FormItemConfig<StationEntity, string> = {
        _propName: 'y',
        PropText: 'Y',
        IsEquired: true,
        Target: ref(),
        _isVerifyOk: source => Verify.IsGreaterThan(source.y)
    }

    /** “基站”表单配置 */
    readonly configAssetRecordForm: FormConfig<StationEntity> = {
        _getSource: this.AddGetSource,
        _beforeInitAsync: async isEdit => {
        },
        _onSubmitAsync: async (source, isEdit) => {
            if (isEdit) {
            } else {
                this.AddStation(source.x, source.y, source.macAddr)
            }
            this.stationList.SetPositions(this.Stations.map(i => i._data ?? new PositionDto()))
            return new SubmitResult(Texts.AddedSuccessfully.value)
        },
        _onClose: () => {
            this._svg.Clear()
        },
        _itemConfigs: [
            this.configMacAddr,
            this.configX,
            this.configY,
        ]
    }

    /** “基站”表单模型 */
    readonly stationForm = new FormModel(this.configAssetRecordForm)
    //#endregion 【Fields】

    //#region 【Props】
    readonly BgUrl = this._bgBlob.Url
    readonly IsEditing = this._svg.IsEditing
    readonly Tags = shallowReactive<PointModel<PositionDto>[]>([])
    readonly Stations = shallowReactive<PointModel<PositionDto>[]>([])
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this._bgBlob.Name.value = '餐厅.jpeg'
        this._svg._isAutoClear = false
        this._svg.AddLayer({ points: this.Tags })
        this._svg.AddLayer({ points: this.Stations })
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly Refresh = async () => {
        this._bgBlob.Load()
        this._svg.Clear()
        this._svg.Cancel()
        this.tagList.SetSelectedInfo(undefined)
        this.stationList.SetSelectedInfo(undefined)
    }

    readonly Dispose = () => {
        this._bgBlob.Dispose()
    }

    readonly AddTag = (x: number, y: number, macAddr: string) => {
        const dto = new PositionDto()
        dto.info = macAddr
        dto.type = PositionTypes.Station

        const p = new PointModel<PositionDto>(x, y)
        p._data = dto
        p.Fill.value = Colors.Brand
        p.Text.value = Icons.Tag_Planar_2
        p._onClick = model => {
            this.tabList.SetSelectedPage(0)
            if (model._data) this.tagList.GoToPage(model._data)
            this._svg.SetPosition(model.X.value, model.Y.value)
        }
        this.Tags.push(p)
    }

    readonly AddStation = (x: number, y: number, macAddr: string) => {
        const dto = new PositionDto()
        dto.info = macAddr
        dto.type = PositionTypes.Station

        const p = new PointModel<PositionDto>(x, y)
        p._data = dto
        p.Fill.value = Colors.Warning
        p.Text.value = Icons.Router_Planar_2
        p._onClick = model => {
            this.tabList.SetSelectedPage(1)
            if (model._data) this.stationList.GoToPage(model._data)
            this._svg.SetPosition(model.X.value, model.Y.value)
        }
        this.Stations.push(p)
    }

    readonly AddStation1 = () => {
        this._svg.Edit(EditorModes.Point)
        this._svg._onSave = () => {
            const p = this._svg.TempPoint.value
            if (!p) return
            this.stationForm.Show()
        }
    }

    readonly EditLine = () => {
        this._svg.Edit(EditorModes.Line)
    }

    readonly EditRect = () => {
        this._svg.Edit(EditorModes.Rect)
    }

    readonly EditCircle = () => {
        this._svg.Edit(EditorModes.Circle)
    }

    readonly Save = () => {
        this._svg.Save()
    }

    readonly Cancel = () => {
        this._svg.Cancel()
    }

    readonly OnMouseDown = (e: MouseEvent) => {
        this._svg.OnMouseDown(e)
    }

    readonly OnMouseMove = (e: MouseEvent) => {
        this._svg.OnMouseMove(e)
    }

    readonly OnMouseUp = (e: MouseEvent) => {
        this._svg.OnMouseUp(e)
    }

    readonly OnPointClick = (p: PointModel<PositionDto>) => {
    }
    //#endregion 【Functions】
}
