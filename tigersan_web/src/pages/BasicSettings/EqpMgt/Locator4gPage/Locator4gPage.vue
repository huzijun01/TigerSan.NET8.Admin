<template>
    <PageCard>
        <div class="table-page">
            <!-- 顶部: -->
            <div class="top-panel flex-between">
                <div class="filter-panel">
                    <div class="row-panel">
                        <Select :model="model.selectCompany" />
                        <Select :model="model.selectOnlineState" />
                        <Select :model="model.selectIsEnable" />
                        <Select :model="model.selectIsFall" />
                        <Select :model="model.selectIsBound" />
                    </div>
                    <div class="row-panel">
                        <Search :model="model.searchTagId" />
                        <Search :model="model.searchStationId" />
                        <Search :model="model.searchRfid" />
                    </div>
                    <div class="row-panel">
                        <Select :model="model.selectBatch" />
                        <Select :model="model.selectStation" />
                        <Select :model="model.selectTagType" />
                    </div>
                </div>
                <div class="button-panel">
                    <div class="row-panel">
                        <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
                        <button v-if="!Authorities.TagMgtPage.IsReadonly.value" @click="model.Add">
                            {{ Texts.Add.value }}
                        </button>
                        <button v-if="!Authorities.TagMgtPage.IsReadonly.value" class="bg-warning"
                            :disabled="!IsOnlySelected" @click="model.Edit">{{ Texts.Edit.value }}</button>
                        <button v-if="!Authorities.TagMgtPage.IsReadonly.value" class="bg-danger"
                            :disabled="!IsSelected" @click="model.Delete">{{ Texts.Delete.value }}</button>
                    </div>
                    <div class="row-panel">
                        <Switch :model="model.switchIsEnable"></Switch>
                        <button :disabled="!model.IsAllowBinding.value" @click="model.Binding">
                            {{ Texts.Binding.value }}</button>
                        <button :disabled="!IsOnlySelected" @click="model.Repair">{{ Texts.Repair.value }}</button>
                    </div>
                    <div class="row-panel">
                        <button @click="model.ExportCsv">CSV</button>
                        <button @click="model.ExportXlsx">XLSX</button>
                    </div>
                </div>
            </div>

            <!-- 表格: -->
            <Table :model="model.table"></Table>

            <!-- 底部: -->
            <div class="bottom-panel flex-center ">
                <Pagination :model="model.pagination" :selectedRowCount="model.table.SelectedRowCount.value">
                    <KeyValue :propName="Texts.Online.value" :propValue="model.OnlineCount" :color="Colors.Success">
                    </KeyValue>
                    <KeyValue :propName="Texts.Offline.value" :propValue="model.OfflineCount" :color="Colors.Danger">
                    </KeyValue>
                </Pagination>
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="model.form">
        <FormRow>
            <FormItem :model="model.configBatch.ItemModel">
                <Select :model="model.selectBatchForm" />
            </FormItem>
            <FormItem :model="model.configType.ItemModel">
                <Select :model="model.selectTagTypeForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configAssetId.ItemModel">
                <input type="text" v-model="model.configAssetId.Target.value">
            </FormItem>
            <FormItem :model="model.configStationId.ItemModel">
                <input type="text" v-model="model.configStationId.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configRFID.ItemModel">
                <input type="text" v-model="model.configRFID.Target.value">
            </FormItem>
            <FormItem :model="model.configComment.ItemModel">
                <input type="text" v-model="model.configComment.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configImage.ItemModel">
                <Upload :model="model.upload" />
            </FormItem>
            <FormItem :model="model.configTagId.ItemModel" v-if="model.IsEdit.value">
                <input type="text" v-model="model.configTagId.Target.value">
            </FormItem>
            <FormItem :model="model.configTagId.ItemModel" v-if="!model.IsEdit.value">
                <textarea v-model="model.configTagId.Target.value" :placeholder="Texts.SeparatedByNewlines.value">
                </textarea>
            </FormItem>
        </FormRow>
    </PopForm>

    <AssetForm :form="model.assetForm" />
</template>

<script lang="ts" setup>
import AssetForm from '@/pages/Home/AssetLedgerPage/AssetForm.vue'
import { onMounted } from 'vue'
import { Texts, Table, Select, Switch, Search, PageCard, Pagination, PopForm, FormRow, FormItem, KeyValue, Colors, Upload } from '@/0_tigersan_ui/tigerui'
import { EqpTypes } from '@/models'
import { Authorities } from '@/navs/Authorities'
import { TagMgtPageModel } from '../../Equipments/TagMgt/TagMgtPage/TagMgtPageModel'

// 【字段】:
const model = new TagMgtPageModel(EqpTypes.Locator)
const { IsSelected, IsOnlySelected } = model.table

// 【过程】:
onMounted(() => {
    model.Refresh()
})
</script>

<style lang="less" scoped>
@import '@/assets/page.less';

textarea {
    height: 150px;
}
</style>