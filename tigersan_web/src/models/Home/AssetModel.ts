import { ArrayHelper, OnlineStates, FilterDto, Methods } from "@/0_tigersan_ui/tigerui"
import { PositionDto } from "./PositionInfoModel"
import { AssetStates, ErrorTypes } from "../base/AssetStates"
import { IdEntityBase, IdHelper, axiosHelper } from "@/helpers"

/** "资产数量"对象 */
export class AssetCountDto {
    /** T ≤ 12h */
    countLessThan12h = 0
    /** 12h ＜ T ≤ 24h */
    count12hTo24h = 0
    /** 24h ＜ T ≤ 36h */
    count24hTo36h = 0
    /** 36h ＜ T ≤ 48h */
    count36hTo48h = 0
    /** T ＞ 48h */
    countGreaterThan48h = 0
}

/** "资产"实体 */
export class AssetEntity extends IdEntityBase {
    assetId = ''
    department: bigint = 0n
    type: bigint = 0n
    tag?: bigint
    tagId?: string
    vehicle?: bigint
    transfer?: bigint
    isAuto: boolean = true
    isInFence: boolean = true
    name?: string
    comment?: string
    errorType?: ErrorTypes
    bindingTime?: Date
    // Tag:
    onlineState: OnlineStates = OnlineStates.Offline
    isFall?: boolean
    tagType?: bigint
    station?: bigint
    stationId?: string
    // 记录:
    lastRecord?: bigint // 计算时才更新，建议使用GetLast获取最新记录
    state: AssetStates = AssetStates.NoRecord
    // 计算:
    calculationTime?: Date
    dailyMove?: number
    monthlyMove?: number
    totalMove?: number
    stayDuration?: number
    travelDuration?: number
    offlineDuration?: number
}

/** "资产"对象 */
export class AssetDto extends AssetEntity {
    company: bigint = 0n
    companyName = ''
    departmentName = ''
    typeName = ''
    stateName = ''
    // 记录:
    rfid?: string
    plate?: string
    siteName?: string
    battery?: number
    fullAddr?: string
    transferCode?: string
}

/** “资产”过滤器 */
export class AssetFilter {
    company?: bigint
    companies?: bigint[]
    department?: bigint
    type?: bigint
    tagType?: bigint
    state?: AssetStates
    states?: Array<AssetStates | undefined>
    onlineState?: OnlineStates
    isAuto?: boolean
    isFall?: boolean
    isInFence?: boolean
    errorType?: ErrorTypes
    name?: string
    rfid?: string
    assetId?: string
    tagId?: string
    stationId?: string

    static GetFilter(param: AssetFilter): FilterDto {
        return {
            parent: {
                id: param.department,
                parent: {
                    id: param.company,
                    ids: param.companies,
                },
            },
            filters: [
                { propName: 'Type', value: param.type },
                { propName: 'TagType', value: param.tagType },
                { propName: 'State', value: param.state, values: param.states },
                { propName: 'OnlineState', value: param.onlineState },
                { propName: 'IsAuto', value: param.isAuto },
                { propName: 'IsFall', value: param.isFall },
                { propName: 'IsInFence', value: param.isInFence },
                { propName: 'ErrorType', value: param.errorType },
                { propName: 'Name', value: param.name === '' ? undefined : param.name, isFuzzy: true },
                { propName: 'AssetId', value: param.assetId === '' ? undefined : param.assetId, isFuzzy: true },
                { propName: 'TagId', value: param.tagId === '' ? undefined : param.tagId, isFuzzy: true },
                { propName: 'StationId', value: param.stationId === '' ? undefined : param.stationId, isFuzzy: true },
            ],
        }
    }
}

export class AssetHelper extends IdHelper<AssetDto> {
    constructor() {
        super('Asset')
    }

    /** 根据“id”或“TagId”获取“单条数据” */
    readonly GetFull = async (id?: bigint, assetId?: string, rfid?: string) => await axiosHelper.Get<AssetDto>(`${this._action}/Full`, [
        { key: 'tagId', value: id ? id.toString() : undefined },
        { key: 'assetId', value: assetId },
        { key: 'rfid', value: rfid },
    ], false)

    // 查:
    /** 筛选“总数” */
    readonly GetCount = async (param: AssetFilter) => {
        if (!param.company && ArrayHelper.IsEmpty(param.companies)) return 0
        if (param.rfid) {
            const res = await this.GetFull(undefined, undefined, param.rfid)
            return res.data ? 1 : 0
        } else {
            return await axiosHelper.GetCount(this._action, {
                filter: AssetFilter.GetFilter(param)
            })
        }
    }

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
    } & AssetFilter) => {
        if (!param.company && ArrayHelper.IsEmpty(param.companies)) return []
        if (param.rfid) {
            const res = await this.GetFull(undefined, undefined, param.rfid)
            const asset = res.data as AssetDto
            return asset ? [asset] : new Array<AssetDto>()
        } else {
            return await axiosHelper.GetList<AssetDto>(this._action, {
                strList: 'FullList',
                pageSize: param.pageSize,
                pageNumber: param.pageNumber,
                filter: AssetFilter.GetFilter(param)
            })
        }
    }

    /** 筛选“位置” */
    readonly GetPosition = async (asset: bigint) => {
        return await axiosHelper.Get<PositionDto>(`${this._action}/Position/${asset}`)
    }

    /** 筛选“位置”集合 */
    readonly GetPositionList = async (param: {
        pageSize?: number,
        pageNumber?: number,
    } & AssetFilter): Promise<PositionDto[]> => {
        if (!param.company && ArrayHelper.IsEmpty(param.companies)) return []
        return await axiosHelper.GetList<PositionDto>(this._action, {
            strList: 'PositionList',
            pageSize: param.pageSize,
            pageNumber: param.pageNumber,
            filter: AssetFilter.GetFilter(param),
            params: [{ key: 'rfid', value: param.rfid }]
        })
    }

    /** 获取“流转”时长分布 */
    readonly GetTravelCounts = async (companies: bigint[]) => {
        return await axiosHelper.Post<AssetCountDto>(`${this._action}/TravelCounts`, undefined, companies)
    }

    /** 获取“停留”时长分布 */
    readonly GetStayCounts = async (companies: bigint[]) => {
        return await axiosHelper.Post<AssetCountDto>(`${this._action}/StayCounts`, undefined, companies)
    }

    /** 下载“CSV” */
    readonly DownloadCsv = async (fileName: string, param: {
        pageSize?: number,
        pageNumber?: number,
        sort?: string,
        ascending?: boolean,
    } & AssetFilter) => await axiosHelper.DownloadFile(fileName, `${this._action}/DownloadCsv`, [
        { key: 'pageSize', value: param.pageSize },
        { key: 'pageNumber', value: param.pageNumber },
        { key: 'sort', value: param.sort },
        { key: 'ascending', value: param.ascending },
    ], Methods.Post, { data: AssetFilter.GetFilter(param) })

    /** 下载“XLSX” */
    readonly DownloadXlsx = async (fileName: string, param: {
        pageSize?: number,
        pageNumber?: number,
        sort?: string,
        ascending?: boolean,
    } & AssetFilter) => await axiosHelper.DownloadFile(fileName, `${this._action}/DownloadXlsx`, [
        { key: 'pageSize', value: param.pageSize },
        { key: 'pageNumber', value: param.pageNumber },
        { key: 'sort', value: param.sort },
        { key: 'ascending', value: param.ascending },
    ], Methods.Post, { data: AssetFilter.GetFilter(param) })

    // Other:
    /** 入库 */
    readonly Inbound = async (ids: number[] | bigint[]) =>
        await axiosHelper.Put(`${this._action}/Inbound`, undefined, ids)

    /** 出库 */
    readonly Outbound = async (site: bigint, ids: number[] | bigint[]) =>
        await axiosHelper.Put(`${this._action}/Outbound/${site.toString()}`, undefined, ids)
}

export const assetHelper = new AssetHelper()