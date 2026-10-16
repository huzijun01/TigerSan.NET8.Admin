import { IdName, Point2, SelectModel, StringHelper, Texts } from "@/0_tigersan_ui/tigerui"
import { axiosHelper, IdNameHelper } from "@/helpers"

/** "场地"实体 */
export class SiteEntity extends IdName {
    company: bigint = 0n
    type: bigint = 0n
    code = ''
    addr = ''
    addrDetail = ''
    longitude = 0
    latitude = 0
    fencePath?: string
    fencePoints?: Point2[]
    manager?: string
    phone?: string
    comment?: string
}

class SiteHelper extends IdNameHelper<SiteEntity> {
    constructor() {
        super('Site')
    }

    // 查:
    /** 获取“筛选框模型” */
    GetIdNameSelectModel(): SelectModel<IdName> {
        return super.GetIdNameSelectModel(Texts.Site)
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: {
        company?: bigint,
        companies?: bigint[],
        type?: bigint
        code?: string,
    }) => {
        return await axiosHelper.GetCount(this._action, {
            filter: {
                filters: [
                    { propName: 'Company', value: param.company, values: param.companies },
                    { propName: 'Type', value: param.type },
                    { propName: 'Code', value: StringHelper.IsNotEmpty(param.code) ? param.code : undefined },
                ],
            }
        })
    }

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number
        company?: bigint,
        companies?: bigint[],
        type?: bigint,
        code?: string,
    }) => {
        const pageSize = StringHelper.IsNotEmpty(param.code) ? 1 : param.pageSize
        return await axiosHelper.GetList<SiteEntity>(this._action, {
            pageSize: pageSize,
            pageNumber: param.pageNumber,
            filter: {
                filters: [
                    { propName: 'Company', value: param.company, values: param.companies },
                    { propName: 'Type', value: param.type },
                    { propName: 'Code', value: StringHelper.IsNotEmpty(param.code) ? param.code : undefined },
                ],
            }
        })
    }

    /** 根据“公司”获取“ID名称对”集合 */
    readonly GetIdNamesByCompany = async (company?: bigint, companies?: bigint[]) => {
        if (!company && !companies) return []
        return await this.GetIdNames({
            filter: {
                filters: [{ propName: 'Company', value: company, values: companies }]
            }
        })
    }

    /** 获取“所属公司”集合 */
    readonly GetBelongCompanyListAsync = async () => await axiosHelper.GetData<IdName[]>(`${this._action}/BelongCompanyList`)

    /** 获取“所属类型”集合 */
    readonly GetBelongSiteTypeListAsync = async (company?: bigint) => {
        if (!company) return []
        return await axiosHelper.GetData<IdName[]>(`${this._action}/BelongSiteTypeList`, [{ key: 'company', value: company }])
    }
}

export const siteHelper = new SiteHelper()