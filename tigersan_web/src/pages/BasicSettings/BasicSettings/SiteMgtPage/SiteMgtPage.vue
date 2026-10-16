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
                        <button v-if="!Authorities.SiteMgt.IsReadonly.value" @click="model.Add">
                            {{ Texts.Add.value }}</button>
                        <button v-if="!Authorities.SiteMgt.IsReadonly.value" class="bg-warning"
                            :disabled="!IsOnlySelected" @click="model.Edit">{{ Texts.Edit.value }}</button>
                        <button v-if="!Authorities.SiteMgt.IsReadonly.value" class="bg-danger"
                            :disabled="!IsOnlySelected" @click="model.Delete">{{ Texts.Delete.value }}</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="siteMgtTable"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="model.pagination" :selectedRowCount="siteMgtTable.SelectedRowCount.value" />
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="model.form">
        <FormRow>
            <FormItem :model="model.configCompany.ItemModel">
                <Select :model="model.selectCompanyForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configType.ItemModel">
                <Select :model="model.selectTypeForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configCode.ItemModel">
                <input type="text" v-model="model.configCode.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configName.ItemModel">
                <input type="text" v-model="model.configName.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configAddr.ItemModel">
                <input type="text" v-model="model.configAddr.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configAddrDetail.ItemModel">
                <input type="text" v-model="model.configAddrDetail.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configFencePath.ItemModel">
                <input type="text" disabled v-model="model.configFencePath.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configLongitude.ItemModel">
                <input type="text" disabled v-model="model.configLongitude.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configLatitude.ItemModel">
                <input type="text" disabled v-model="model.configLatitude.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configManager.ItemModel">
                <input type="text" v-model="model.configManager.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configPhone.ItemModel">
                <input type="text" v-model="model.configPhone.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configComment.ItemModel">
                <input type="text" v-model="model.configComment.Target.value">
            </FormItem>
        </FormRow>
        <template v-slot:right>
            <Map :model="model.map" style="margin-left: 15px;" />
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
const model = new SiteMgtPageModel()
const { IsOnlySelected } = siteMgtTable

// 【过程】:
onMounted(() => {
    model.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';
</style>