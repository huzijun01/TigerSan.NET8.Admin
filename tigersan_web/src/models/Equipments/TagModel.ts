import { FilterDto, Methods, OnlineStates, StringHelper } from "@/0_tigersan_ui/tigerui"
import { EqpTypes } from "../base/EqpTypes"
import { LocationModes } from "../base/AssetStates"
import { axiosHelper, IdEntityBase, IdHelper } from "@/helpers"

/** “标签”实体 */
export class TagEntity extends IdEntityBase {
    /** 批次 */
    batch: bigint = 0n
    /** 类型 */
    type: bigint = 0n
    /** 基站 */
    station?: bigint // 当前连接的基站（不作为绑定标志）
    /** 基站ID */
    stationId?: string // 基站绑定标志
    /** 是否脱落 */
    isFall?: boolean
    /** 是否启用 */
    isEnable = true
    /** 设备类型（0：标签，1：定位器） */
    eqpType = EqpTypes.Tag
    /** 是否在线（0：离线，1：在线） */
    onlineState = OnlineStates.Offline
    /** 定位方式 */
    locationMode?: LocationModes
    /** 标签ID */
    tagId = ''
    /** 资产ID */
    assetId?: string
    /** RFID */
    rfid?: string
    /** IMEI */
    imei?: string
    /** ICCID */
    iccid?: string
    /** 电量 */
    battery?: number
    /** 信号 */
    signal?: number
    /** 温度 */
    temperature?: number
    /** 经度 */
    longitude?: number
    /** 维度 */
    latitude?: number
    /** 备注 */
    comment?: string
    /** 上报时间 */
    reportTime?: Date
    /** 图片 */
    image?: string
}

/** “标签”对象 */
export class TagDto extends TagEntity {
    /** 批次ID */
    batchId = ''
    /** 类型名称 */
    typeName = ''
    /** 公司 */
    company?: bigint
    /** 公司名称 */
    companyName?: string
    /** 场地 */
    site?: bigint
    /** 场地名称 */
    siteName?: string
    /** 地址 */
    address?: string
}

/** “标签”过滤器 */
export class TagFilter {
    company?: bigint
    batch?: bigint
    type?: bigint
    station?: bigint
    stationId?: string
    eqpType?: EqpTypes
    isEnable?: boolean
    isBound?: boolean
    state?: OnlineStates
    isFall?: boolean
    tagId?: string
    rfid?: string

    static GetFilter(param: TagFilter): FilterDto {
        return {
            parent: {
                id: param.batch,
                parent: {
                    id: param.company,
                },
            },
            filters: [
                { propName: 'TagId', value: StringHelper.IsNotEmpty(param.tagId) ? param.tagId : undefined, isFuzzy: true },
                { propName: 'Rfid', value: StringHelper.IsNotEmpty(param.rfid) ? param.rfid : undefined, isFuzzy: true },
                { propName: 'StationId', value: StringHelper.IsNotEmpty(param.stationId) ? param.stationId : undefined, isFuzzy: true },
                { propName: 'Type', value: param.type },
                { propName: 'Station', value: param.station },
                { propName: 'EqpType', value: param.eqpType },
                { propName: 'IsEnable', value: param.isEnable },
                { propName: 'AssetId', isNullOrEmpty: param.isBound === undefined ? undefined : !param.isBound },
                { propName: 'OnlineState', value: param.state },
                { propName: 'IsFall', value: param.isFall },
            ],
        }
    }
}

class TagHelper extends IdHelper<TagDto> {
    constructor() {
        super('Tag')
    }

    // 查:
    /** 根据“TagId”或“RFID”获取“单条数据” */
    readonly GetFull = async (tagId?: string, rfid?: string) => await axiosHelper.Get<TagDto>(`${this._action}/Full`, [
        { key: 'tagId', value: tagId },
        { key: 'rfid', value: rfid }
    ], false)

    /** 筛选“总数” */
    readonly GetCount = async (param: TagFilter) => await axiosHelper.GetCount(this._action, {
        filter: TagFilter.GetFilter(param)
    })

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        sort?: string,
        ascending?: boolean,
    } & TagFilter) => await axiosHelper.GetList<TagDto>(this._action, {
        strList: 'FullList',
        pageSize: param.pageSize,
        pageNumber: param.pageNumber,
        sort: param.sort,
        ascending: param.ascending,
        filter: TagFilter.GetFilter(param)
    })

    /** 批量添加 */
    readonly GetFullListByStationId = async (stationId: string) =>
        await axiosHelper.Get<TagDto[]>(`${this._action}/FullListByStationId/${stationId}`)

    /** 下载“CSV” */
    readonly DownloadCsv = async (fileName: string, param: {
        pageSize?: number,
        pageNumber?: number,
        sort?: string,
        ascending?: boolean,
    } & TagFilter) => await axiosHelper.DownloadFile(fileName, `${this._action}/DownloadCsv`, [
        { key: 'pageSize', value: param.pageSize },
        { key: 'pageNumber', value: param.pageNumber },
        { key: 'sort', value: param.sort },
        { key: 'ascending', value: param.ascending },
    ], Methods.Post, { data: TagFilter.GetFilter(param) })

    /** 下载“XLSX” */
    readonly DownloadXlsx = async (fileName: string, param: {
        pageSize?: number,
        pageNumber?: number,
        sort?: string,
        ascending?: boolean,
    } & TagFilter) => await axiosHelper.DownloadFile(fileName, `${this._action}/DownloadXlsx`, [
        { key: 'pageSize', value: param.pageSize },
        { key: 'pageNumber', value: param.pageNumber },
        { key: 'sort', value: param.sort },
        { key: 'ascending', value: param.ascending },
    ], Methods.Post, { data: TagFilter.GetFilter(param) })

    // 增:
    /** 批量添加 */
    readonly AddBatch = async (source: TagEntity) =>
        await axiosHelper.Post(`${this._action}/Batch`, undefined, source)
}

export const tagHelper = new TagHelper()