<template>
    <PageCard>
        <div class="map-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Select :model="model.filter.selectDepartment" />
                        <Select :model="model.filter.selectAssetType" />
                        <Select :model="model.filter.selectTagType" />
                        <Select :model="model.filter.selectIsInFence" />
                    </div>
                    <div class="row-panel">
                        <Select :model="model.filter.selectAssetState" />
                        <Select :model="model.filter.selectOnlineState" />
                        <Select :model="model.filter.selectErrorType" />
                        <Select :model="model.filter.selectIsAuto" />
                        <Select :model="model.filter.selectIsFall" />
                        <Search :model="model.filter.searchRfid" />
                    </div>
                    <div class="row-panel">
                        <Search :model="model.filter.searchName" />
                        <Search :model="model.filter.searchAssetId" />
                        <Search :model="model.filter.searchTagId" />
                        <Search :model="model.filter.searchStationId" />
                    </div>
                </div>
                <div class="button-panel">
                    <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
                </div>
            </div>
            <div class="bottom-panel">
                <TabView :model="model.tabList" />
                <div class="map-panel">
                    <Map :model="model.map" />
                </div>
            </div>
        </div>
    </PageCard>

    <!-- 抽屉 -->
    <Drawer :model="model.drawerState">
        <AssetState v-if="!model.IsStation.value" :asset="model.assetState.Asset.value"
            :tag="model.assetState.Tag.value" :station="model.assetState.Station.value" />
        <RowData v-if="model.IsStation.value" :model="model.station" />
    </Drawer>

    <!-- 弹窗 -->
    <PopWindow :model="assetDetail.pop">
        <TabView :model="assetDetail.tabView" />
    </PopWindow>

    <!-- 弹窗 -->
    <PopWindow :model="stationDetail.pop">
        <TabView :model="stationDetail.tabView" />
    </PopWindow>
</template>

<script lang="ts" setup>
import AssetState from '../../0_Other/AssetDetail/AssetStatePage/AssetState.vue'
import { onMounted, onBeforeUnmount } from 'vue'
import { Drawer, RowData, PageCard, Select, Search, Texts, Map, PopWindow, TabView, TabViewModel } from '@/0_tigersan_ui/tigerui'
import { AssetMapPageModel } from './AssetMapPageModel'
import { assetDetail } from '../AssetLedgerPage/AssetLedgerTable'
import { stationDetail } from '@/pages/BasicSettings/Equipments/BaseStationMgtPage/BaseStationMgtTable'
// 【字段】:
const model = new AssetMapPageModel()

// 【过程】:
onMounted(async () => {
    model.filter.StartWatch()
})

onBeforeUnmount(() => {
    model.filter.StopWatch()
    model.drawerState.Close()
    model.assetList.watchCount.stop()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';

.map-page {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;

    .bottom-panel {
        display: grid;
        grid-template-columns: auto 1fr;
        margin-top: 16px;
    }
}
</style>