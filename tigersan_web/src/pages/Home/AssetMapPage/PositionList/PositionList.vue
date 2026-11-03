<template>
    <div class="table-panel flex-column">
        <div class="count-panel">
            <KeyValue :propName="Texts.Count.value" :propValue="model.Count" />
        </div>
        <div class="list-panel" :style="model.listStyle">
            <PositionInfo v-for="a in model.PositionInfoes" :key="a._id" :model="a" />
        </div>
        <div class="pagination-panel">
            <Pagination :model="model.pagination" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import PositionInfo from '@/components/PositionInfo.vue'
import { Texts, Pagination, KeyValue } from '@/0_tigersan_ui/tigerui'
import { PositionListModel } from './PositionListModel'

// 字段:
const { model } = defineProps({
    model: {
        type: PositionListModel,
        default: () => new PositionListModel()
    }
})
</script>

<style lang="less" scoped>
.table-panel {
    min-width: 250px;
    margin-right: 16px;

    .count-panel {
        padding: 5px 10px;
    }

    .list-panel {
        flex-grow: 1;
        overflow: auto;
    }

    .pagination-panel {
        overflow: auto;
    }
}
</style>