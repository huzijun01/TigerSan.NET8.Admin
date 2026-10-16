import AssetPathPage from './AssetPathPage/AssetPathPage.vue'
import AssetStatePage from './AssetStatePage/AssetStatePage.vue'
import AssetRecordPage from './AssetRecordPage/AssetRecordPage.vue'
import BindingRecordPage from './BindingRecordPage/BindingRecordPage.vue'
import { TabViewModel, PopWindowModel, Texts } from '@/0_tigersan_ui/tigerui'
import { AssetPathPageModel } from './AssetPathPage/AssetPathPageModel'
import { AssetStatePageModel } from './AssetStatePage/AssetStatePageModel'
import { AssetRecordPageModel } from './AssetRecordPage/AssetRecordPageModel'
import { BindingRecordPageModel } from './BindingRecordPage/BindingRecordPageModel'

/** 资产详情 */
export class AssetDetail {
    //#region 【Fields】
    /** 状态 */
    readonly statePage = new AssetStatePageModel()
    /** 记录 */
    readonly recordPage = new AssetRecordPageModel()
    /** 轨迹 */
    readonly pathPage = new AssetPathPageModel()
    /** 绑定记录 */
    readonly bindingRecordPage = new BindingRecordPageModel()
    /** 标签视图 */
    readonly tabView = new TabViewModel([
        {
            Title: Texts.State,
            _component: AssetStatePage,
            _rootProps: { model: this.statePage },
        },
        {
            Title: Texts.Path,
            _component: AssetPathPage,
            _rootProps: { model: this.pathPage },
        },
        {
            Title: Texts.Record,
            _component: AssetRecordPage,
            _rootProps: { model: this.recordPage },
        },
        {
            Title: Texts.BindingRecord,
            _component: BindingRecordPage,
            _rootProps: { model: this.bindingRecordPage },
        },
    ])

    /** 弹窗 */
    readonly pop = new PopWindowModel()
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor() {
        this.pop.MinWidth.value = '80vw'
        this.pop.MinHeight.value = '70vh'
        this.pop._onShow = () => this.tabView.SelectedPage.value = this.tabView.Pages[0]
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly Show = async (asset: bigint, assetId: string) => {
        await this.statePage.assetState.Init(assetId)
        this.statePage.Refresh()

        this.recordPage._asset = asset
        this.pathPage._asset = asset
        this.bindingRecordPage._asset = asset

        this.pop.Title.value = `${Texts.AssetDetail.value} - ${assetId}`
        this.pop.Show()
    }
    //#endregion 【Functions】

}