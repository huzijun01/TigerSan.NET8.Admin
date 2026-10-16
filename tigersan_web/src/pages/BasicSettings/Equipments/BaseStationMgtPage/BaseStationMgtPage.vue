<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Search :model="model.searchMacAddr" />
                        <Select :model="model.selectState" />
                        <Select :model="model.selectIsEnable" />
                        <Select :model="model.selectIsMobile" />
                    </div>
                    <div class="row-panel">
                        <Select :model="model.selectCompany" />
                        <Select :model="model.selectSite" />
                        <Select :model="model.selectType" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
                        <button v-if="!Authorities.BaseStationMgtPage.IsReadonly.value" @click="model.Add">
                            {{ Texts.Add.value }}</button>
                        <button v-if="!Authorities.BaseStationMgtPage.IsReadonly.value" class="bg-warning"
                            :disabled="!IsOnlySelected" @click="model.Edit">{{ Texts.Edit.value }}</button>
                        <button v-if="!Authorities.BaseStationMgtPage.IsReadonly.value" class="bg-danger"
                            :disabled="!IsSelected" @click="model.Delete">{{ Texts.Delete.value }}</button>
                    </div>
                    <div class="row-panel">
                        <Switch v-if="!Authorities.BaseStationMgtPage.IsReadonly.value" :model="model.switchIsEnable" />
                        <button v-if="!Authorities.BaseStationMgtPage.IsReadonly.value" :disabled="!IsOnlySelected"
                            @click="model.Repair">维修</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="model.table"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="model.pagination" :selectedRowCount="model.table.SelectedRowCount.value">
                    <KeyValue :propName="Texts.Online.value" :propValue="model.OnlineCount" :color="Colors.Success">
                    </KeyValue>
                    <KeyValue :propName="Texts.Offline.value" :propValue="model.OfflineCount" :color="Colors.Danger">
                    </KeyValue>
                </Pagination>
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="model.form">
        <FormRow>
            <FormItem :model="model.configCompany.ItemModel">
                <Select :model="model.selectCompanyForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configSite.ItemModel">
                <Select :model="model.selectSiteForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configIsMobile.ItemModel">
                <Select :model="model.selectIsMobileForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configType.ItemModel">
                <Select :model="model.selectTypeForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configName.ItemModel">
                <input type="text" v-model="model.configName.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configMacAddr.ItemModel">
                <input type="text" v-model="model.configMacAddr.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configHeartbeatInterval.ItemModel">
                <input type="text" :placeholder="Texts.Seconds.value"
                    v-model="model.configHeartbeatInterval.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configReportInterval.ItemModel">
                <input type="text" :placeholder="Texts.Seconds.value" v-model="model.configReportInterval.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configLongitude.ItemModel">
                <input type="text" disabled v-model="model.configLongitude.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configLatitude.ItemModel">
                <input type="text" disabled v-model="model.configLatitude.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configImage.ItemModel">
                <Upload :model="model.upload" />
            </FormItem>
        </FormRow>
        <template v-slot:right>
            <Map :model="model.map" style="margin-left: 15px;" />
        </template>
    </PopForm>

    <AssetForm :form="model.assetForm" />

    <!-- 弹窗 -->
    <PopWindow :model="stationDetail.pop">
        <TabView :model="stationDetail.tabView" />
    </PopWindow>
</template>

<script lang="ts" setup>
import AssetForm from '@/pages/Home/AssetLedgerPage/AssetForm.vue'
import { onMounted } from 'vue'
import { Authorities } from '@/navs/Authorities'
import { stationDetail } from './BaseStationMgtTable'
import { BaseStationMgtPageModel } from './BaseStationMgtPageModel'
import { Map, Texts, Table, Select, Switch, Search, TabView, PageCard, Pagination, PopWindow, PopForm, FormRow, FormItem, KeyValue, Colors, Upload } from '@/0_tigersan_ui/tigerui'

// 【字段】:
const model = new BaseStationMgtPageModel()
const { IsSelected, IsOnlySelected } = model.table

// 【过程】:
onMounted(() => {
    model.Refresh()
})
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>