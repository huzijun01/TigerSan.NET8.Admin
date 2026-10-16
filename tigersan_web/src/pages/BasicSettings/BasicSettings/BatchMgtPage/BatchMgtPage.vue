<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Select :model="model.selectCompany" />
                        <Select :model="model.selectScenario" />
                        <Search :model="model.searchBatchId" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
                        <button v-if="!Authorities.BatchMgtPage.IsReadonly.value" @click="model.Add">
                            {{ Texts.Add.value }}</button>
                        <button v-if="!Authorities.BatchMgtPage.IsReadonly.value" class="bg-warning"
                            :disabled="!IsOnlySelected" @click="model.Edit">{{ Texts.Edit.value }}</button>
                        <button v-if="!Authorities.BatchMgtPage.IsReadonly.value" class="bg-danger"
                            :disabled="!IsOnlySelected" @click="model.Delete">{{ Texts.Delete.value }}</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="batchMgtTable"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="model.pagination" :selectedRowCount="batchMgtTable.SelectedRowCount.value" />
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="model.batchForm">
        <FormRow>
            <FormItem :model="model.configCompany.ItemModel">
                <Select :model="model.selectCompanyForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configScenario.ItemModel">
                <Select :model="model.selectScenarioForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configBatchId.ItemModel">
                <input type="text" v-model="model.configBatchId.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configManager.ItemModel">
                <input type="text" v-model="model.configManager.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configPhone.ItemModel">
                <input type="text" v-model="model.configPhone.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configComment.ItemModel">
                <input type="text" v-model="model.configComment.Target.value">
            </FormItem>
        </FormRow>
    </PopForm>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { Authorities } from '@/navs/Authorities'
import { BatchMgtPageModel } from './BatchMgtPageModel'
import { batchMgtTable } from './BatchMgtTable'
import { Select, Search, Table, PageCard, Pagination, PopForm, FormRow, FormItem, Texts } from '@/0_tigersan_ui/tigerui'

// 【字段】:
// 表格:
const model = new BatchMgtPageModel()
const { IsOnlySelected } = batchMgtTable

// 【过程】:
onMounted(() => {
    model.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>