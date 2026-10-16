<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Select :model="model.selectCompany" />
                        <Search :model="model.searchPlate" />
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
            <FormItem :model="model.configPlate.ItemModel">
                <input type="text" v-model="model.configPlate.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configCompany.ItemModel">
                <Select :model="model.selectCompanyForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configLogistics.ItemModel">
                <input type="text" v-model="model.configLogistics.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configDriver.ItemModel">
                <input type="text" v-model="model.configDriver.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configPhone.ItemModel">
                <input type="text" v-model="model.configPhone.Target.value">
            </FormItem>
        </FormRow>
    </PopForm>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { Texts, Table, PageCard, Pagination, PopForm, FormRow, FormItem, Select, Search } from '@/0_tigersan_ui/tigerui'
import { VehiclePageModel } from './VehiclePageModel'

const { model } = defineProps({
    model: {
        type: VehiclePageModel,
        default: () => new VehiclePageModel()
    }
})

// 【字段】:
// 表格:
const { IsOnlySelected } = model.table

// 【过程】:
onMounted(() => {
    model.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>