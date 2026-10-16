import { ArrayHelper, FilterDto } from "@/0_tigersan_ui/tigerui"
import { IdEntityBase, IdHelper, axiosHelper } from "@/helpers"

export class AssetStateRecordEntity extends IdEntityBase {
    company = 0n
    count = 0
    noRecord = 0
    inbound = 0
    inStore = 0
    stolid = 0
    outbound = 0
    inTransit = 0
    timeout = 0
    time = new Date()
}

/** "资产状态记录"模型 */
export class AssetStateRecordDto extends AssetStateRecordEntity {
    companyName: string = ''
    noRecordPerc: number = 0
    inboundPerc: number = 0
    inStorePerc: number = 0
    stolidPerc: number = 0
    outboundPerc: number = 0
    inTransitPerc: number = 0
    timeoutPerc: number = 0
}

/** "资产状态记录"过滤器 */
export class AssetStateRecordFilter {
    company?: bigint
    companies?: bigint[]

    static GetFilter(param: AssetStateRecordFilter): FilterDto {
        return {
            parent: {
                id: param.company,
                ids: param.companies,
            },
        }
    }
}

class AssetStateRecordHelper extends IdHelper<AssetStateRecordEntity> {
    constructor() {
        super('AssetStateRecord')
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: AssetStateRecordFilter) => {
        if (!param.company && ArrayHelper.IsEmpty(param.companies)) return 0
        return await axiosHelper.GetCount(this._action, {
            filter: AssetStateRecordFilter.GetFilter(param)
        })
    }

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        sort?: string,
        ascending?: boolean,
    } & AssetStateRecordFilter) => {
        if (!param.company && ArrayHelper.IsEmpty(param.companies)) return []
        return await axiosHelper.GetList<AssetStateRecordDto>(this._action, {
            strList: 'FullList',
            pageSize: param.pageSize,
            pageNumber: param.pageNumber,
            sort: param.sort,
            ascending: param.ascending,
            filter: AssetStateRecordFilter.GetFilter(param)
        })
    }

    /** 筛选“数据”集合（多公司求和） */
    readonly GetSumFullList = async (companies: bigint[]) => {
        return await axiosHelper.Post<AssetStateRecordDto[]>(`${this._action}/SumFullList`, undefined, companies)
    }
}

export const assetStateRecordHelper = new AssetStateRecordHelper()