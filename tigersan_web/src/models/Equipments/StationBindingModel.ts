import { axiosHelper, IdEntityBase, IdHelper } from "@/helpers"

/** “绑定记录”实体 */
export class StationBindingEntity extends IdEntityBase {
    tag: bigint = 0n
    station: bigint = 0n
    isBinding = true
    time: Date = new Date()
}

/** “绑定记录”实体 */
export class StationBindingDto extends StationBindingEntity {
    stationId = ''
    tagId = ''
}

class StationBindingHelper extends IdHelper<StationBindingDto> {
    constructor() {
        super('StationBinding')
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: {
        tag?: bigint,
        station?: bigint,
    }) => await axiosHelper.GetCount(this._action, {
        filter: {
            filters: [
                { propName: 'Tag', value: param.tag },
                { propName: 'Station', value: param.station },
            ],
        }
    })

    /** 获取“最新数据” */
    readonly GetLast = async (tag?: bigint, station?: bigint) =>
        await axiosHelper.Get<StationBindingDto>(this._action, [{ key: 'Tag', value: tag }, { key: 'Station', value: station }])

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        sort?: string,
        ascending?: boolean,
        tag?: bigint,
        station?: bigint,
    }) => {
        return await axiosHelper.GetList<StationBindingDto>(this._action, {
            pageSize: param.pageSize,
            pageNumber: param.pageNumber,
            sort: param.sort,
            ascending: param.ascending,
            strList: 'FullList',
            filter: {
                filters: [
                    param.tag ? { propName: 'Tag', value: param.tag } : { propName: 'Station', value: param.station }
                ],
            }
        })
    }
}

export const stationBindingHelper = new StationBindingHelper()