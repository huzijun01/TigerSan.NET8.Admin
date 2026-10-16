import { axiosHelper, IdHelper, IdEntityBase } from "@/helpers"

export class TransferModel extends IdEntityBase {
    asset = 0n
    site = 0n
    target = 0n
    startTime: string | Date = new Date()
    endTime?: string
    code = ''
    assetId = ''
    plate?: string
    logistics?: string
    driver?: string
    phone?: string
}

export class TransferHelper extends IdHelper<TransferModel> {
    constructor() {
        super('Transfer')
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: {
        site?: bigint,
        target?: bigint,
        code?: string,
        assetId?: string,
    }) => await axiosHelper.GetCount(this._action, {
        filter: {
            filters: [
                { propName: 'Site', value: param.site },
                { propName: 'Target', value: param.target },
                { propName: 'Code', value: param.code === '' ? undefined : param.code },
                { propName: 'AssetId', value: param.assetId === '' ? undefined : param.assetId },
            ]
        }
    })

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        site?: bigint,
        target?: bigint,
        code?: string,
        assetId?: string,
    }) => await axiosHelper.GetList<TransferModel>(this._action, {
        pageSize: param.pageSize,
        pageNumber: param.pageNumber,
        sort: 'startTime',
        ascending: false,
        filter: {
            filters: [
                { propName: 'Site', value: param.site },
                { propName: 'Target', value: param.target },
                { propName: 'Code', value: param.code === '' ? undefined : param.code },
                { propName: 'AssetId', value: param.assetId === '' ? undefined : param.assetId },
            ]
        }
    })
}

export const transferHelper = new TransferHelper()