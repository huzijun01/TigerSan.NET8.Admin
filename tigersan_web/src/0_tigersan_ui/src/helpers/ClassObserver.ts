import type { StringArrayFunc } from '../types'

/** class监听 */
export class ClassObserver {
    //#region 【Fields】
    private _element: HTMLElement
    private _observer: MutationObserver
    private _observerConfig: MutationObserverInit
    _onClassChanged?: StringArrayFunc
    //#endregion 【Fields】

    //#region 【Ctor】
    /** 构造函数
     * @param element 默认为html标签 */
    constructor(element?: HTMLElement, onClassChanged?: StringArrayFunc) {
        this._element = element ?? document.documentElement
        this._onClassChanged = onClassChanged

        this._observerConfig = {
            attributes: true,
            attributeFilter: ['class'],
            subtree: false // 只需监听 body 自身
        }

        this._observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (this._onClassChanged) {
                        this._onClassChanged(ClassObserver.GetClassList(mutation.target as HTMLElement))
                    }
                }
            }
        })
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    Start() {
        this._observer.observe(this._element, this._observerConfig)
    }

    Stop() {
        this._observer.disconnect()
    }

    static GetClassList(element: HTMLElement) {
        return Array.from(element.classList)
    }
    //#endregion 【Functions】
}