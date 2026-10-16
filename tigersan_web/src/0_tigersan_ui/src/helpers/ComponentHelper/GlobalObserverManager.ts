import type { TrackedEntry } from './Types'

/**
 * 全局唯一 MutationObserver 管理器
 * - 整个运行周期只创建一个 Observer 实例
 * - 通过 Set 集中维护所有待监听的动态组件根元素
 * - DOM 变动时批量遍历 removedNodes，命中即清理
 */
class GlobalObserverManager {
    private observer: MutationObserver | null = null
    private tracked = new Set<TrackedEntry>()

    /** 开始监听（首次注册时惰性启动） */
    start(): void {
        if (this.observer) return
        this.observer = new MutationObserver((mutations) => this.handle(mutations))
        // 只观察 body 子树，监听节点增删
        this.observer.observe(document.body, { childList: true, subtree: true })
    }

    /** 注册一个需要追踪的元素 */
    track(entry: TrackedEntry): void {
        this.tracked.add(entry)
    }

    /** 处理 DOM 变更批量回调 */
    private handle(mutations: MutationRecord[]): void {
        if (this.tracked.size === 0) return

        // 收集本轮被移除的 TrackedEntry，统一清理
        const toRemove: TrackedEntry[] = []

        for (const mutation of mutations) {
            for (const removedNode of mutation.removedNodes) {
                if (!(removedNode instanceof Node)) continue
                for (const entry of this.tracked) {
                    // 元素自身被移除 或 祖先节点被移除（元素脱离文档）
                    if (removedNode === entry.el || removedNode.contains(entry.el)) {
                        toRemove.push(entry)
                    }
                }
            }
        }

        // 执行清理：卸载 Vue 实例并从追踪集合移除
        for (const entry of toRemove) {
            this.cleanup(entry)
        }

        // 全部元素卸载完后可断开观察器，节省资源
        if (this.tracked.size === 0) {
            this.stop()
        }
    }

    /** 清理单个条目 */
    private cleanup(entry: TrackedEntry): void {
        const { el, app } = entry
        try {
            app.unmount()
        } catch (e) {
            console.warn('Vue app unmount error:', e)
        }
        delete el.__vueAppInstance
        this.tracked.delete(entry)
    }

    /** 停止观察（无元素需要追踪时自动调用） */
    private stop(): void {
        this.observer?.disconnect()
        this.observer = null
    }
}

/** 模块级单例 */
export const globalObserver = new GlobalObserverManager()
