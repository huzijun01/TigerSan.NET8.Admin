<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Select :model="model.selectCompany" />
                        <Select :model="model.selectDepartment" />
                        <Select :model="model.selectRole" />
                        <Search :model="model.searchName" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
                        <button v-if="!Authorities.PersonMgtPage.IsReadonly.value" @click="model.Add">
                            {{ Texts.Add.value }}</button>
                        <button v-if="!Authorities.PersonMgtPage.IsReadonly.value" class="bg-warning"
                            :disabled="!IsOnlySelected" @click="model.Edit">{{ Texts.Edit.value }}</button>
                        <button v-if="!Authorities.PersonMgtPage.IsReadonly.value" class="bg-danger"
                            :disabled="!IsOnlySelected" @click="model.Delete">{{ Texts.Delete.value }}</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="personMgtTable"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="model.pagination" :selectedRowCount="personMgtTable.SelectedRowCount.value" />
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="model.personForm">
        <FormRow>
            <FormItem :model="model.configCompany.ItemModel">
                <Select :model="model.selectCompanyForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configDepartment.ItemModel">
                <Select :model="model.selectDepartmentForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configRole.ItemModel">
                <Select :model="model.selectRoleForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configUsername.ItemModel">
                <input type="text" v-model="model.configUsername.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configTagId.ItemModel">
                <input type="text" v-model="model.configTagId.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configPassword.ItemModel">
                <Password :model="model.password"></Password>
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configPhone.ItemModel">
                <input type="text" v-model="model.configPhone.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configMail.ItemModel">
                <input type="text" v-model="model.configMail.Target.value">
            </FormItem>
        </FormRow>
    </PopForm>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { Authorities } from '@/navs/Authorities'
import { PersonMgtPageModel } from './PersonMgtPageModel'
import { personMgtTable } from './PersonMgtTable'
import { Select, Search, Table, PageCard, Pagination, PopForm, FormRow, FormItem, Password, Texts } from '@/0_tigersan_ui/tigerui'

// 【字段】:
const model = new PersonMgtPageModel()
const { IsOnlySelected } = personMgtTable

// 【过程】:
onMounted(() => {
    model.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>