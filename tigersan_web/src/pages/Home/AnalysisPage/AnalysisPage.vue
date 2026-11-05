<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="analysisTable"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="model.pagination" :selectedRowCount="analysisTable.SelectedRowCount.value" />
            </div>
        </div>
    </PageCard>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { analysisTable } from './AnalysisTable'
import { AnalysisPageModel } from './AnalysisPageModel'
import { Table, PageCard, Pagination, Texts } from '@/0_tigersan_ui/tigerui'

// 【字段】:
const model = new AnalysisPageModel()
const { IsOnlySelected } = analysisTable

// 【过程】:
onMounted(() => {
    model.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>