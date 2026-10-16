<template>
    <div class="pie-panel flex-center" ref="refRoot" :style="{ width, height, minWidth, minHeight }"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import type { ECharts, EChartsOption } from 'echarts'
import { assetHelper, AssetStates } from '@/models'
import { Texts, Colors, ThemeHelper, loading, SizeBehavior } from '@/0_tigersan_ui/tigerui'
import { CompanyMgtPageModel } from '@/pages/BasicSettings/BasicSettings/CompanyMgtPage/CompanyMgtPageModel'

/* ===================== Props ===================== */
const props = withDefaults(defineProps<{
    width?: string
    height?: string
    minWidth?: string
    minHeight?: string
}>(), {
    width: 'auto',
    height: 'auto',
    minHeight: '300px',
    companies: () => [],
})

/* ===================== 实例引用 ===================== */
let chartInstance: ECharts | null = null
/** 缓存上一次查询结果，切换主题时无需重新请求 */
let cachedValues: number[] = []
const behavior = new SizeBehavior()
behavior._onResize = () => chartInstance?.resize()
const { refRoot } = behavior

/* ===================== 内置状态配置（完全封装，外部不可改） ===================== */
const STATE_CONFIGS = computed(() => [
    { name: Texts.NoRecord.value, color: Colors.Blue, state: AssetStates.NoRecord },
    { name: Texts.Inbound.value, color: Colors.Yellow, state: AssetStates.Inbound },
    { name: Texts.InStore.value, color: Colors.Green, state: AssetStates.InStore },
    { name: Texts.Stolid.value, color: Colors.Orange, state: AssetStates.Stolid },
    { name: Texts.Outbound.value, color: Colors.Info, state: AssetStates.Outbound },
    { name: Texts.InTransit.value, color: Colors.Brand, state: AssetStates.InTransit },
    { name: Texts.Timeout.value, color: Colors.Red, state: AssetStates.Timeout },
])

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
    const companies = CompanyMgtPageModel.AccessibleCompanies.value
    const tasks = STATE_CONFIGS.value.map(cfg =>
        assetHelper.GetCount({ companies, state: cfg.state }).catch(() => 0),
    )
    return Promise.all(tasks)
}

/* ===================== 渲染图表 ===================== */
function renderChart(values: number[]) {
    if (!chartInstance) return
    const tc = getThemeColors()
    const total = values.reduce((sum, v) => sum + v, 0)

    const seriesData = STATE_CONFIGS.value.map((cfg, i) => ({
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
            text: Texts.AssetState.value,
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
        legend: {
            orient: 'vertical',
            left: 16,
            top: 'middle',
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 10,
            icon: 'roundRect',
            textStyle: { color: tc.text, fontSize: 12 },
            formatter: (name: string) => {
                const item = seriesData.find(d => d.name === name)
                return item ? `${name}  ${item.value}` : name
            },
            tooltip: { show: true },
        },
        color: STATE_CONFIGS.value.map(c => c.color),
        series: [
            {
                name: Texts.AssetState.value,
                type: 'pie',
                radius: ['45%', '70%'],
                center: ['60%', '58%'],
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
        console.error('[AssetStatePieChart] Refresh failed:', err)
        cachedValues = STATE_CONFIGS.value.map(() => 0)
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
