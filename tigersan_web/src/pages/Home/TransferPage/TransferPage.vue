<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Search :model="model.searchCode" />
                        <Search :model="model.searchAssetId" />
                    </div>
                    <div class="row-panel">
                        <Select :model="model.selectOrigin" />
                        <Select :model="model.selectTarget" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
                        <button @click="model.Add">{{ Texts.Add.value }}</button>
                        <button class="bg-warning" :disabled="!IsOnlySelected" @click="model.Edit">
                            {{ Texts.Edit.value }}</button>
                        <button class="bg-danger" :disabled="!IsSelected" @click="model.Delete">
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
    <TransferForm :model="model" />
</template>

<script lang="ts" setup>
import TransferForm from './TransferForm.vue'
import { onMounted } from 'vue'
import { Texts, Table, PageCard, Pagination, Select, Search } from '@/0_tigersan_ui/tigerui'
import { TransferPageModel } from './TransferPageModel'

const { model } = defineProps({
    model: {
        type: TransferPageModel,
        default: () => new TransferPageModel()
    }
})

// 【字段】:
// 表格:
const { IsSelected, IsOnlySelected } = model.table

// 【过程】:
onMounted(() => {
    model.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>