import { type ComputedRef } from "vue"
import { KeyValueModel, IdName, FilterDto, BigintHelper, SelectModel } from "@/0_tigersan_ui/tigerui"
import { IdHelper } from "./IdHelper"
import { axiosHelper } from "@/helpers/AxiosHelper"

export class IdNameHelper<TModel extends IdName> extends IdHelper<TModel> {
    /** 更新“ID名称对”集合 */
    _idNames?: IdName[]

    constructor(action: string) {
        super(action)
    }

    // 查:
    /** 获取“ID名称对”集合 */
    readonly GetIdNames = async (param?: {
        isDistinct?: boolean,
        params?: KeyValueModel[],
        filter?: FilterDto
    }) => await axiosHelper.SelectIdName(this._action, param ?? {})

    /** 获取“ID名称对” */
    readonly GetIdName = (id: bigint): IdName | undefined => {
        if (!this._idNames) {
            console.warn('The _idNames is undefined!')
            return
        }
        return this._idNames.find((i => BigintHelper.IsEqualAndNotUndefined(i.id, id)))
    }

    /** 获取“数据” */
    readonly GetModel = async (id: bigint): Promise<TModel | undefined> => {
        const model = (await this.GetList({})).find((i => BigintHelper.IsEqualAndNotUndefined(i.id, id)))

        if (!model) {
            console.warn('The model is undefined!')
        }

        return model
    }

    /** 获取“名称” */
    readonly GetNameAsync = async (id?: bigint, isUpdate: boolean = false): Promise<string> => {
        if (isUpdate || !this._idNames) {
            this._idNames = await this.GetIdNames()
        }

        return this.GetName(id)
    }

    /** 获取“名称” */
    readonly GetName = (id?: bigint): string => {
        if (!this._idNames) return ''

        const idName = this._idNames.find((i => BigintHelper.IsEqualAndNotUndefined(i.id, id)))
        if (!idName) {
            console.warn('The idName is undefined!')
            return ''
        }

        return idName.name
    }

    /** 更新“ID名称对”集合 */
    readonly UpdateIdNames = async () => {
        this._idNames = await this.GetIdNames()
    }

    /** 获取“ID名称对”筛选框模型 */
    GetIdNameSelectModel(placeholder: string | ComputedRef<string>, width: number = 208): SelectModel<IdName> {
        const select = new SelectModel<IdName>()
        select.Width.value = width
        select.Placeholder.value = placeholder
        select._getItemsAsync = async () => await this.GetIdNames()
        select._converter = data => data.name
        return select
    }
}