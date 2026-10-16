<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Select :model="form.selectCompany" />
                        <Select :model="form.selectScenario" />
                        <Search :model="form.searchBatchId" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="form.Refresh">{{ Texts.Refresh.value }}</button>
                        <button v-if="!Authorities.BatchMgtPage.IsReadonly.value" @click="form.Add">
                            {{ Texts.Add.value }}</button>
                        <button v-if="!Authorities.BatchMgtPage.IsReadonly.value" class="bg-warning"
                            :disabled="!IsOnlySelected" @click="form.Edit">{{ Texts.Edit.value }}</button>
                        <button v-if="!Authorities.BatchMgtPage.IsReadonly.value" class="bg-danger"
                            :disabled="!IsOnlySelected" @click="form.Delete">{{ Texts.Delete.value }}</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="batchMgtTable"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="form.pagination" :selectedRowCount="batchMgtTable.SelectedRowCount.value" />
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="form.batchForm">
        <FormRow>
            <FormItem :model="form.configCompany.ItemModel">
                <Select :model="form.selectCompanyForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configScenario.ItemModel">
                <Select :model="form.selectScenarioForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configBatchId.ItemModel">
                <input type="text" v-model="form.configBatchId.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configManager.ItemModel">
                <input type="text" v-model="form.configManager.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configPhone.ItemModel">
                <input type="text" v-model="form.configPhone.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configComment.ItemModel">
                <input type="text" v-model="form.configComment.Target.value">
            </FormItem>
        </FormRow>
    </PopForm>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { Authorities } from '@/navs/Authorities'
import { BatchMgtForm } from './BatchMgtForm'
import { batchMgtTable } from './BatchMgtTable'
import { Select, Search, Table, PageCard, Pagination, PopForm, FormRow, FormItem, Texts } from '@/0_tigersan_ui/tigerui'

// 【字段】:
// 表格:
const form = new BatchMgtForm()
const { IsOnlySelected } = batchMgtTable

// 【过程】:
onMounted(() => {
    form.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>