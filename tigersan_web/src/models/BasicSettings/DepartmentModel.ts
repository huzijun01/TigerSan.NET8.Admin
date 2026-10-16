import { ArrayHelper, IdName, SelectModel, Texts } from "@/0_tigersan_ui/tigerui"
import { IdNameHelper, axiosHelper } from "@/helpers"

/** "组织机构"实体 */
export class DepartmentEntity extends IdName {
    company: bigint = 0n
}

class DepartmentHelper extends IdNameHelper<DepartmentEntity> {
    constructor() {
        super('Department')
    }

    // 查:
    /** 获取“筛选框模型” */
    GetIdNameSelectModel(): SelectModel<IdName> {
        return super.GetIdNameSelectModel(Texts.Department)
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: {
        company?: bigint
    }) => await axiosHelper.GetCount(this._action, {
        filter: {
            filters: [{ propName: 'Company', value: param.company }]
        }
    })

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        company?: bigint,
    }) => await axiosHelper.GetList<DepartmentEntity>(this._action, {
        pageSize: param.pageSize,
        pageNumber: param.pageNumber,
        filter: {
            filters: [{ propName: 'Company', value: param.company }]
        }
    })

    /** 根据“公司”获取“ID名称对”集合 */
    readonly GetIdNamesByCompany = async (company?: bigint, companies?: bigint[]) => {
        if (!company && ArrayHelper.IsEmpty(companies)) return []
        return await this.GetIdNames({
            filter: {
                filters: [{ propName: 'Company', value: company, values: companies }]
            }
        })
    }

    /** 获取“所属公司”集合 */
    readonly GetBelongCompanyListAsync = async () => await axiosHelper.GetData<IdName[]>(`${this._action}/BelongCompanyList`)
}

export const departmentHelper = new DepartmentHelper()