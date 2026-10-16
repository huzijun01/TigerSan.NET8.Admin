<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Select :model="form.selectCompany" />
                        <Select :model="form.selectType" />
                        <Search :model="form.searchCode" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="form.Refresh">{{ Texts.Refresh.value }}</button>
                        <button v-if="!Authorities.SiteMgt.IsReadonly.value" @click="form.Add">
                            {{ Texts.Add.value }}</button>
                        <button v-if="!Authorities.SiteMgt.IsReadonly.value" class="bg-warning"
                            :disabled="!IsOnlySelected" @click="form.Edit">{{ Texts.Edit.value }}</button>
                        <button v-if="!Authorities.SiteMgt.IsReadonly.value" class="bg-danger"
                            :disabled="!IsOnlySelected" @click="form.Delete">{{ Texts.Delete.value }}</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="siteMgtTable"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="form.pagination" :selectedRowCount="siteMgtTable.SelectedRowCount.value" />
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="form.form">
        <FormRow>
            <FormItem :model="form.configCompany.ItemModel">
                <Select :model="form.selectCompanyForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configType.ItemModel">
                <Select :model="form.selectTypeForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configCode.ItemModel">
                <input type="text" v-model="form.configCode.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configName.ItemModel">
                <input type="text" v-model="form.configName.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configAddr.ItemModel">
                <input type="text" v-model="form.configAddr.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configAddrDetail.ItemModel">
                <input type="text" v-model="form.configAddrDetail.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configFencePath.ItemModel">
                <input type="text" disabled v-model="form.configFencePath.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configLongitude.ItemModel">
                <input type="text" disabled v-model="form.configLongitude.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configLatitude.ItemModel">
                <input type="text" disabled v-model="form.configLatitude.Target.value">
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
        <template v-slot:right>
            <Map :model="form.map" style="margin-left: 15px;" />
        </template>
    </PopForm>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { siteMgtTable } from './SiteMgtTable'
import { Authorities } from '@/navs/Authorities'
import { SiteMgtPageModel } from './SiteMgtPageModel'
import { Select, Search, Table, PageCard, Pagination, PopForm, FormRow, FormItem, Texts, Map } from '@/0_tigersan_ui/tigerui'

// 【字段】:
const form = new SiteMgtPageModel()
const { IsOnlySelected } = siteMgtTable

// 【过程】:
onMounted(() => {
    form.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>