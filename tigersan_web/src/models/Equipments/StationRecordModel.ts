import { Colors, FilterDto, Icons, MarkerIconOptions, OnlineStates } from "@/0_tigersan_ui/tigerui"
import { LocationModes } from "../base/AssetStates"
import { IdEntityBase, IdHelper, axiosHelper } from "@/helpers"

/** "基站记录"实体 */
export class StationRecordEntity extends IdEntityBase {
    station: bigint = 0n
    reportTime = new Date()
    onlineState: OnlineStates = OnlineStates.Offline
    locationMode?: LocationModes
    longitude?: number
    latitude?: number
    address?: string
}

/** "基站记录"过滤器 */
export class StationRecordFilter {
    station?: bigint
    company?: bigint
    site?: bigint
    onlineState?: OnlineStates
    locationMode?: LocationModes

    static GetFilter(param: StationRecordFilter): FilterDto {
        return {
            parent: {
                id: param.station,
                parent: {
                    id: param.site,
                    parent: {
                        id: param.company,
                    }
                }
            },
            filters: [
                { propName: 'OnlineState', value: param.onlineState },
                { propName: 'LocationMode', value: param.locationMode },
            ],
        }
    }
}

class StationRecordHelper extends IdHelper<StationRecordEntity> {
    constructor() {
        super('StationRecord')
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: StationRecordFilter) => await axiosHelper.GetCount(this._action, {
        filter: StationRecordFilter.GetFilter(param)
    })

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
    } & StationRecordFilter) => await axiosHelper.GetList<StationRecordEntity>(this._action, {
        pageSize: param.pageSize,
        pageNumber: param.pageNumber,
        sort: 'ReportTime',
        ascending: false,
        filter: StationRecordFilter.GetFilter(param)
    })

    /** 获取“坐标”总数 */
    readonly GetCoordCount = async (param: {
        station: bigint,
        start?: string,
        end?: string,
        locationMode?: LocationModes,
    }) => await axiosHelper.Post<number>(`${this._action}/CoordCount`, [
        { key: 'station', value: param.station },
        { key: 'start', value: param.start },
        { key: 'end', value: param.end },
        { key: 'locationMode', value: param.locationMode },
    ])

    /** 获取“路径” */
    readonly GetPath = async (param: {
        station: bigint,
        pageSize?: number,
        pageNumber?: number,
        start?: string,
        end?: string,
        locationMode?: LocationModes,
    }) => await axiosHelper.Post<StationRecordEntity[]>(`${this._action}/Path`, [
        { key: 'station', value: param.station },
        { key: 'pageSize', value: param.pageSize },
        { key: 'pageNumber', value: param.pageNumber },
        { key: 'start', value: param.start },
        { key: 'end', value: param.end },
        { key: 'locationMode', value: param.locationMode },
    ])
}

export const stationRecordHelper = new StationRecordHelper()