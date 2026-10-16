<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <KeyValue :propName="Texts.Count.value" :propValue="model.Count.value" />
                        <KeyValue :propName="Texts.Select.value" :propValue="SelectedRowCount" />
                        <KeyValue :propName="Texts.Percent.value" :propValue="model.PercentText.value"
                            :isAutoHidden="true" :color="Colors.Warning" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="model.Refresh" :disabled="model.IsProcessing.value">
                            {{ Texts.Refresh.value }}</button>
                        <button class="bg-warning" @click="model.Back" :disabled="!model.IsAllowGoBack.value">
                            {{ Texts.Back.value }}</button>
                        <button @click="model.CreateDir" :disabled="model.IsProcessing.value">
                            {{ Texts.CreateDir.value }}</button>
                        <button @click="model.Upload" :disabled="model.IsProcessing.value">
                            {{ Texts.Upload.value }}</button>
                        <button class="bg-danger" @click="model.Stop" :disabled="!model.IsProcessing.value">
                            {{ Texts.Stop.value }}</button>
                        <button class="bg-warning" @click="model.Rename" :disabled="!model.IsAllowRename.value">
                            {{ Texts.Rename.value }}</button>
                        <button class="bg-danger" @click="model.Delete" :disabled="!model.IsAllowDelete.value">
                            {{ Texts.Delete.value }}</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="model.table"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
            </div>
        </div>
    </PageCard>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { Texts, Table, PageCard, KeyValue, Colors } from '@/0_tigersan_ui/tigerui'
import { FileMgtPageModel } from './FileMgtPageModel'

const { model } = defineProps({
    model: {
        type: FileMgtPageModel,
        default: () => new FileMgtPageModel()
    }
})

// 【字段】:
// 表格:
const { SelectedRowCount } = model.table

// 【过程】:
onMounted(() => {
    model.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>