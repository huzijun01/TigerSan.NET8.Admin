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
                        <span>蓝牙固件:</span>
                        <Select :model="select.bluetoothFirmwareSelect" />
                        <Search :model="select.searchIMEI" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="form.Refresh">{{ Texts.Refresh.value }}</button>
                        <button @click="form.Add">+ 导入设备</button>
                    </div>
                    <div class="row-panel">
                        <button :disabled="!IsOnlySelected" @click="Restart">重启</button>
                        <button v-if="!Authorities.PersonMgtTagPage.IsReadonly.value" class="bg-warning"
                            :disabled="!IsOnlySelected" @click="form.Edit">{{ Texts.Edit.value }}</button>
                        <button v-if="!Authorities.PersonMgtTagPage.IsReadonly.value" class="bg-danger"
                            :disabled="!IsOnlySelected" @click="form.Delete">{{ Texts.Delete.value }}</button>
                        <button v-if="!Authorities.PersonMgtTagPage.IsReadonly.value" :disabled="!IsOnlySelected"
                            @click="SetParams">修改参数</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="personMgtTagTable"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="pagination" :selectedRowCount="personMgtTagTable.SelectedRowCount.value">
                    <KeyValue :propName="Texts.Online.value" :propValue="onlineCount" :color="Colors.Success">
                    </KeyValue>
                    <KeyValue :propName="Texts.Offline.value" :propValue="offlineCount" :color="Colors.Danger">
                    </KeyValue>
                </Pagination>
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="form.personMgtTagForm">
        <FormRow>
            <FormItem :model="form.configIMEI.ItemModel">
                <input type="text" v-model="form.configIMEI.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configEqpName.ItemModel">
                <input type="text" v-model="form.configEqpName.Target.value">
            </FormItem>
        </FormRow>
    </PopForm>
</template>

<script lang="ts" setup>
import { PersonMgtTagForm } from './PersonMgtTagForm'
import select from './PersonMgtTagSelect'
import { Authorities } from '@/navs/Authorities'
import { personMgtTagTable, pagination, onlineCount, offlineCount } from './PersonMgtTagTable'
import { Texts, DialogHelper, Table, Select, Search, PageCard, Pagination, PopForm, FormRow, FormItem, KeyValue, Colors } from '@/0_tigersan_ui/tigerui'

// 【字段】:
const form = new PersonMgtTagForm()
// 表格:
const { IsOnlySelected } = personMgtTagTable

// 【方法】:
function SetParams() {
    DialogHelper.Information('修改参数')
}

function Restart() {
    DialogHelper.Information('重启')
}
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>