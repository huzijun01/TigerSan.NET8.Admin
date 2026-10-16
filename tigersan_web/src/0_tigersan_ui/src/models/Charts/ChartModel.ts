import * as echarts from 'echarts'
import { ref, shallowRef, type CSSProperties } from 'vue'
import { config, ThemeHelper, WatchBehavior } from '../../helpers'

export type ChartEvent = (chart: echarts.ECharts) => any

export class ChartModel {
    //#region 【Fields】
    /** “地区”监听器 */
    watchLocale: WatchBehavior<any>
    /** “黑暗模式”监听器 */
    watchIsDark: WatchBehavior<any>
    /** 图表实例 */
    _chart?: echarts.ECharts
    /** 初始化配置 */
    _initOpts: echarts.EChartsInitOpts
    /** “初始化”时（由组件内部传入） */
    _onInitBase?: ChartEvent
    //#endregion 【Fields】

    //#region 【Props】
    /** “根元素”样式 */
    readonly RootStyle = ref<CSSProperties | undefined>()
    /** 根元素 */
    readonly refRoot = shallowRef<HTMLElement | undefined>()
    //#endregion 【Props】

    //#region 【Ctor】
    constructor() {
        this._initOpts = {
            width: '400px',
            height: '300px',
        }
        this.watchLocale = new WatchBehavior(config.Locale, this.InitBase)
        this.watchIsDark = new WatchBehavior(ThemeHelper.IsDark, this.InitBase)
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 基础初始化（由“EChart”内部调用） */
    readonly InitBase = () => {
        if (!this.refRoot.value) return
        this._chart = echarts.init(this.refRoot.value, undefined, this._initOpts)
        this._onInitBase?.(this._chart)
    }
    //#endregion 【Functions】
}

/** 触发类型 */
export type Trigger = 'item' | 'axis' | 'none'

/** 像素 | 百分比 */
export type ESize = 'auto' | number | string

/** 水平方位 */
export type EDirectionH = 'left' | 'center' | 'right'

/** 垂直方位 */
export type EDirectionV = 'top' | 'middle' | 'bottom'

/** 字体风格 */
export type EFontStyle = 'normal' | 'italic' | 'oblique'

/** 字体粗细 */
export type EFontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

export type EBounds = number | [number, number] | [number, number, number, number]

export type EBorderType = 'solid' | 'dashed' | 'dotted'

/** 标签 */
export type ELabel = {
    /** 是否显示 */
    show?: boolean
    /** 位置 */
    position?: 'outside' | 'inside' | 'center'
    /** 字体大小 */
    fontStyle?: EFontStyle
    /** 字体大小 */
    fontSize?: number
    /** 字体大小 */
    fontWeight?: EFontWeight
}

/** 标签视觉引导线 */
export type ELabelLine = {
    /** 是否显示 */
    show?: boolean
    /** 是否显示在图形上方 */
    showAbove?: boolean
    /** 第一段长度 */
    length?: number
    /** 第二段长度 */
    length2?: EFontWeight
    /** 平滑（0~1） */
    smooth?: boolean | number
}

/** 字体风格 */
export type ETextStyle = {
    color?: echarts.Color
    fontStyle?: EFontStyle
    fontWeight?: EFontWeight
    fontFamily?: string
    fontSize?: number
    lineHeight?: number
    backgroundColor?: echarts.Color
    borderColor?: echarts.Color
    borderWidth?: number
    borderType?: EBorderType
    borderDashOffset?: number
    borderRadius?: EBounds
    padding?: EBounds
    shadowColor?: echarts.Color
    shadowBlur?: number
    shadowOffsetX?: number
    shadowOffsetY?: number
    width?: number
    height?: number
    textBorderColor?: echarts.Color
    textBorderWidth?: number
    textBorderType?: EBorderType | number | number[]
    textBorderDashOffset?: number
    textShadowColor?: echarts.Color
    textShadowBlur?: number
    textShadowOffsetX?: number
    textShadowOffsetY?: number
    overflow?: 'truncate' | 'break' | 'breakAll'
    ellipsis?: string
    tooltip?: string
}