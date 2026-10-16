import JSONBig from 'json-bigint'
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios"
import { Texts } from "../../texts"
import { type AxiosInstance } from "axios"
import { KeyValueModel, ParamHelper } from "../ParamHelper"
import { ApiResult } from "../../models/ApiResult"
import { DialogHelper } from '../DialogHelper'

/** 请求方法 */
export enum Methods {
    Get,
    Post,
    Put,
    Delete,
}

export class AxiosBase {
    //#region 【Fields】
    _api: AxiosInstance
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor(baseURL?: string) {
        const api = axios.create({
            baseURL: baseURL,
            // TransformResponse:axios提供的工具，用在获取后端数据之后，先进行处理，再通过promise返回给axios调用者
            // transformResponse发生在axios 的响应拦截器之前。
            transformResponse: [function (data) {
                try {
                    return JSONBig.parse(data) // 字符串--->对象
                } catch (err) {
                    return data
                }
            }],
            responseType: 'text'
        })

        // 请求拦截器：发送前转换 BigInt -> 字符串
        api.interceptors.request.use(config => {
            const transform = (obj: any) => {
                if (obj === null || typeof obj !== 'object') return obj

                Object.keys(obj).forEach(key => {
                    const value = obj[key]
                    if (typeof value === 'bigint') {
                        obj[key] = value.toString();
                    } else if (typeof value === 'object') {
                        transform(value)
                    }
                })
                return obj
            }
            return {
                ...config,
                data: transform(config.data)
            }
        })

        this._api = api
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    readonly SetAuthorization = (authorization?: string) => {
        this._api.defaults.headers.common['Authorization'] = authorization ? authorization : undefined
    }

    readonly Get = async <TData>(
        action: string,
        params?: KeyValueModel[],
        isShowResult: boolean = true,
        config?: AxiosRequestConfig): Promise<ApiResult<TData>> => {
        try {
            let url = action
            if (params) {
                url += ParamHelper.GetParamString(params)
            }

            const response = await this._api.get(url, config)
            const actionResult = response.data as ApiResult<TData>

            if (actionResult === undefined) {
                DialogHelper.Warning(ApiResult.ActionResult_Undefined.message)
                return ApiResult.ActionResult_Undefined
            }
            else if (isShowResult && !ApiResult.IsSuccess(actionResult)) {
                ApiResult.ShowResult(actionResult)
            }

            return actionResult
        } catch (error) {
            return ApiResult.Error(error as string)
        }
    }

    readonly GetData = async <T extends object | unknown[] | number>(
        action: string,
        params?: KeyValueModel[],
        isShowResult: boolean = true,
        config?: AxiosRequestConfig): Promise<T> =>
        (await this.Get(action, params, isShowResult, config)).data as T

    readonly Post = async <TData>(
        action: string,
        params?: KeyValueModel[],
        data?: unknown,
        config?: AxiosRequestConfig): Promise<ApiResult<TData>> => {
        try {
            let url = action
            if (params) {
                url += ParamHelper.GetParamString(params)
            }

            const response = await this._api.post(url, data, config)
            const actionResult = response.data as ApiResult<TData>

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

    readonly Put = async <TData>(
        action: string,
        params?: KeyValueModel[],
        data?: TData,
        isRange: boolean = false,
        config?: AxiosRequestConfig): Promise<ApiResult<TData>> => {
        try {
            const range = isRange ? '/Range' : ''

            let url = `${action}${range}`
            if (params) {
                url += ParamHelper.GetParamString(params)
            }

            const response = await this._api.put(url, data, config)
            const actionResult = response.data as ApiResult<TData>

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

    readonly Delete = async <TData>(
        action: string,
        id?: number | bigint,
        params?: KeyValueModel[],
        config?: AxiosRequestConfig): Promise<ApiResult<TData>> => {
        try {
            let url = id === undefined ? action : `${action}/${id}`
            if (params) {
                url += ParamHelper.GetParamString(params)
            }

            const response = await this._api.delete(url, config)
            const actionResult = response.data as ApiResult<TData>

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

    readonly DeleteRange = async <TData>(
        action: string,
        ids: number[] | bigint[],
        params?: KeyValueModel[],
        config?: AxiosRequestConfig): Promise<ApiResult<TData>> => {
        try {
            let url = `${action}/Range`
            if (params) {
                url += ParamHelper.GetParamString(params)
            }

            const response = await this._api.delete(url, { data: ids, ...config })
            const actionResult = response.data as ApiResult<TData>

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

    readonly GetBlob = async (
        action: string,
        params?: KeyValueModel[],
        method = Methods.Get,
        config?: AxiosRequestConfig): Promise<Blob | undefined> => {
        try {
            let url = action
            if (params) {
                url += ParamHelper.GetParamString(params)
            }

            let response: AxiosResponse<Blob>

            switch (method) {
                case Methods.Post:
                    response = await this._api.post(url, config?.data, { responseType: 'blob', ...config })
                    break
                case Methods.Put:
                    response = await this._api.put(url, config?.data, { responseType: 'blob', ...config })
                    break
                case Methods.Delete:
                    response = await this._api.delete(url, { responseType: 'blob', ...config })
                    break
                default:
                    response = await this._api.get(url, { responseType: 'blob', ...config })
                    break
            }

            // 检查响应是否成功 (状态码 200-299)
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`Download failed with status: ${response.status}`)
            }

            // 创建 Blob 对象
            return new Blob([response.data], { type: response.headers['content-type'] as string })
        } catch (error) {
            return undefined
        }
    }

    readonly DownloadFile = async (
        fileName: string,
        action: string,
        params?: KeyValueModel[],
        method = Methods.Get,
        config?: AxiosRequestConfig): Promise<ApiResult<undefined>> => {
        let link: HTMLAnchorElement | null = null // 用于后续清理
        try {
            const blob = await this.GetBlob(action, params, method, config)
            if (!blob) return ApiResult.Error('The blob is undefined!')

            // 创建下载链接
            link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = fileName

            // 触发点击
            document.body.appendChild(link)
            link.click()

            return ApiResult.Success(Texts.DownloadSuccessfully.value)
        } catch (error) {
            return ApiResult.Error(error as string)
        } finally {
            if (link) {
                // 移除 DOM 元素
                if (link.parentNode) {
                    link.parentNode.removeChild(link)
                }
                // 释放 Blob URL 内存
                if (link.href) {
                    window.URL.revokeObjectURL(link.href)
                }
            }
        }
    }
    //#endregion 【Functions】
}