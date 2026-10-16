import { type Ref } from "vue"

/** “点击外部”行为 */
export class ClickOutsideBehavior {
    //#region 【Fields】
    /** 回调 */
    _callback: Function
    //#endregion 【Fields】

    //#region 【Props】
    /** 目标元素 */
    readonly refTarget: Ref<HTMLElement | undefined>
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(refTarget: Ref<HTMLElement | undefined>, callback: Function) {
        this._callback = callback
        this.refTarget = refTarget
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 执行方法 */
    private readonly handler = (event: MouseEvent) => {
        // 1. 确保目标元素存在
        if (!this.refTarget.value) return

        // 2. 获取点击的目标节点
        const target = event.target as Node

        // 3. 判断点击是否在目标元素内部
        // contains() 会返回 true 如果 target 是元素本身或其子元素
        const isClickInside = this.refTarget.value.contains(target)

        // 4. 如果点击在外部，执行回调
        if (!isClickInside) {
            this._callback()
        }
    }

    /** 开始 */
    readonly Start = () => {
        document.addEventListener('click', this.handler)
    }

    /** 停止 */
    readonly Stop = () => {
        document.removeEventListener('click', this.handler)
    }
    //#endregion 【Functions】
}