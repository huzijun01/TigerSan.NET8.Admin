import { SelectModel, IdValue, StringHelper, Texts } from "@/0_tigersan_ui/tigerui"
import { axiosHelper, IdEntityBase, IdHelper } from "@/helpers"

/** "批次"实体 */
export class BatchEntity extends IdEntityBase {
    company: bigint = 0n
    scenario: bigint = 0n
    batchId = ''
    shipmentTime = new Date()
    manager?: string
    phone?: string
    comment?: string
}

class BatchHelper extends IdHelper<BatchEntity> {
    constructor() {
        super('Batch')
        this._strIdValueList = 'IdBatchIdList'
    }

    /** 获取“筛选框模型” */
    GetIdNameSelectModel(): SelectModel<IdValue> {
        const select = super.GetIdValueSelectModel(Texts.Batch)
        select.IsAllowSearch.value = true
        return select
    }

    // 查:
    /** 筛选“总数” */
    readonly GetCount = async (param: {
        company?: bigint,
        scenario?: bigint,
        batchId?: string,
    }) => await axiosHelper.GetCount(this._action, {
        filter: {
            filters: [
                { propName: 'Scenario', value: param.scenario },
                { propName: 'BatchId', value: StringHelper.IsNotEmpty(param.batchId) ? param.batchId : undefined },
            ],
            parent: {
                id: param.company,
            }
        }
    })

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        company?: bigint,
        scenario?: bigint,
        batchId?: string,
    }) => await axiosHelper.GetList<BatchEntity>(this._action, {
        pageSize: param.pageSize,
        pageNumber: param.pageNumber,
        filter: {
            filters: [
                { propName: 'Scenario', value: param.scenario },
                { propName: 'BatchId', value: StringHelper.IsNotEmpty(param.batchId) ? param.batchId : undefined },
            ],
            parent: {
                id: param.company,
            }
        }
    })
}

export const batchHelper = new BatchHelper()