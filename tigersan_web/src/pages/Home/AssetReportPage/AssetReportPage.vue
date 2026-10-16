<template>
    <PageCard>
        <div class="btn-panel flex-left">
            <button class="bg-success" @click="Refresh">{{ Texts.Refresh.value }}</button>
        </div>
        <div class="chart-panel flex-stretch">
            <div class="card">
                <AssetStatePieChart ref="refAssetState" />
            </div>
            <div class="card">
                <AssetOnlineStateChart ref="refAssetOnlineState" />
            </div>
            <div class="card">
                <AssetStateRecordChart ref="refAssetRecord" />
            </div>
            <div class="card">
                <div class="row-panel">
                    <AssetCountPieChart ref="refTravelCount" type="travel" />
                    <AssetCountPieChart ref="refStayCount" type="stay" />
                </div>
            </div>
        </div>
    </PageCard>
</template>

<script lang="ts" setup>
import AssetStatePieChart from './AssetStatePieChart.vue'
import AssetOnlineStateChart from './AssetOnlineStateChart.vue'
import AssetStateRecordChart from './AssetStateRecordChart.vue'
import AssetCountPieChart from './AssetCountPieChart.vue'
import { onMounted, ref } from 'vue'
import { PageCard, Texts } from '@/0_tigersan_ui/tigerui'
import { AssetReportPageModel } from './AssetReportPageModel'

// 【字段】:
const model = new AssetReportPageModel()
const refAssetState = ref<InstanceType<typeof AssetStatePieChart>>()
const refAssetOnlineState = ref<InstanceType<typeof AssetOnlineStateChart>>()
const refAssetRecord = ref<InstanceType<typeof AssetStateRecordChart>>()
const refTravelCount = ref<InstanceType<typeof AssetCountPieChart>>()
const refStayCount = ref<InstanceType<typeof AssetCountPieChart>>()

// 【过程】:
// 表格:
onMounted(() => {
})

function Refresh() {
    refAssetState.value?.Refresh()
    refAssetOnlineState.value?.Refresh()
    refAssetRecord.value?.Refresh()
    refTravelCount.value?.Refresh()
    refStayCount.value?.Refresh()
}
</script>

<style lang="less" scoped>
.chart-panel {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-top: 15px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }

    .card {
        flex: 1;
        padding: 10px;
        min-width: 350px;
        border-radius: 10px;
        background-color: var(--theme-panel-background);
    }
}

.row-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: auto;
}
</style>