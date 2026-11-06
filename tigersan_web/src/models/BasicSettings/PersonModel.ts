import { FilterDto, IdName } from "@/0_tigersan_ui/tigerui"
import { IdEntityBase, IdHelper, axiosHelper } from "@/helpers"

/** "人员"实体 */
export class PersonEntity extends IdEntityBase {
    company: bigint = 0n
    department: bigint = 0n
    role: bigint = 0n
    isAdmin = false
    username = ''
    nickname = ''
    password = ''
    avatar?: string
    phone?: string
    mail?: string
}

export class PersonFilter {
    company?: bigint
    department?: bigint
    role?: bigint

    static GetFilter(param: PersonFilter): FilterDto {
        return {
            parent: {
                id: param.role,
                parent: {
                    id: param.department,
                    parent: {
                        id: param.company,
                    }
                }
            }
        }
    }
}

class PersonHelper extends IdHelper<PersonEntity> {
    constructor() {
        super('Person')
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: {
        name?: string
    } & PersonFilter) => await axiosHelper.GetCount(this._action, {
        strCount: 'Count1',
        params: [
            { key: 'name', value: param.name }
        ],
        filter: PersonFilter.GetFilter(param)
    })

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        name?: string,
    } & PersonFilter) => await axiosHelper.GetList<PersonEntity>(this._action, {
        pageSize: param.pageSize,
        pageNumber: param.pageNumber,
        strList: 'FullList',
        params: [
            { key: 'name', value: param.name }
        ],
        filter: PersonFilter.GetFilter(param)
    })

    /** 获取“所属公司”集合 */
    readonly GetBelongCompanyListAsync = async () => await axiosHelper.GetData<IdName[]>(`${this._action}/BelongCompanyList`)

    /** 获取“所属部门”集合 */
    readonly GetBelongDepartmentListAsync = async (company?: bigint) => {
        if (!company) return []
        return await axiosHelper.GetData<IdName[]>(`${this._action}/BelongDepartmentList`, [{ key: 'company', value: company }])
    }

    /** 获取“所属角色”集合 */
    readonly GetBelongRoleListAsync = async (department?: bigint) => {
        if (!department) return []
        return await axiosHelper.GetData<IdName[]>(`${this._action}/BelongRoleList`, [{ key: 'department', value: department }])
    }
}

export const personHelper = new PersonHelper()