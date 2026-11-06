import { FilterDto } from "@/0_tigersan_ui/tigerui"
import { RepairStates } from "@/models"
import { IdEntityBase, IdHelper, axiosHelper } from "@/helpers"

/** "资产记录"实体 */
export class RepairEntity extends IdEntityBase {
    company: bigint = 0n
    asset: bigint = 0n
    type: bigint = 0n
    state = RepairStates.Submit
    creator: bigint = 0n
    createTime = new Date()
    cost = 0
    code = ''
    image = ''
    comment?: string
}

/** "资产记录"对象 */
export class RepairDto extends RepairEntity {
    assetId = ''
    typeName = ''
    creatorName = ''
}

export class RepairFilter {
    company?: bigint
    asset?: bigint
    type?: bigint
    creator?: bigint
    code?: string

    static GetFilter(param: RepairFilter): FilterDto {
        return {
            filters: [
                { propName: 'Asset', value: param.asset },
                { propName: 'Type', value: param.type },
                { propName: 'Creator', value: param.creator },
                { propName: 'Code', value: param.code === '' ? undefined : param.code },
            ]
        }
    }
}

class RepairHelper extends IdHelper<RepairDto> {
    constructor() {
        super('Repair')
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: RepairFilter) => await axiosHelper.GetCount(this._action, {
        filter: RepairFilter.GetFilter(param)
    })

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
    } & RepairFilter) => await axiosHelper.GetList<RepairDto>(this._action, {
        strList: 'FullList',
        pageSize: param.pageSize,
        pageNumber: param.pageNumber,
        filter: RepairFilter.GetFilter(param)
    })
}

export const repairHelper = new RepairHelper()