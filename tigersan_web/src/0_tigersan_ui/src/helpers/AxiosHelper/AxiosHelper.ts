
import { AxiosBase } from "./AxiosBase"
import { KeyValueModel } from "../ParamHelper"
import { DialogHelper } from "../DialogHelper"
import { FilterDto } from "../../models/FilterModel"
import { ApiResult } from "../../models/ApiResult"
import { IdName, IdValue } from "../../models/SelectModel"

export class AxiosHelper extends AxiosBase {
    //#region 【Ctor】
    constructor(baseURL: string) {
        super(baseURL)
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    // 列表:
    readonly GetCount = async (
        action: string,
        param: {
            params?: KeyValueModel[],
            filter?: FilterDto
        }): Promise<number> => {
        try {
            const actionResult = await this.Post(`${action}/Count`, param.params, param.filter)

            if (!ApiResult.IsSuccess(actionResult)) {
                ApiResult.ShowResult(actionResult)
                return 0
            }
            else if (ApiResult.IsSuccessNoData(actionResult)) {
                DialogHelper.Warning('GetCount: The data is undefined!')
                return 0
            }

            return actionResult.data as number
        } catch (error) {
            console.error(error)
            return 0
        }
    }

    readonly GetList = async <T>(
        action: string,
        param: {
            pageSize?: number,
            pageNumber?: number,
            strList?: string,
            sort?: string,
            ascending?: boolean,
            params?: KeyValueModel[],
            filter?: FilterDto
        }): Promise<T[]> => {
        try {
            const arrParams: KeyValueModel[] = [
                { key: 'pageSize', value: param.pageSize },
                { key: 'pageNumber', value: param.pageNumber },
                { key: 'sort', value: param.sort },
                { key: 'ascending', value: param.ascending },
            ]
            if (param.params) arrParams.push(...param.params)

            const actionResult = await this.Post(`${action}/${param.strList ?? 'List'}`, arrParams, param.filter)

            if (!ApiResult.IsSuccess(actionResult)) {
                ApiResult.ShowResult(actionResult)
                return []
            }
            else if (ApiResult.IsSuccessNoData(actionResult)) {
                DialogHelper.Warning('GetList: The data is undefined!')
                return []
            }

            return actionResult.data as T[]
        } catch (error) {
            console.error(error)
            return []
        }
    }

    readonly SelectIdValue = async <T extends IdValue>(
        action: string,
        param: {
            isDistinct?: boolean,
            strIdValueList?: string,
            params?: KeyValueModel[],
            filter?: FilterDto
        }): Promise<T[]> => {
        try {
            const arrParams: KeyValueModel[] = [{ key: 'isDistinct', value: param.isDistinct }]
            if (param.params) arrParams.push(...param.params)

            const actionResult = await this.Post(`${action}/${param.strIdValueList ?? 'SelectIdValue'}`, arrParams, param.filter)

            if (!ApiResult.IsSuccess(actionResult)) {
                ApiResult.ShowResult(actionResult)
                return []
            }
            else if (ApiResult.IsSuccessNoData(actionResult)) {
                DialogHelper.Warning('GetList: The data is undefined!')
                return []
            }

            return actionResult.data as T[]
        } catch (error) {
            console.error(error)
            return []
        }
    }

    readonly SelectIdName = async <T extends IdName>(
        action: string,
        param: {
            isDistinct?: boolean,
            strIdNameList?: string,
            params?: KeyValueModel[],
            filter?: FilterDto
        }): Promise<T[]> => {
        try {
            const arrParams: KeyValueModel[] = [{ key: 'isDistinct', value: param.isDistinct }]
            if (param.params) arrParams.push(...param.params)

            const actionResult = await this.Post(`${action}/${param.strIdNameList ?? 'SelectIdName'}`, arrParams, param.filter)

            if (!ApiResult.IsSuccess(actionResult)) {
                ApiResult.ShowResult(actionResult)
                return []
            }
            else if (ApiResult.IsSuccessNoData(actionResult)) {
                DialogHelper.Warning('GetList: The data is undefined!')
                return []
            }

            return actionResult.data as T[]
        } catch (error) {
            console.error(error)
            return []
        }
    }

    readonly Add = async <TData>(
        action: string,
        data: TData,
        isRange: boolean = false): Promise<ApiResult<TData>> => {
        try {
            const range = isRange ? '/Range' : ''
            const actionResult = await this.Post<TData>(`${action}${range}`, undefined, data)

            if (actionResult === undefined) {
                DialogHelper.Warning(ApiResult.ActionResult_Undefined.message)
                return ApiResult.ActionResult_Undefined
            }
            else if (!ApiResult.IsSuccess(actionResult)) {
                ApiResult.ShowResult(actionResult)
            }

            return actionResult
        } catch (error) {
            return ApiResult.Error(error as string)
        }
    }

    // readonly Select = async <T>(action: string, field: string): Promise<T[]> => {
    //     try {
    //         const actionResult = await this.Get(`${action}/Select/${field}}`)

    //         if (!ApiResult.IsSuccess(actionResult)) {
    //             ApiResult.ShowResult(actionResult)
    //             return []
    //         }
    //         else if (ApiResult.IsSuccessNoData(actionResult)) {
    //             dialog.ShowWarning('GetList: The data is undefined!')
    //             return []
    //         }

    //         return actionResult.data as T[]
    //     } catch (error) {
    //         console.error(error)
    //         return []
    //     }
    // }
    //#endregion 【Functions】
}