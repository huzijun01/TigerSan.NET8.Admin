import { OnlineStates } from "@/0_tigersan_ui/tigerui"
import { LocationRecord } from "./PositionInfoModel"
import { IdEntityBase, IdHelper, axiosHelper } from "@/helpers"
import { AssetStates, LocationModes } from "../base/AssetStates"

/** "资产记录"实体 */
export class AssetRecordEntity extends IdEntityBase {
    asset: bigint = 0n
    tag: bigint = 0n
    state: AssetStates = AssetStates.NoRecord
    // Tag:
    onlineState: OnlineStates = OnlineStates.Offline
    reportTime = new Date()
    locationMode?: LocationModes
    station?: bigint
    site?: bigint
    targetSite?: bigint
    battery?: number
    signal?: number
    temperature?: number
    longitude?: number
    latitude?: number
    comment?: string
}

/** "资产记录"对象 */
export class AssetRecordDto extends AssetRecordEntity {
    tagId = ''
    stationId?: string
    stationName?: string
    siteName?: string
    addr?: string
    addrDetail?: string
    address?: string
    targetSiteName?: string
    targetAddr?: string
    targetAddrDetail?: string
    fullAddr = ''
    fullTarget = ''
}

class AssetRecordHelper extends IdHelper<AssetRecordDto> {
    constructor() {
        super('AssetRecord')
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: {
        asset?: bigint,
        company?: bigint,
        department?: bigint,
        state?: number,
        states?: Array<number | undefined>,
        onlineState?: OnlineStates,
        locationMode?: LocationModes,
    }) => await axiosHelper.GetCount(this._action, {
        filter: {
            parent: {
                id: param.asset,
                parent: {
                    id: param.department,
                    parent: {
                        id: param.company,
                    }
                }
            },
            filters: [
                { propName: 'State', value: param.state, values: param.states },
                { propName: 'OnlineState', value: param.onlineState },
                { propName: 'LocationMode', value: param.locationMode },
            ],
        }
    })

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        asset?: bigint,
        company?: bigint,
        department?: bigint,
        state?: number,
        states?: Array<number | undefined>,
        onlineState?: OnlineStates,
        locationMode?: LocationModes,
    }) => await axiosHelper.GetList<AssetRecordDto>(this._action, {
        strList: 'FullList',
        pageSize: param.pageSize,
        pageNumber: param.pageNumber,
        sort: 'ReportTime',
        ascending: false,
        filter: {
            parent: {
                id: param.asset,
                parent: {
                    id: param.department,
                    parent: {
                        id: param.company,
                    }
                }
            },
            filters: [
                { propName: 'State', value: param.state, values: param.states },
                { propName: 'OnlineState', value: param.onlineState },
                { propName: 'LocationMode', value: param.locationMode },
            ],
        }
    })

    /** 获取“坐标”总数 */
    readonly GetCoordCount = async (param: {
        asset: bigint,
        start?: string,
        end?: string,
        company?: bigint,
        department?: bigint,
        locationMode?: LocationModes,
    }) => await axiosHelper.Post<number>(`${this._action}/CoordCount`, [
        { key: 'asset', value: param.asset },
        { key: 'start', value: param.start },
        { key: 'end', value: param.end },
        { key: 'locationMode', value: param.locationMode },
    ], {
        parent: {
            parent: {
                id: param.department,
                parent: {
                    id: param.company,
                }
            }
        },
    })

    /** 获取“路径” */
    readonly GetPath = async (param: {
        asset: bigint,
        pageSize?: number,
        pageNumber?: number,
        start?: string,
        end?: string,
        company?: bigint,
        department?: bigint,
        locationMode?: LocationModes,
    }) => await axiosHelper.Post<LocationRecord[]>(`${this._action}/Path`, [
        { key: 'asset', value: param.asset },
        { key: 'pageSize', value: param.pageSize },
        { key: 'pageNumber', value: param.pageNumber },
        { key: 'start', value: param.start },
        { key: 'end', value: param.end },
        { key: 'locationMode', value: param.locationMode },
    ], {
        parent: {
            parent: {
                id: param.department,
                parent: {
                    id: param.company,
                }
            }
        },
    })

    // 增:
    readonly Add = async (source: AssetRecordDto, isRange: boolean = false) =>
        await axiosHelper.Add(`${this._action}/ByPackage`, source, isRange)
}

export const assetRecordHelper = new AssetRecordHelper()