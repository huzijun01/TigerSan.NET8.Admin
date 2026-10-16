import { ArrayHelper, FilterDto, IdName, OnlineStates, SelectModel, StringHelper, Texts } from "@/0_tigersan_ui/tigerui"
import { LocationModes } from "../base/AssetStates"
import { axiosHelper, IdNameHelper } from "@/helpers"
import { PositionDto } from "@/models"

/** “基站”实体 */
export class BaseStationEntity extends IdName {
    site: bigint = 0n
    type: bigint = 0n
    asset?: bigint
    assetId?: string
    isEnable = true
    macAddr = ''
    isMobile = false
    onlineState = OnlineStates.Offline
    heartbeatInterval = 3600
    reportInterval = 900
    monthOffline: bigint = 0n
    createTime: Date = new Date()
    reportTime?: Date
    locationMode?: LocationModes
    longitude?: number
    latitude?: number
    image?: string
}

/** “基站”对象 */
export class BaseStationDto extends BaseStationEntity {
    typeName = ''
    siteName = ''
    company: bigint = 0n
    companyName = ''
    addr = ''
    addrDetail = ''
}

/** “基站”过滤器 */
export class BaseStationFilter {
    company?: bigint
    companies?: bigint[]
    site?: bigint
    isEnable?: boolean
    isMobile?: boolean
    state?: OnlineStates
    type?: bigint
    macAddr?: string

    static GetFilter(param: BaseStationFilter): FilterDto {
        return {
            parent: {
                id: param.site,
                parent: {
                    id: param.company,
                    ids: param.companies,
                }
            },
            filters: [
                { propName: 'IsEnable', value: param.isEnable },
                { propName: 'IsMobile', value: param.isMobile },
                { propName: 'OnlineState', value: param.state },
                { propName: 'Type', value: param.type },
                { propName: 'MacAddr', value: StringHelper.IsNotEmpty(param.macAddr) ? param.macAddr : undefined, isFuzzy: true },
            ]
        }
    }
}

class BaseStationHelper extends IdNameHelper<BaseStationEntity> {
    constructor() {
        super('BaseStation')
    }

    // 查:
    /** 获取“筛选框模型” */
    GetIdNameSelectModel(): SelectModel<IdName> {
        return super.GetIdNameSelectModel(Texts.BaseStation)
    }

    /** 根据“TagId”或“RFID”获取“单条数据” */
    readonly GetFull = async (id?: bigint, macAddr?: string) => await axiosHelper.Get<BaseStationDto>(`${this._action}/Full`, [
        { key: 'id', value: id },
        { key: 'macAddr', value: macAddr }
    ], false)

    /** 筛选“总数” */
    readonly GetCount = async (param: BaseStationFilter) => await axiosHelper.GetCount(this._action, {
        filter: BaseStationFilter.GetFilter(param)
    })

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
    } & BaseStationFilter) => await axiosHelper.GetList<BaseStationDto>(this._action, {
        pageSize: param.pageSize,
        pageNumber: param.pageNumber,
        strList: 'FullList',
        filter: BaseStationFilter.GetFilter(param),
    })

    /** 获取“所属公司”集合 */
    readonly GetBelongCompanyListAsync = async () => await axiosHelper.GetData<IdName[]>(`${this._action}/BelongCompanyList`)

    /** 获取“所属公司”集合 */
    readonly GetBelongSiteListAsync = async (company?: bigint) => {
        if (!company) return []
        return await axiosHelper.GetData<IdName[]>(`${this._action}/BelongSiteList`, [{ key: 'company', value: company }])
    }

    /** 获取“所属基站类型”集合 */
    readonly GetBelongStationTypeListAsync = async (company?: bigint, site?: bigint) => await axiosHelper.GetData<IdName[]>(`${this._action}/BelongStationTypeList`,
        [{ key: 'company', value: company }, { key: 'site', value: site }])

    /** 筛选“位置” */
    readonly GetPosition = async (station: bigint) => {
        return await axiosHelper.Get<PositionDto>(`${this._action}/Position/${station}`)
    }

    /** 筛选“位置”集合 */
    readonly GetPositionList = async (param: {
        pageSize?: number,
        pageNumber?: number,
    } & BaseStationFilter): Promise<PositionDto[]> => {
        if (!param.company && ArrayHelper.IsEmpty(param.companies)) return []
        return await axiosHelper.GetList<PositionDto>(this._action, {
            strList: 'PositionList',
            pageSize: param.pageSize,
            pageNumber: param.pageNumber,
            filter: BaseStationFilter.GetFilter(param),
        })
    }
}

export const baseStationHelper = new BaseStationHelper()
