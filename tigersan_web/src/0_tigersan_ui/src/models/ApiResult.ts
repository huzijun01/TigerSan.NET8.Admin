import { Texts } from "../texts"
import { ToastHelper } from './Dialog/ToastHelper'
import { DialogHelper } from '../helpers/DialogHelper'
import { FormResult, SubmitResult } from "./Form/FormModel"

export enum ApiResultCode {
    Success = 0,
    Warning = 1,
    Error = 2,
    InvalidToken = 3,
    InvalidCaptcha = 4,
}

export class ApiResult<TData> {
    static readonly ActionResult_Undefined = new ApiResult<any>(ApiResultCode.Error, 'The actionResult is undefined!')
    /** 是否使用“Toast” */
    static _isUseToast = true
    /** “登出”方法 */
    static _logout?: Function

    code: ApiResultCode
    message = ''
    data?: TData

    constructor(
        code: ApiResultCode,
        message = '',
        data?: TData) {
        this.code = code
        this.message = message
        this.data = data
    }

    static Success(msg: string, data?: unknown) {
        return new ApiResult<any>(ApiResultCode.Success, msg, data)
    }

    static Warning(msg: string, data?: unknown) {
        return new ApiResult<any>(ApiResultCode.Warning, msg, data)
    }

    static Error(msg: string, data?: unknown) {
        return new ApiResult<any>(ApiResultCode.Error, msg, data)
    }

    static ShowResult(res: ApiResult<unknown>, success?: string, isShowSuccess = true) {
        if (res.code === ApiResultCode.Error) {
            DialogHelper.Error(res.message)
        } else if (res.code === ApiResultCode.InvalidCaptcha) {
            return
        } else if (res.code === ApiResultCode.InvalidToken) {
            ApiResult._logout?.()
            DialogHelper.Error(res.message)
        } else if (res.code === ApiResultCode.Warning) {
            DialogHelper.Warning(res.message)
        } else if (isShowSuccess) {
            const msg = success ? success : Texts.OperationSuccessful.value
            if (this._isUseToast) ToastHelper.Success(msg)
            else DialogHelper.Success(msg)
        }
    }

    static IsSuccess(res: ApiResult<any>): boolean {
        return res.code == ApiResultCode.Success
    }

    static IsSuccessNoData(res: ApiResult<any>): boolean {
        return res.code == ApiResultCode.Success && res.data === undefined
    }
}

export function GetSubmitResult(res: ApiResult<any>, success?: string): SubmitResult {
    switch (res.code) {
        case ApiResultCode.Error:
            return new SubmitResult(res.message, FormResult.Error)
        case ApiResultCode.Warning:
            return new SubmitResult(res.message, FormResult.Warning)
        default:
            return new SubmitResult(success ?? res.message)
    }
}