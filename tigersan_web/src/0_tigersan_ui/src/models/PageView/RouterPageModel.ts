import { type Component } from "vue"
import DefaultPage from "../../components/PageView/DefaultPage.vue"

/** 页面模型 */
export class PageModel {
    path = ''
    component: Component = DefaultPage
}

/** “路由页面”模型 */
export class RouterPageModel {
    //#region 【Fields】
    /** 页面改变时
     * （由“RouterPage”传入） */
    static _onPageChange?: (page: PageModel) => any
    //#endregion 【Fields】

    //#region 【Props】
    /** 页面 */
    readonly GetPage = () => {
        return this._page
    }
    readonly SetPage = (page: PageModel) => {
        this._page = page
        if (RouterPageModel._onPageChange) {
            RouterPageModel._onPageChange(page)
        }
    }
    private _page = new PageModel()

    /** “页面”集合 */
    readonly GetPages = () => {
        return this._pages
    }
    readonly SetPages = (pages: PageModel[]) => {
        this._pages = pages
        this.GoTo('/')
    }
    private _pages: PageModel[]
    //#endregion 【Props】

    //#region 【Ctor】
    constructor(pages: PageModel[]) {
        this._pages = pages
        this.GoTo('/')
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 跳转 */
    readonly GoTo = (path: string) => {
        const page = this._pages.find(p => p.path === path)
        if (page) {
            this.SetPage(page)
        }
    }
    //#endregion 【Functions】
}

/** 全局“路由页面”模型 */
export const router = new RouterPageModel([])

/** 创建路由 */
export function createRouter(pages: PageModel[]) {
    router.SetPages(pages)
}