<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Select :model="model.selectCompany" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
                        <button v-if="!Authorities.DepartmentMgtPage.IsReadonly.value" @click="model.Add">
                            {{ Texts.Add.value }}</button>
                        <button v-if="!Authorities.DepartmentMgtPage.IsReadonly.value" class="bg-warning"
                            :disabled="!IsOnlySelected" @click="model.Edit">{{ Texts.Edit.value }}</button>
                        <button v-if="!Authorities.DepartmentMgtPage.IsReadonly.value" class="bg-danger"
                            :disabled="!IsOnlySelected" @click="model.Delete">{{ Texts.Delete.value }}</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="departmentMgtTable"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="model.pagination" :selectedRowCount="departmentMgtTable.SelectedRowCount.value" />
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="model.departmentForm">
        <FormRow>
            <FormItem :model="model.configCompany.ItemModel">
                <Select :model="model.selectCompanyForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configName.ItemModel">
                <input type="text" v-model="model.configName.Target.value">
            </FormItem>
        </FormRow>
    </PopForm>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { Authorities } from '@/navs/Authorities'
import { departmentMgtTable } from './DepartmentMgtTable'
import { DepartmentMgtPageModel } from './DepartmentMgtPageModel'
import { Select, Table, PageCard, Pagination, PopForm, FormRow, FormItem, Texts } from '@/0_tigersan_ui/tigerui'

// 【字段】:
const model = new DepartmentMgtPageModel()
const { IsOnlySelected } = departmentMgtTable

// 【过程】:
onMounted(() => {
    model.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>