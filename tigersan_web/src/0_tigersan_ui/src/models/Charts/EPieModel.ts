import * as echarts from 'echarts'
import { ChartModel } from './ChartModel'
import { ThemeHelper } from '../../helpers'
import type { EDirectionH, EDirectionV, ELabel, ELabelLine, ESize, ETextStyle } from './ChartModel'

export type EPieData = { value: number, name: string }

export class EPieModel extends ChartModel {
    //#region 【Fields】
    /** 配置 */
    _getOpts?: () => Promise<PieOpts>
    //#endregion 【Fields】

    //#region 【Ctor】
    constructor(getOpts?: () => Promise<PieOpts>) {
        super()
        this._getOpts = getOpts
        this._onInitBase = this.Init
    }
    //#endregion 【Ctor】

    //#region 【Functions】
    /** 初始化 */
    readonly Init = async () => {
        if (!this._chart) {
            console.warn('The _chart is undefined!')
            return
        }

        this._chart.setOption(await this.GetOption())
    }

    /** 获取“配置” */
    readonly GetOption = async (): Promise<echarts.EChartsCoreOption> => {
        if (!this._getOpts) return {}
        const opts = await this._getOpts()
        const color = ThemeHelper.IsDark.value ? 'white' : 'black'
        return {
            title: {
                text: opts.title?.text,
                textStyle: {
                    color,
                    ...opts.title?.textStyle
                },
            },
            tooltip: opts.tooltip,
            legend: {
                textStyle: {
                    color,
                },
                ...opts.legend
            },
            series: [
                {
                    type: 'pie',
                    name: opts.tooltip?.name,
                    radius: opts.radius ?? ['40%', '70%'],
                    avoidLabelOverlap: opts.avoidLabelOverlap,
                    label: {
                        color,
                        ...opts.label
                    },
                    emphasis: opts.emphasis,
                    labelLine: opts.labelLine,
                    data: opts.data,
                }
            ],
        }
    }
    //#endregion 【Functions】
}

/** “饼图”配置 */
export type PieOpts = {
    /** 内外半径 */
    radius?: [ESize, ESize]
    /** 是否启用防止标签重叠策略 */
    avoidLabelOverlap?: boolean
    /** 主标题 */
    title?: {
        text?: string
        textStyle?: ETextStyle
    }
    /** 图例 */
    legend?: {
        /** 是否显示 */
        show?: boolean
        type?: 'plain' | 'scroll'
        top?: EDirectionV | ESize
        bottom?: EDirectionV | ESize
        left?: EDirectionH | ESize
        right?: EDirectionH | ESize
        width?: ESize
        height?: ESize
        textStyle?: ETextStyle
    }
    /** 提示框 */
    tooltip?: echarts.TooltipComponentOption & { name?: string }
    /** 标签 */
    label?: ELabel
    /** 标签视觉引导线 */
    labelLine?: ELabelLine
    /** 高亮状态 */
    emphasis?: {
        /** 标签 */
        label?: ELabel
        /** 标签视觉引导线 */
        labelLine?: ELabelLine
    }
    /** 数据 */
    data?: EPieData[]
}