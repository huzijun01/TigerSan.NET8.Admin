import { ArrayHelper, PaginationModel, loading } from '@/0_tigersan_ui/tigerui'
import { analysisTable } from './AnalysisTable'
import { assetStateRecordHelper } from '@/models'
import { CompanyMgtPageModel } from '@/pages/BasicSettings/BasicSettings/CompanyMgtPage/CompanyMgtPageModel'

export class AnalysisPageModel {
    //#region 【Fields】
    /** 分页器 */
    readonly pagination = new PaginationModel()
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor() {
        this.pagination.PageSize.value = 100
        this.pagination.IsShowPageSize.value = false
        this.pagination.IsShowPageTextBox.value = false
        this.pagination.IsShowSelectedRowCount.value = true
        this.pagination._onChange = this.Refresh
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 查 */
    readonly Refresh = async () => {
        try {
            loading.IsShow.value = true
            const targetCompanies = CompanyMgtPageModel.AccessibleCompanies.value
            const res = await assetStateRecordHelper.GetSumFullList(targetCompanies)
            const datas = res.data
            if (!datas) {
                console.error(res.message)
                return
            }

            this.pagination.Count.value = datas.length

            ArrayHelper.Set(analysisTable.RowDatas, datas)
        } finally {
            loading.IsShow.value = false
        }
    }
    //#endregion 【Functions】
}