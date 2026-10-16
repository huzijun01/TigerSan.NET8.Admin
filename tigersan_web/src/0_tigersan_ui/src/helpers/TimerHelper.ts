export class TimerHelper {
    //#region 【Fields】
    /** 定时器ID */
    private _id?: number
    /** 是否重复触发 */
    private _isRepeat: boolean
    /** 执行方法 */
    _handler: TimerHandler
    /** 间隔时间 */
    _timeout: number
    //#endregion 【Fields】

    //#region 【Props】
    /** 是否“开始” */
    get IsStarted() { return this._id != undefined }
    /** 是否“停止” */
    get IsStoped() { return this._id === undefined }
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(
        handler: TimerHandler,
        timeout: number,
        isRepeat: boolean = true) {
        this._handler = handler
        this._timeout = timeout
        this._isRepeat = isRepeat
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 睡眠 */
    static Sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    /** 开始 */
    readonly Start = () => {
        this.Stop()
        this._id = this._isRepeat
            ? setInterval(this._handler, this._timeout)
            : setTimeout(this._handler, this._timeout)
    }

    /** 停止 */
    readonly Stop = () => {
        if (this._id === undefined) return

        if (this._isRepeat) {
            clearInterval(this._id)
        } else {
            clearTimeout(this._id)
        }

        this._id = undefined
    }

    /** 设置 */
    readonly Set = (isStart: boolean) => {
        if (isStart) {
            this.Start()
        } else {
            this.Stop()
        }
    }
    //#endregion 【Functions】
}