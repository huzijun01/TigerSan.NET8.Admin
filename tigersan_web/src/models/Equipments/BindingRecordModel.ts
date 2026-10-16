import { axiosHelper, IdEntityBase, IdHelper } from "@/helpers"

/** “绑定记录”实体 */
export class BindingRecordEntity extends IdEntityBase {
    tag: bigint = 0n
    asset: bigint = 0n
    isBinding = true
    time: Date = new Date()
}

/** “绑定记录”实体 */
export class BindingRecordDto extends BindingRecordEntity {
    assetId = ''
    tagId = ''
}

class BindingRecordHelper extends IdHelper<BindingRecordDto> {
    constructor() {
        super('BindingRecord')
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: {
        tag?: bigint,
        asset?: bigint,
    }) => await axiosHelper.GetCount(this._action, {
        filter: {
            filters: [
                { propName: 'Tag', value: param.tag },
                { propName: 'Asset', value: param.asset },
            ],
        }
    })

    /** 获取“最新数据” */
    readonly GetLast = async (tag?: bigint, asset?: bigint) =>
        await axiosHelper.Get<BindingRecordDto>(this._action, [{ key: 'Tag', value: tag }, { key: 'Asset', value: asset }])

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        sort?: string,
        ascending?: boolean,
        tag?: bigint,
        asset?: bigint,
    }) => {
        return await axiosHelper.GetList<BindingRecordDto>(this._action, {
            pageSize: param.pageSize,
            pageNumber: param.pageNumber,
            sort: param.sort,
            ascending: param.ascending,
            strList: 'FullList',
            filter: {
                filters: [
                    param.tag ? { propName: 'Tag', value: param.tag } : { propName: 'Asset', value: param.asset }
                ],
            }
        })
    }
}

export const bindingRecordHelper = new BindingRecordHelper()