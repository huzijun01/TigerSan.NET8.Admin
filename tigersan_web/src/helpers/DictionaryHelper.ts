import { type ComputedRef } from "vue"
import { ArrayHelper, FilterDto, IdName, SelectModel } from "@/0_tigersan_ui/tigerui"
import { axiosHelper } from "./AxiosHelper"
import { IdNameHelper } from "./IdNameHelper"

/** “字典”过滤器 */
export class DictionarytFilter {
    company?: bigint
    companies?: bigint[]

    static GetFilter(param: DictionarytFilter): FilterDto {
        if (!param.company && ArrayHelper.IsEmpty(param.companies)) return {}
        return {
            filters: [{ propName: 'Company', value: param.company, values: param.companies }],
        }
    }
}

export class DictionaryHelper extends IdNameHelper<IdName> {
    //#region 【Fields】
    private _placeholder: string | ComputedRef
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor(action: string, placeholder: string | ComputedRef) {
        super(action)
        this._placeholder = placeholder
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 获取“筛选框模型” */
    GetIdNameSelectModel(): SelectModel<IdName> {
        return super.GetIdNameSelectModel(this._placeholder)
    }

    /** 筛选“总数” */
    readonly GetCount = async (param: {
        company?: bigint,
        companies?: bigint[]
    }) => await axiosHelper.GetCount(this._action, {
        filter: DictionarytFilter.GetFilter(param)
    })

    /** 筛选“数据”集合 */
    readonly GetList = async (param: {
        pageSize?: number,
        pageNumber?: number,
        company?: bigint,
    }) => {
        return await axiosHelper.GetList<IdName>(this._action, {
            pageSize: param.pageSize,
            pageNumber: param.pageNumber,
            filter: DictionarytFilter.GetFilter(param)
        })
    }

    /** 根据“公司”获取“ID名称对”集合 */
    readonly GetIdNamesByCompany = async (company?: bigint, companies?: bigint[]) => {
        if (!company && ArrayHelper.IsEmpty(companies)) return []
        return await this.GetIdNames({
            filter: DictionarytFilter.GetFilter({ company, companies })
        })
    }
    //#endregion 【Functions】
}
