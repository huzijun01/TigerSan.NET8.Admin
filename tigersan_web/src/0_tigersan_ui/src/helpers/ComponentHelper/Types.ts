import type { App, Component } from 'vue'

/** 组件挂载所需的 props 类型 */
export type Data = Record<string, unknown>

/**
 * 受管理的容器元素扩展接口
 * 在原生 div 上挂载 Vue 实例引用，供卸载时使用
 */
export interface ManagedElement extends HTMLDivElement {
    __vueAppInstance?: App
}

/** 待监听的元素条目：元素本身 + 对应的 Vue 应用实例 */
export interface TrackedEntry {
    el: ManagedElement
    app: App
}

/** 对外导出所需的类型依赖（供其他文件 import） */
export type { Component }