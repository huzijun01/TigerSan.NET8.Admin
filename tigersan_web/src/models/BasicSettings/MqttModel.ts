import { axiosHelper } from "@/helpers"

export class MqttHelper {
    static _action = 'Mqtt'

    /** 开始监听 */
    static readonly Start = async () => await axiosHelper.Get(`${this._action}/Start`)
    /** 停止监听 */
    static readonly Stop = async () => await axiosHelper.Get(`${this._action}/Stop`)
    /** 是否“正在监听” */
    static readonly IsListening = async () => await axiosHelper.Get<boolean>(`${this._action}/IsListening`)
    /** 是否“正在监听” */
    static readonly LastReportTime = async () => await axiosHelper.Get<string>(`${this._action}/LastReportTime`)
}