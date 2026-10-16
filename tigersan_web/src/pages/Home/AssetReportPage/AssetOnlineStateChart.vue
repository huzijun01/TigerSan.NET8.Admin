<template>
    <div class="bar-panel flex-center" ref="refRoot" :style="{ width, height, minWidth, minHeight }"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import type { ECharts, EChartsOption } from 'echarts'
import { Texts, Colors, ThemeHelper, loading, OnlineStates, TextModel, SizeBehavior } from '@/0_tigersan_ui/tigerui'
import { assetHelper } from '@/models'
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
let cachedData: Array<{ name: string; count: number }> = []
const behavior = new SizeBehavior()
behavior._onResize = () => chartInstance?.resize()
const { refRoot } = behavior

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
            barBorder: '#1e1e1e',
            splitLine: '#444',
        }
        : {
            text: '#303133',
            subText: '#909399',
            line: '#C0C4CC',
            tooltipBg: 'rgba(255, 255, 255, 0.96)',
            tooltipBorder: '#E4E7ED',
            emptyText: '#909399',
            loadingMask: 'rgba(255, 255, 255, 0.7)',
            barBorder: '#ffffff',
            splitLine: '#E4E7ED',
        }
}

/* ===================== 图表生命周期 ===================== */
function initChart() {
    if (!refRoot.value) return
    chartInstance = echarts.init(refRoot.value, undefined, { renderer: 'canvas' })
    renderChart(cachedData)
}

function disposeChart() {
    chartInstance?.dispose()
    chartInstance = null
}

/* ===================== 数据查询 ===================== */
async function fetchOfflineCounts(): Promise<Array<{ name: string; count: number }>> {
    const companies = CompanyMgtPageModel.AccessibleCompanies.value
    const tasks = companies.map(companyId =>
        assetHelper.GetCount({
            company: companyId,
            onlineState: OnlineStates.Offline
        }).catch(() => 0),
    )
    const counts = await Promise.all(tasks)
    return companies.map((id, index) => ({
        name: CompanyMgtPageModel.selectCompanyGlobal.Items.find(i => i.id === id)?.name ?? '',
        count: counts[index] ?? 0
    }))
}

/* ===================== 渲染图表 ===================== */
function renderChart(data: Array<{ name: string; count: number }>) {
    if (!chartInstance) return
    const tc = getThemeColors()
    const total = data.reduce((sum, item) => sum + item.count, 0)

    const option: EChartsOption = {
        backgroundColor: 'transparent',
        title: {
            text: TextModel.GetText('Asset offline statistics', '资产离线统计'),
            left: 'center',
            top: 14,
            textStyle: { fontSize: 16, fontWeight: 600, color: tc.text },
            subtext: total > 0 ? `${Texts.Count.value}: ${total}` : '',
            subtextStyle: { fontSize: 12, color: tc.subText },
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: tc.tooltipBg,
            borderColor: tc.tooltipBorder,
            borderWidth: 1,
            padding: [10, 14],
            textStyle: { color: tc.text, fontSize: 13 },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '80px',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: data.map(item => item.name),
            axisLabel: {
                color: tc.text,
                fontSize: 12,
                rotate: 0
            },
            axisLine: {
                lineStyle: { color: tc.line }
            },
            axisTick: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            splitLine: {
                lineStyle: { color: tc.splitLine, width: 1, type: 'dashed' }
            },
            axisLabel: {
                color: tc.subText,
                fontSize: 12
            },
            axisLine: { show: false },
            axisTick: { show: false }
        },
        series: [
            {
                name: Texts.Count.value,
                type: 'bar',
                barWidth: '45%',
                data: data.map(item => item.count),
                itemStyle: {
                    color: Colors.Red,
                    borderRadius: [6, 6, 0, 0],
                    borderColor: tc.barBorder,
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'top',
                    color: tc.text,
                    fontSize: 12,
                    fontWeight: 500
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 14,
                        shadowColor: ThemeHelper.IsDark.value ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
                    },
                },
            }
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
        cachedData = await fetchOfflineCounts()
        renderChart(cachedData)
    } catch (err) {
        console.error('[AssetOfflineBarChart] Refresh failed:', err)
        cachedData = []
        renderChart(cachedData)
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
