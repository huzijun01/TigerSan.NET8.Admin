import { ArrayHelper } from "@/0_tigersan_ui/tigerui"
import { IdEntityBase, IdHelper, axiosHelper } from "@/helpers"

/** "盘点记录"模型 */
export class InventoryRecordModel extends IdEntityBase {
    site = 0n
    inStore = 0
    stolid = 0
    add = 0
    reduce = 0
    time = new Date()
    // 附加:
    companyName = ''
    siteName = ''
}

/** "盘点记录"过滤器 */
export type InventoryRecordFilter = {
    site?: bigint,
    company?: bigint,
    companies?: bigint[],
}

class InventoryRecordHelper extends IdHelper<InventoryRecordModel> {
    constructor() {
        super('InventoryRecord')
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: InventoryRecordFilter) => {
        if (!param.company && ArrayHelper.IsEmpty(param.companies)) return 0
        return await axiosHelper.GetCount(this._action, {
            filter: {
                parent: {
                    id: undefined,
                    parent: {
                        id: param.company,
                        ids: param.companies,
                    },
                },
                filters: [
                    { propName: 'Site', value: param.site },
                ],
            }
        })
    }

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        sort?: string,
        ascending?: boolean,
    } & InventoryRecordFilter) => {
        if (!param.company && ArrayHelper.IsEmpty(param.companies)) return []
        return await axiosHelper.GetList<InventoryRecordModel>(this._action, {
            strList: 'FullList',
            pageSize: param.pageSize,
            pageNumber: param.pageNumber,
            sort: param.sort,
            ascending: param.ascending,
            filter: {
                parent: {
                    id: undefined,
                    parent: {
                        id: param.company,
                        ids: param.companies,
                    },
                },
                filters: [
                    { propName: 'Site', value: param.site },
                ],
            }
        })
    }
}

export const inventoryRecordHelper = new InventoryRecordHelper()