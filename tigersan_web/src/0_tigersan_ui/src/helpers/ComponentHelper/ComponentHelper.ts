import { h, createApp, type App, type Component } from 'vue'
import type { Data, ManagedElement } from './Types'
import { globalObserver } from './GlobalObserverManager'

export class ComponentHelper {
    /** 创建“应用实例” */
    static CreateApp(component: Component, rootProps?: Data | null): App<Element> {
        return createApp({
            render() {
                return h(component)
            }
        }, rootProps)
    }

    /** 追加“应用实例” */
    static AppendApp(
        component: Component,
        rootProps?: Data | null,
        selectors: string = 'body'): Element | null {
        const body = document.querySelector(selectors)
        if (!body) {
            console.warn('The body is null!')
            return null
        }

        const div = ComponentHelper.GetElement(component, rootProps)
        if (!div) {
            console.warn('The div is null!')
            return null
        }
        body.appendChild(div)
        return div
    }

    /** 移除“元素” */
    static RemoveElement(div: Element, selectors: string = 'body'): boolean {
        const body = document.querySelector(selectors)
        if (!body) {
            console.warn('The body is null!')
            return false
        }

        body.removeChild(div)
        return true
    }

    /** 获取“元素” */
    static GetElement(component: Component, rootProps?: Data | null): Element | null {
        // 1. 创建容器
        const div = document.createElement('div') as ManagedElement

        // 2. 创建 Vue 应用（使用 h 包装以兼容选项式/函数式组件）
        const app = createApp({ render: () => h(component, rootProps ?? undefined) })

        // 3. 挂载
        try {
            app.mount(div)
        } catch (e) {
            console.error('Vue app mount failed:', e)
            return null
        }

        // 4. 绑定实例引用
        div.__vueAppInstance = app

        // 5. 交由全局 Observer 统一追踪（惰性启动）
        globalObserver.start()
        globalObserver.track({ el: div, app })

        return div
    }
}