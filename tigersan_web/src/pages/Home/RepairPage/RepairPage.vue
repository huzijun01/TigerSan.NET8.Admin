<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Select :model="model.selectCompany" />
                        <Select :model="model.selectType" />
                        <Search :model="model.searchCode" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
                        <button @click="model.Add">{{ Texts.Add.value }}</button>
                        <button class="bg-warning" :disabled="!IsOnlySelected" @click="model.Edit">
                            {{ Texts.Edit.value }}</button>
                        <button class="bg-danger" :disabled="!IsOnlySelected" @click="model.Delete">
                            {{ Texts.Delete.value }}</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="model.table"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="model.pagination" :selectedRowCount="model.table.SelectedRowCount.value" />
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="model.form">
        <FormRow>
            <FormItem :model="model.configAssetId.ItemModel">
                <input type="text" v-model="model.configAssetId.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configType.ItemModel">
                <Select :model="model.selectTypeForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configCost.ItemModel">
                <input type="text" v-model="model.configCost.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configCode.ItemModel">
                <input type="text" v-model="model.configCode.Target.value">
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
import { Texts, Table, PageCard, Pagination, PopForm, FormRow, FormItem, Select, Search } from '@/0_tigersan_ui/tigerui'
import { RepairPageModel } from './RepairPageModel'

const { model } = defineProps({
    model: {
        type: RepairPageModel,
        default: () => new RepairPageModel()
    }
})

// 【字段】:
// 表格:
const { IsOnlySelected } = model.table

// 【过程】:
onMounted(() => {
    // model.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>