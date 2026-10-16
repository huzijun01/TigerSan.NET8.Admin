import StationPathPage from './StationPathPage/StationPathPage.vue'
import StationStatePage from './StationStatePage/StationStatePage.vue'
import StationRecordPage from './StationRecordPage/StationRecordPage.vue'
import StationBindingPage from './StationBindingPage/StationBindingPage.vue'
import { TabViewModel, PopWindowModel, Texts, TableModel } from '@/0_tigersan_ui/tigerui'
import { BaseStationDto } from '@/models'
import { StationPathPageModel } from './StationPathPage/StationPathPageModel'
import { StationStatePageModel } from './StationStatePage/StationStatePageModel'
import { StationRecordPageModel } from './StationRecordPage/StationRecordPageModel'
import { StationBindingPageModel } from './StationBindingPage/StationBindingPageModel'

/** 基站详情 */
export class StationDetail {
    //#region 【Fields】
    /** 状态 */
    readonly statePage
    /** 轨迹 */
    readonly pathPage = new StationPathPageModel()
    /** 记录 */
    readonly recordPage = new StationRecordPageModel()
    /** 绑定记录 */
    readonly stationBindingPage = new StationBindingPageModel()

    /** 标签视图 */
    readonly tabView

    /** 弹窗 */
    readonly pop = new PopWindowModel()
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor(table: TableModel<BaseStationDto>) {
        this.pop.MinWidth.value = '80vw'
        this.pop.MinHeight.value = '70vh'
        this.pop._onShow = () => this.tabView.SelectedPage.value = this.tabView.Pages[0]

        this.statePage = new StationStatePageModel(table)
        this.tabView = new TabViewModel([
            {
                Title: Texts.State,
                _component: StationStatePage,
                _rootProps: { model: this.statePage },
            },
            {
                Title: Texts.Path,
                _component: StationPathPage,
                _rootProps: { model: this.pathPage },
            },
            {
                Title: Texts.Record,
                _component: StationRecordPage,
                _rootProps: { model: this.recordPage },
            },
            {
                Title: Texts.BindingRecord,
                _component: StationBindingPage,
                _rootProps: { model: this.stationBindingPage },
            },
        ])
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly Show = (station: BaseStationDto) => {
        this.statePage.station.Data.value = station
        this.pathPage._station = station.id
        this.recordPage._station = station.id
        this.stationBindingPage._station = station.id

        this.pop.Title.value = `${Texts.StationDetail.value} - ${station.macAddr}`
        this.pop.Show()
    }
    //#endregion 【Functions】
}