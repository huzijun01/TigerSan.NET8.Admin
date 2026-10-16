<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Select :model="model.filter.selectDepartment" />
                        <Select :model="model.filter.selectAssetType" />
                        <Select :model="model.filter.selectTagType" />
                        <Select :model="model.filter.selectIsInFence" />
                        <Select :model="selectColumnFilter" />
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
                    <div class="row-panel">
                        <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
                        <button v-if="!Authorities.AssetLedgerPage.IsReadonly.value" @click="model.Add">
                            {{ Texts.Add.value }}</button>
                        <button v-if="!Authorities.AssetLedgerPage.IsReadonly.value" class="bg-warning"
                            :disabled="!IsOnlySelected" @click="model.Edit">{{ Texts.Edit.value }}</button>
                        <button v-if="!Authorities.AssetLedgerPage.IsReadonly.value" class="bg-danger"
                            :disabled="!IsSelected" @click="model.Delete">{{ Texts.Delete.value }}</button>
                    </div>
                    <div class="row-panel">
                        <button :disabled="!IsAllowTransfer" @click="model.Transfer">{{ Texts.Transfer.value }}</button>
                        <button :disabled="!IsAllowInbound" @click="model.Inbound">{{ Texts.Inbound.value }}</button>
                        <button class="bg-info" :disabled="!IsAllowOutbound" @click="model.Outbound">
                            {{ Texts.Outbound.value }}</button>
                    </div>
                    <div class="row-panel">
                        <button @click="model.ExportCsv">CSV</button>
                        <button @click="model.ExportXlsx">XLSX</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="assetLedgerTable"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="pagination" :selectedRowCount="assetLedgerTable.SelectedRowCount.value" />
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <AssetForm :form="model" />

    <!-- 表单（调拨）: -->
    <TransferForm :model="model.transferPage" />

    <!-- 表单（出库）: -->
    <PopForm :model="model.assetOutbundForm">
        <FormRow>
            <FormItem :model="model.configOutboundCompany.ItemModel">
                <Select :model="model.selectCompanyOutboundForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configSite.ItemModel">
                <Select :model="model.selectSiteOutboundForm" />
            </FormItem>
        </FormRow>
    </PopForm>

    <!-- 弹窗 -->
    <PopWindow :model="assetDetail.pop">
        <TabView :model="assetDetail.tabView" />
    </PopWindow>
    <PopWindow :model="tagDetail">
        <RowData :model="tag" />
    </PopWindow>
    <PopWindow :model="stationDetail.pop">
        <TabView :model="stationDetail.tabView" />
    </PopWindow>
    <PopWindow :model="transferDetail">
        <RowData :model="transfer" />
    </PopWindow>
    <PopWindow :model="vehicleDetail">
        <RowData :model="vehicle" />
    </PopWindow>
</template>

<script lang="ts" setup>
import AssetForm from './AssetForm.vue'
import TransferForm from '../TransferPage/TransferForm.vue'
import { onMounted, onBeforeUnmount } from 'vue'
import { Select, Search, Table, PageCard, Pagination, PopForm, FormRow, FormItem, PopWindow, Texts, TabView, RowData } from '@/0_tigersan_ui/tigerui'
import { Authorities } from '@/navs/Authorities'
import { AssetLedgerPageModel } from './AssetLedgerPageModel'
import { tag, vehicle, assetLedgerTable, selectColumnFilter, pagination, assetDetail, tagDetail, stationDetail, vehicleDetail, IsAllowTransfer, IsAllowInbound, IsAllowOutbound, transferDetail, transfer } from './AssetLedgerTable'
// 【字段】:
const model = new AssetLedgerPageModel()
const { IsOnlySelected, IsSelected } = assetLedgerTable

// 【过程】:
onMounted(() => {
    model.Refresh()
    model.filter.StartWatch()
})

onBeforeUnmount(() => {
    model.filter.StopWatch()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>