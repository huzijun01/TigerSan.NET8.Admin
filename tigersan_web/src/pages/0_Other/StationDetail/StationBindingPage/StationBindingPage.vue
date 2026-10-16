<template>
    <div class="table-page">
        <!-- 顶部: -->
        <div class="top-panel flex-between">
            <div class="filter-panel">
                <div class="row-panel">
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
            </div>
        </div>

        <!-- 表格: -->
        <Table :model="model.table"></Table>

        <!-- 底部: -->
        <div class="bottom-panel flex-center ">
            <Pagination :model="model.pagination" :selectedRowCount="model.table.SelectedRowCount.value" />
        </div>

        <!-- 表单: -->
        <PopForm :model="model.form">
            <FormRow>
                <FormItem :model="model.configTagId.ItemModel">
                    <input type="text" v-model="model.configTagId.Target.value">
                </FormItem>
            </FormRow>
            <FormRow>
                <FormItem :model="model.configStationId.ItemModel">
                    <input type="text" v-model="model.configStationId.Target.value">
                </FormItem>
            </FormRow>
        </PopForm>
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { Authorities } from '@/navs/Authorities'
import { StationBindingPageModel } from './StationBindingPageModel'
import { Table, Pagination, PopForm, FormRow, FormItem, Texts } from '@/0_tigersan_ui/tigerui'

// 【字段】:
const { model } = defineProps({
    model: {
        type: StationBindingPageModel,
        default: () => new StationBindingPageModel()
    }
})
const { IsOnlySelected, IsSelected } = model.table

// 【过程】:
onMounted(() => {
    model.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';

.table-page {
    width: 80vw;
    margin-top: 16px;
    min-height: 70vh;
    max-height: calc(80vh - 160px);
}
</style>