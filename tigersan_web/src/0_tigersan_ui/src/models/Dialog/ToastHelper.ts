import { shallowReactive } from "vue"
import { Toasts } from "../../components"
import { ToastModel, MsgTypes } from './ToastModel'
import { ComponentHelper } from "../../helpers/ComponentHelper/ComponentHelper"

export class ToastHelper {
    //#region 【Fields】
    private static _element?: Element | null
    private static readonly Models = shallowReactive<ToastModel[]>([])
    //#endregion 【Fields】

    //#region 【Functions】
    //#region [private]
    private static Init = () => {
        if (this._element) return
        this._element = ComponentHelper.AppendApp(Toasts, { models: this.Models })
    }
    //#endregion [private]

    static readonly Show = (msg?: string, type?: MsgTypes) => {
        this.Init()
        this.Models.push(new ToastModel(this.Models, msg, type))
    }

    static readonly Success = (msg?: string) => {
        this.Show(msg, MsgTypes.Success)
    }

    static readonly Warning = (msg?: string) => {
        this.Show(msg, MsgTypes.Warning)
    }

    static readonly Error = (msg?: string) => {
        this.Show(msg, MsgTypes.Error)
    }

    static readonly Info = (msg?: string) => {
        this.Show(msg, MsgTypes.Info)
    }
    //#endregion 【Functions】
}