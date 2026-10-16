<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <span>设备类型：</span>
                        <Select :model="select.typeSelect" />
                    </div>
                    <div class="row-panel">
                        <span>状态:</span>
                        <Select :model="select.selectState" />
                        <Search :model="select.searchMacAddr" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="form.Refresh">{{ Texts.Refresh.value }}</button>
                        <button @click="form.Add">+ 导入设备</button>
                    </div>
                    <div class="row-panel">
                        <button :disabled="!IsOnlySelected" @click="SetTime">授时</button>
                        <button :disabled="!IsOnlySelected" @click="PowerOff">关机</button>
                        <button :disabled="!IsOnlySelected" @click="OTA_Update">OTA升级</button>
                        <button class="bg-danger" :disabled="!IsOnlySelected" @click="form.Delete">{{ Texts.Delete.value }}</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="envSensorTable"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="pagination" :selectedRowCount="envSensorTable.SelectedRowCount.value">
                    <KeyValue :propName="Texts.Online.value" :propValue="onlineCount" :color="Colors.Success">
                    </KeyValue>
                    <KeyValue :propName="Texts.Offline.value" :propValue="offlineCount" :color="Colors.Danger">
                    </KeyValue>
                </Pagination>
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="form.envSensorForm">
        <FormRow>
            <FormItem :model="form.configMacAddr.ItemModel">
                <input type="text" v-model="form.configMacAddr.Target.value">
            </FormItem>
        </FormRow>
    </PopForm>
</template>

<script lang="ts" setup>
import form from './EnvSensorForm'
import select from './EnvSensorSelect'
import { envSensorTable, pagination, onlineCount, offlineCount } from './EnvSensorTable'
import { Texts, DialogHelper, Table, Select, Search, PageCard, Pagination, PopForm, FormRow, FormItem, KeyValue, Colors } from '@/0_tigersan_ui/tigerui'

// 【字段】:
// 表格:
const { IsOnlySelected } = envSensorTable

// 【方法】:
function PowerOff() {
    DialogHelper.Information('关机')
}

function OTA_Update() {
    DialogHelper.Information('OTA升级')
}

function SetTime() {
    DialogHelper.Information('授时')
}
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>