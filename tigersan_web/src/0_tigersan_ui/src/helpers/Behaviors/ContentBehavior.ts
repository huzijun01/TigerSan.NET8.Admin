import { type App, type Component } from "vue"
import { ComponentHelper } from "../ComponentHelper/ComponentHelper"

/** “内容”行为 */
export class ContentBehavior {
    //#region 【Fields】
    private _panel?: HTMLElement
    private readonly _id: string
    private readonly _component: Component
    private readonly _getContent: () => App<any> | undefined
    private readonly _setContent: (content?: App<any>) => any
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor(
        id: string,
        component: Component,
        getContent: () => App<any> | undefined,
        setContent: (content?: App<any>) => any,
    ) {
        this._id = id
        this._component = component
        this._getContent = getContent
        this._setContent = setContent
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 添加容器 */
    readonly AddPanel = () => {
        const id = this._id
        const dom = document.querySelector(`#${id}`)
        if (dom) {
            this._panel = dom as HTMLElement
        }

        if (!this._panel) {
            this._panel = document.createElement('div')
            this._panel.id = id
            document.body.appendChild(this._panel)
        }

        this._panel.style = 'position: relative;'
    }

    /** 添加内容 */
    readonly AddContent = (model?: any) => {
        this.AddPanel()
        if (!this._panel) {
            console.warn('The panel is undefined!')
            return
        }

        const content = this._getContent()
        if (content) {
            content.unmount()
            this._setContent()
        }

        const contentApp = ComponentHelper.CreateApp(this._component, { model })
        contentApp.mount(this._panel)
        this._setContent(contentApp)
    }

    /** 移除内容 */
    readonly RemoveContent = (model?: any) => {
        const content = this._getContent()
        if (content) {
            content.unmount()
            this._setContent()
        }
    }
    //#endregion 【Functions】
}