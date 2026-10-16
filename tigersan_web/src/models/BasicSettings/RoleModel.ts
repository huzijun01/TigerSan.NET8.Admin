import { IdName, AuthorityModel, SelectModel, Texts } from "@/0_tigersan_ui/tigerui"
import { IdNameHelper, axiosHelper } from "@/helpers"

/** "角色"实体 */
export class RoleAuthorityEntity extends IdName {
    company: bigint = 0n
    department: bigint = 0n
    authorities: AuthorityModel[] = []
}

class RoleHelper extends IdNameHelper<RoleAuthorityEntity> {
    constructor() {
        super('Role')
    }

    /** 获取“筛选框模型” */
    GetIdNameSelectModel(): SelectModel<IdName> {
        return super.GetIdNameSelectModel(Texts.Role)
    }

    // 查:
    /** 筛选“总数” */
    readonly GetCount = async (param: {
        company?: bigint,
        department?: bigint
    }) => await axiosHelper.GetCount(this._action, {
        filter: {
            parent: {
                id: param.department,
                parent: {
                    id: param.company,
                }
            }
        }
    })

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        company?: bigint,
        department?: bigint,
    }) => await axiosHelper.GetList<RoleAuthorityEntity>(this._action, {
        pageSize: param.pageSize,
        pageNumber: param.pageNumber,
        strList: 'FullList',
        filter: {
            parent: {
                id: param.department,
                parent: {
                    id: param.company,
                }
            }
        }
    })

    /** 获取“ID名称对”集合 */
    readonly SelectIdNameByDepartment = async (department?: bigint) => {
        if (!department) return []
        return await this.GetIdNames({
            filter: {
                filters: [{ propName: 'Department', value: department }]
            }
        })
    }

    /** 获取“所属公司”集合 */
    readonly GetBelongCompanyListAsync = async () => await axiosHelper.GetData<IdName[]>(`${this._action}/BelongCompanyList`)

    /** 获取“所属部门”集合 */
    readonly GetBelongDepartmentListAsync = async (company?: bigint) => {
        if (!company) return []
        return await axiosHelper.GetData<IdName[]>(`${this._action}/BelongDepartmentList`, [{ key: 'company', value: company }])
    }
}

export const roleHelper = new RoleHelper()