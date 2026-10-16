<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Select :model="model.selectSite" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
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
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { Texts, Table, PageCard, Pagination, Select } from '@/0_tigersan_ui/tigerui'
import { InventoryRecordPageModel } from './InventoryRecordPageModel'

const { model } = defineProps({
    model: {
        type: InventoryRecordPageModel,
        default: () => new InventoryRecordPageModel()
    }
})

// 【字段】:
// 表格:
const { IsOnlySelected } = model.table

// 【过程】:
onMounted(() => {
    model.Refresh()
    model.watchAccessibleCompanies.Start()
})

onBeforeUnmount(() => {
    model.watchAccessibleCompanies.Stop()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>