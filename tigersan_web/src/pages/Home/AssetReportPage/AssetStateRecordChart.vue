<template>
    <div class="asset-state-trend-panel flex-center" ref="refRoot" :style="{ width, height, minWidth, minHeight }">
    </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import type { ECharts, EChartsOption, SeriesOption } from 'echarts'
import { assetStateRecordHelper, AssetStates, AssetStateRecordDto } from '@/models'
import { Texts, Colors, ThemeHelper, loading, TextModel, ObjectHelper, SizeBehavior } from '@/0_tigersan_ui/tigerui'
import { CompanyMgtPageModel } from '@/pages/BasicSettings/BasicSettings/CompanyMgtPage/CompanyMgtPageModel'

/* ===================== Props（与饼图接口完全对齐） ===================== */
const props = withDefaults(defineProps<{
    width?: string
    height?: string
    minWidth?: string
    minHeight?: string
    companies?: bigint[]
}>(), {
    width: '100%',
    height: '100%',
    minHeight: '300px',
})

/* ===================== 实例引用 ===================== */
let chartInstance: ECharts | null = null
/** 缓存查询结果，主题切换时无需重复请求 */
let cachedRecords: AssetStateRecordDto[] = []
const behavior = new SizeBehavior()
behavior._onResize = () => chartInstance?.resize()
const { refRoot } = behavior

/* ===================== 状态配置（与饼图完全一致，保持颜色和名称统一） ===================== */
const STATE_CONFIGS = computed(() => [
    { name: Texts.NoRecord.value, color: Colors.Blue, state: AssetStates.NoRecord, countField: 'noRecord', percField: 'noRecordPerc' },
    { name: Texts.Inbound.value, color: Colors.Yellow, state: AssetStates.Inbound, countField: 'inbound', percField: 'inboundPerc' },
    { name: Texts.InStore.value, color: Colors.Green, state: AssetStates.InStore, countField: 'inStore', percField: 'inStorePerc' },
    { name: Texts.Stolid.value, color: Colors.Orange, state: AssetStates.Stolid, countField: 'stolid', percField: 'stolidPerc' },
    { name: Texts.Outbound.value, color: Colors.Info, state: AssetStates.Outbound, countField: 'outbound', percField: 'outboundPerc' },
    { name: Texts.InTransit.value, color: Colors.Brand, state: AssetStates.InTransit, countField: 'inTransit', percField: 'inTransitPerc' },
    { name: Texts.Timeout.value, color: Colors.Red, state: AssetStates.Timeout, countField: 'timeout', percField: 'timeoutPerc' },
])

/* ===================== 主题颜色（与饼图色系一致，补充坐标轴/网格线配色） ===================== */
function getThemeColors() {
    return ThemeHelper.IsDark.value
        ? {
            text: '#E5EAF3',
            subText: '#A3A6AD',
            line: '#5A5C5F',
            axisLine: '#5A5C5F',
            axisText: '#A3A6AD',
            splitLine: '#3A3C3F',
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
            axisLine: '#C0C4CC',
            axisText: '#909399',
            splitLine: '#EBEEF5',
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
    // 修复初始化时容器宽高为0的问题，初始化前先强制重排
    refRoot.value.style.display = 'block'
    chartInstance = echarts.init(refRoot.value, undefined, { renderer: 'canvas' })
    renderChart(cachedRecords)
}

function disposeChart() {
    chartInstance?.dispose()
    chartInstance = null
}

/* ===================== 数据查询 ===================== */
async function fetchRecords(): Promise<AssetStateRecordDto[]> {
    // 优先使用外部传入公司列表，默认取全局可访问公司
    const targetCompanies = props.companies?.length ? props.companies : CompanyMgtPageModel.AccessibleCompanies.value
    const res = await assetStateRecordHelper.GetSumFullList(targetCompanies)
    if (!res.data) {
        console.error(res.message)
        return []
    }
    return res.data
}

/* ===================== 渲染核心 ===================== */
function renderChart(records: AssetStateRecordDto[]) {
    if (!chartInstance) return
    const tc = getThemeColors()

    // 按时间升序排序，保证趋势从左到右递增
    const sortedRecords = [...records].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    const xAxisData = sortedRecords.map(r => ObjectHelper.GetDateString(r.time, true, false))

    // 计算有效数据量（用数量判断是否为空）
    const totalValidCount = sortedRecords.reduce((sum, r) => {
        return sum + STATE_CONFIGS.value.reduce((s, cfg) => s + ((r[cfg.countField as keyof AssetStateRecordDto] as number) ?? 0), 0)
    }, 0)

    // 生成多折线系列数据 —— 使用数量字段，对应左侧Y轴（yAxisIndex: 0）
    const seriesData: SeriesOption[] = STATE_CONFIGS.value.map(cfg => ({
        name: cfg.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        yAxisIndex: 0, // 对应左侧数量Y轴
        lineStyle: {
            width: 2,
            color: cfg.color,
        },
        itemStyle: {
            color: cfg.color,
            borderColor: tc.itemBorder,
            borderWidth: 2,
        },
        // 完全删除填充样式，仅保留纯折线
        areaStyle: undefined,
        emphasis: {
            focus: 'series',
            scale: true,
            itemStyle: {
                shadowBlur: 10,
                shadowColor: ThemeHelper.IsDark.value ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
            },
        },
        data: sortedRecords.map(r => (r[cfg.countField as keyof AssetStateRecordDto] as number) ?? 0),
    }))

    // 副标题展示统计时间范围
    const subTitle = xAxisData.length > 0 ? `${xAxisData[0]} ~ ${xAxisData[xAxisData.length - 1]}` : ''

    // 构建百分比数据Map，用于tooltip中快速查找精确百分比
    const percDataMap = new Map<string, number[]>() // time -> [各状态百分比]
    sortedRecords.forEach((r, idx) => {
        percDataMap.set(xAxisData[idx] as string, STATE_CONFIGS.value.map(cfg => (r[cfg.percField as keyof AssetStateRecordDto] as number) ?? 0))
    })

    const option: EChartsOption = {
        backgroundColor: 'transparent',
        title: {
            text: TextModel.GetText('Asset status trend', '资产状态趋势'),
            left: 'center',
            top: 14,
            textStyle: { fontSize: 16, fontWeight: 600, color: tc.text },
            subtext: totalValidCount > 0 ? subTitle : '',
            subtextStyle: { fontSize: 12, color: tc.subText },
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: tc.tooltipBg,
            borderColor: tc.tooltipBorder,
            borderWidth: 1,
            padding: [10, 14],
            textStyle: { color: tc.text, fontSize: 13 },
            axisPointer: {
                type: 'cross',
                crossStyle: { color: tc.line },
                lineStyle: { color: tc.line, type: 'dashed' },
            },
            formatter: (params: any) => {
                if (!Array.isArray(params) || params.length === 0) return ''
                const timeStr = params[0].axisValue
                const percArr = percDataMap.get(timeStr) || []

                let html = `<div style="font-weight:600;margin-bottom:8px;font-size:14px;">${timeStr}</div>`
                params.forEach((p: any, idx: number) => {
                    const countVal = p.value ?? 0
                    const percVal = percArr[idx] ?? 0
                    html += `
                        <div style="line-height:1.9;display:flex;align-items:center;">
                            <span style="display:inline-block;width:10px;height:2px;background:${p.color};margin-right:8px;"></span>
                            <span style="flex:1;margin-right:12px;">${p.seriesName}</span>
                            <span style="text-align:right;min-width:60px;">
                                <b style="color:${p.color}">${countVal.toLocaleString()}</b>
                                <span style="color:${tc.subText};font-size:12px;margin-left:4px;">(${percVal.toFixed(2)}%)</span>
                            </span>
                        </div>
                    `
                })
                return html
            },
        },
        legend: {
            orient: 'horizontal',
            left: 'center',
            bottom: 16,
            itemWidth: 10, // 方块的宽度
            itemHeight: 10, // 方块的高度
            itemGap: 16,
            icon: 'rect', // 设置为方形图标
            textStyle: { color: tc.text, fontSize: 12 },
            tooltip: { show: true }
        },
        color: STATE_CONFIGS.value.map(c => c.color),
        grid: {
            left: 50,
            right: 60, // 增大右侧边距，容纳右侧百分比Y轴标签
            top: 70,
            bottom: 60,
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xAxisData,
            axisLine: { lineStyle: { color: tc.axisLine } },
            axisLabel: {
                color: tc.axisText,
                fontSize: 12,
                margin: 10,
                showMaxLabel: true // 强制显示最后一个类目标签，避免ECharts自动隐藏
            },
            axisTick: { show: false },
        },
        yAxis: [
            // ===== 左侧Y轴：数量 =====
            {
                type: 'value',
                name: Texts.Count.value,
                min: 0,
                position: 'left',
                nameTextStyle: { color: tc.subText, fontSize: 12, padding: [0, 0, 0, 10] },
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: tc.axisText, fontSize: 12 },
                splitLine: { lineStyle: { color: tc.splitLine, type: 'dashed' } },
            },
            // ===== 右侧Y轴：百分比 =====
            {
                type: 'value',
                name: Texts.Percent.value + '(%)',
                min: 0,
                max: 100,
                position: 'right',
                nameTextStyle: { color: tc.subText, fontSize: 12, padding: [0, 10, 0, 0] },
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: tc.axisText, fontSize: 12, formatter: '{value}%' },
                splitLine: { show: false }, // 右侧不显示分隔线，避免与左侧重叠
            },
        ],
        series: totalValidCount > 0 ? seriesData : [],
        // 空状态提示，与饼图完全一致
        graphic: totalValidCount === 0
            ? [
                {
                    type: 'group',
                    left: 'center',
                    top: 'middle',
                    children: [
                        {
                            type: 'text',
                            style: { text: Texts.NoContent.value, fontSize: 14, fill: tc.emptyText },
                        },
                    ],
                },
            ]
            : [],
    }

    chartInstance.resize()
    chartInstance.setOption(option, true)
}

/* ===================== 对外暴露刷新方法（与饼图一致） ===================== */
async function Refresh() {
    loading.IsShow.value = true
    try {
        cachedRecords = await fetchRecords()
        // 数据返回后强制resize一次，彻底解决容器尺寸未就绪问题
        nextTick(() => {
            chartInstance?.resize()
            renderChart(cachedRecords)
        })
    } catch (err) {
        console.error('[AssetStatePercTrendChart] Refresh failed:', err)
        cachedRecords = []
        renderChart(cachedRecords)
    } finally {
        loading.IsShow.value = false
    }
}

defineExpose({ Refresh })

/* ===================== 生命周期钩子 ===================== */
onMounted(async () => {
    behavior.Observe()
    await nextTick()
    initChart()
    Refresh()
})

onBeforeUnmount(() => {
    behavior.Unobserver()
    disposeChart()
})

/* ===================== 响应式监听 ===================== */
// 容器尺寸变化自动适配
watch(
    () => [props.width, props.height],
    () => nextTick(() => chartInstance?.resize()),
)

// 监听传入的companies参数，自动刷新数据
watch(
    () => props.companies,
    () => Refresh(),
    { deep: true }
)

// 主题切换复用缓存数据，无感知重绘
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
