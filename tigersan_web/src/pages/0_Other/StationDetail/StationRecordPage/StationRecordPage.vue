<template>
    <div class="table-page">
        <!-- 顶部: -->
        <div class="top-panel flex-between">
            <div class="filter-panel">
                <div class="row-panel">
                    <Select :model="model.selectLocationMode" />
                </div>
            </div>
            <div class="button-panel">
                <div class="row-panel">
                    <button class="bg-success" @click="model.Refresh">
                        {{ Texts.Refresh.value }}
                    </button>
                    <button v-if="!Authorities.BaseStationMgtPage.IsReadonly.value" @click="model.Add">
                        {{ Texts.Add.value }}
                    </button>
                    <button v-if="!Authorities.BaseStationMgtPage.IsReadonly.value" class="bg-warning"
                        :disabled="!IsOnlySelected" @click="model.Edit">
                        {{ Texts.Edit.value }}
                    </button>
                    <button v-if="!Authorities.BaseStationMgtPage.IsReadonly.value" class="bg-danger"
                        :disabled="!IsOnlySelected" @click="model.Delete">
                        {{ Texts.Delete.value }}
                    </button>
                </div>
            </div>
        </div>

        <!-- 表格: -->
        <Table :model="stationRecordTable"></Table>

        <!-- 底部: -->
        <div class="bottom-panel flex-center ">
            <Pagination :model="pagination" :selectedRowCount="stationRecordTable.SelectedRowCount.value" />
        </div>
    </div>

    <!-- 表单: -->
    <PopForm :model="model.stationRecordForm">
        <FormRow>
            <FormItem :model="model.configStation.ItemModel">
                <Select :model="model.selectStationForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configLongitude.ItemModel">
                <input type="text" v-model="model.configLongitude.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configLatitude.ItemModel">
                <input type="text" v-model="model.configLatitude.Target.value">
            </FormItem>
        </FormRow>
    </PopForm>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { Authorities } from '@/navs/Authorities'
import { StationRecordPageModel } from './StationRecordPageModel'
import { stationRecordTable, pagination } from './StationRecordTable'
import { Select, Table, Pagination, PopForm, FormRow, FormItem, Texts } from '@/0_tigersan_ui/tigerui'

const { model } = defineProps({
    model: {
        type: StationRecordPageModel,
        default: () => new StationRecordPageModel()
    }
})

// 【字段】:
// 表格:
const { IsOnlySelected } = stationRecordTable

// 【过程】:
onMounted(() => {
    model.Refresh()
})

onBeforeUnmount(() => {
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