<template>
    <div class="pie-panel flex-center" ref="refRoot" :style="{ width, height, minWidth, minHeight }"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import { assetHelper } from '@/models'
import { Colors, SizeBehavior, TextModel, Texts, ThemeHelper, loading } from '@/0_tigersan_ui/tigerui'
import { CompanyMgtPageModel } from '@/pages/BasicSettings/BasicSettings/CompanyMgtPage/CompanyMgtPageModel'

/* ===================== 类型定义 ===================== */
type DurationType = 'travel' | 'stay'

/* ===================== Props ===================== */
const props = withDefaults(defineProps<{
    /** 图表类型：travel=流转时长分布，stay=停留时长分布 */
    type: DurationType
    width?: string
    height?: string
    minWidth?: string
    minHeight?: string
}>(), {
    width: 'auto',
    height: 'auto',
    minHeight: '300px',
})

/* ===================== 实例引用 ===================== */
let chartInstance: ECharts | null = null
/** 缓存上一次查询结果，切换主题时无需重新请求 */
let cachedValues: number[] = []
const behavior = new SizeBehavior()
behavior._onResize = () => chartInstance?.resize()
const { refRoot } = behavior

/* ===================== 内置分段配置（完全封装，外部不可改） ===================== */
const DURATION_CONFIGS = computed(() => [
    { name: 'T ≤ 12h', color: Colors.Green },
    { name: '12h ＜ T ≤ 24h', color: Colors.Blue },
    { name: '24h ＜ T ≤ 36h', color: Colors.Yellow },
    { name: '36h ＜ T ≤ 48h', color: Colors.Orange },
    { name: 'T ＞ 48h', color: Colors.Red },
])

/* ===================== 图表标题 ===================== */
const chartTitle = computed(() => props.type === 'travel'
    ? TextModel.GetText('Flow duration distribution', '流转时长分布')
    : TextModel.GetText('Stay duration distribution', '停留时长分布'))

/* ===================== 主题颜色 ===================== */
function getThemeColors() {
    return ThemeHelper.IsDark.value
        ? {
            text: '#E5EAF3',
            subText: '#A3A6AD',
            line: '#5A5C5F',
            tooltipBg: 'rgba(30, 30, 30, 0.92)',
            tooltipBorder: '#555',
            emptyText: '#888',
            loadingMask: 'rgba(20, 20, 20, 0.65)',
            itemBorder: '#1e1e1e',
        }
        : {
            text: '#303133',
            subText: '#909399',
            line: '#C0C4CC',
            tooltipBg: 'rgba(255, 255, 255, 0.96)',
            tooltipBorder: '#E4E7ED',
            emptyText: '#909399',
            loadingMask: 'rgba(255, 255, 255, 0.7)',
            itemBorder: '#ffffff',
        }
}

/* ===================== 图表生命周期 ===================== */
function initChart() {
    if (!refRoot.value) return
    chartInstance = echarts.init(refRoot.value, undefined, { renderer: 'canvas' })
    renderChart(cachedValues)
}

function disposeChart() {
    chartInstance?.dispose()
    chartInstance = null
}

/* ===================== 数据查询 ===================== */
async function fetchCounts(): Promise<number[]> {
    try {
        const companies = CompanyMgtPageModel.AccessibleCompanies.value
        if (companies.length < 1) return []

        const res = props.type === 'travel'
            ? await assetHelper.GetTravelCounts(companies)
            : await assetHelper.GetStayCounts(companies)

        const data = res.data
        if (!data) {
            console.error(res.message)
            return []
        }
        // 按分段配置顺序返回数值数组
        return [
            data.countLessThan12h,
            data.count12hTo24h,
            data.count24hTo36h,
            data.count36hTo48h,
            data.countGreaterThan48h,
        ]
    } catch (err) {
        console.error(`[${chartTitle.value}] 数据查询失败:`, err)
        return DURATION_CONFIGS.value.map(() => 0)
    }
}

/* ===================== 渲染图表 ===================== */
function renderChart(values: number[]) {
    if (!chartInstance) return
    const tc = getThemeColors()
    const total = values.reduce((sum, v) => sum + v, 0)

    const seriesData = DURATION_CONFIGS.value.map((cfg, i) => ({
        name: cfg.name,
        value: values[i] ?? 0,
        itemStyle: {
            color: cfg.color,
            borderColor: tc.itemBorder,
            borderWidth: 2,
        },
    }))

    const option: EChartsOption = {
        backgroundColor: 'transparent',
        title: {
            text: chartTitle.value,
            left: 'center',
            top: 14,
            textStyle: { fontSize: 16, fontWeight: 600, color: tc.text },
            subtext: total > 0 ? `${Texts.Count.value}: ${total}` : '',
            subtextStyle: { fontSize: 12, color: tc.subText },
        },
        tooltip: {
            trigger: 'item',
            backgroundColor: tc.tooltipBg,
            borderColor: tc.tooltipBorder,
            borderWidth: 1,
            padding: [10, 14],
            textStyle: { color: tc.text, fontSize: 13 },
            formatter: (params: any) => {
                const v: number = params.value ?? 0
                const pct: string = total > 0 ? ((v / total) * 100).toFixed(2) + '%' : '0.00%'
                return `
                    <div style="font-weight:600;margin-bottom:6px;font-size:14px;">${params.name}</div>
                    <div style="line-height:1.8;">${Texts.Count.value}：<b style="color:${params.color}">${v}</b></div>
                    <div style="line-height:1.8;">${Texts.Percent.value}：<b>${pct}</b></div>
                `
            },
        },
        color: DURATION_CONFIGS.value.map(c => c.color),
        series: [
            {
                name: chartTitle.value,
                type: 'pie',
                radius: ['40%', '65%'],
                center: ['50%', '58%'],
                avoidLabelOverlap: true,
                minAngle: 5,
                itemStyle: {
                    borderRadius: 6,
                },
                label: {
                    show: true,
                    color: tc.text,
                    fontSize: 12,
                    formatter: (p: any) => {
                        if (p.value === 0) return ''
                        const pct: string = total > 0 ? ((p.value / total) * 100).toFixed(1) + '%' : '0%'
                        return `{name|${p.name}}\n{val|${p.value}  ${pct}}`
                    },
                    rich: {
                        name: {
                            fontSize: 12,
                            color: tc.text,
                            lineHeight: 18,
                            fontWeight: 500,
                        },
                        val: {
                            fontSize: 11,
                            color: tc.subText,
                            lineHeight: 16,
                        },
                    },
                },
                labelLine: {
                    show: true,
                    showAbove: true,
                    length: 12,
                    length2: 16,
                    smooth: 0.2,
                    lineStyle: {
                        color: tc.line,
                        width: 1,
                    },
                },
                emphasis: {
                    scale: true,
                    scaleSize: 6,
                    label: {
                        show: true,
                        fontSize: 13,
                        fontWeight: 'bold',
                    },
                    itemStyle: {
                        shadowBlur: 14,
                        shadowColor: ThemeHelper.IsDark.value ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
                    },
                },
                data: total > 0 ? seriesData : [],
            },
        ],
        graphic: total === 0
            ? [
                {
                    type: 'group',
                    left: 'center',
                    top: 'middle',
                    children: [
                        {
                            type: 'text',
                            style: {
                                text: Texts.NoContent.value,
                                fontSize: 14,
                                fill: tc.emptyText,
                            },
                        },
                    ],
                },
            ]
            : [],
    }

    chartInstance.resize()
    chartInstance.setOption(option, true)
}

/* ===================== 暴露 Refresh ===================== */
async function Refresh() {
    loading.IsShow.value = true

    try {
        cachedValues = await fetchCounts()
        renderChart(cachedValues)
    } catch (err) {
        console.error(`[${chartTitle.value}] Refresh failed:`, err)
        cachedValues = DURATION_CONFIGS.value.map(() => 0)
        renderChart(cachedValues)
    } finally {
        loading.IsShow.value = false
    }
}

defineExpose({ Refresh })

/* ===================== 生命周期 ===================== */
onMounted(async () => {
    behavior.Observe()
    await nextTick()
    initChart()
    await Refresh()
})

onBeforeUnmount(() => {
    behavior.Unobserver()
    disposeChart()
})

/* ===================== 响应式监听 ===================== */
// 容器尺寸变化时自动 resize
watch(
    () => [props.width, props.height],
    () => nextTick(() => chartInstance?.resize()),
)

// 主题切换：复用缓存数据，无需重新请求
watch(
    ThemeHelper.IsDark,
    async () => {
        disposeChart()
        await nextTick()
        initChart()
    },
)
</script>

<style lang="less" scoped></style>
