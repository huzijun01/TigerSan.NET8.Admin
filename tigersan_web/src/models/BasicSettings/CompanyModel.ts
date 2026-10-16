import { IdName, SelectModel, TreeNodeConfig, TreeHelper, Texts } from "@/0_tigersan_ui/tigerui"
import { IdNameHelper } from "@/helpers"

/** "公司"实体 */
export class CompanyEntity extends IdName {
    addr: string = ''
    parent?: bigint = undefined
}

export class CompanyHelper extends IdNameHelper<CompanyEntity> {
    constructor() {
        super('Company')
    }

    /** 获取“筛选框模型” */
    GetIdNameSelectModel(): SelectModel<IdName> {
        const select = super.GetIdNameSelectModel(Texts.Company)
        select.IsAllowSearch.value = true
        return select
    }

    /** “公司数组”转“树配置” */
    static Companies2Tree(companies: CompanyEntity[]): TreeNodeConfig<CompanyEntity>[] {
        return TreeHelper.Array2Tree<CompanyEntity>(
            companies,
            item => item.name,
            item => item.id ?? 0n,
            item => item.parent,
            item => item.name)
    }
}

export const companyHelper = new CompanyHelper()