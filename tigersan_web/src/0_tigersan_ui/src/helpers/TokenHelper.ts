import { ConfigBase } from "./ConfigBase"
import { StringHelper } from "./StringHelper"

export class TokenHelper {
    //#region 【Fields】
    /** 配置 */
    static readonly config = new ConfigBase<string>('token', '')
    //#endregion 【Fields】

    //#region 【Functions】
    /** 获取 */
    static readonly Get = (): string | undefined => {
        var token = this.config.Get()
        return StringHelper.IsNotEmpty(token) ? token : undefined
    }

    /** 保存 */
    static readonly Save = (token?: string) => {
        this.config.Save(token ?? '')
    }
    //#endregion 【Functions】
}