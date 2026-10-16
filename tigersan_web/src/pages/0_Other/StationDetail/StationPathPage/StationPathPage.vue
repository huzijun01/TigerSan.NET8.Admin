<template>
    <div class="map-page">
        <!-- 顶部: -->
        <div class="top-panel flex-between">
            <div class="filter-panel">
                <div class="row-panel">
                    <DatePicker :model="model.date"></DatePicker>
                    <Select :model="model.selectLocationMode" />
                </div>
            </div>
            <div class="button-panel">
                <div class="row-panel">
                    <button class="bg-success" @click="model.Refresh(true)">
                        {{ Texts.Refresh.value }}
                    </button>
                </div>
            </div>
        </div>
        <div class="bottom-panel">
            <div class="table-panel flex-column">
                <div class="count-panel">
                    <KeyValue :propName="Texts.Count.value" :propValue="model.Count" />
                </div>
                <div class="list-panel">
                    <PositionInfo v-for="a in model.StationInfoes" :key="a._id" :model="a" />
                </div>
                <div class="pagination-panel">
                    <Pagination :model="model.pagination" />
                </div>
            </div>
            <div class="map-panel">
                <Map :model="model.map" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import PositionInfo from '@/components/PositionInfo.vue'
import { onMounted } from 'vue'
import { StationPathPageModel } from './StationPathPageModel'
import { Map, Texts, KeyValue, Pagination, DatePicker, Select } from '@/0_tigersan_ui/tigerui'

// 【字段】:
const { model } = defineProps({
    model: {
        type: StationPathPageModel,
        default: () => new StationPathPageModel()
    }
})

// 【过程】:
onMounted(() => {
    model.Refresh(true)
})

// 【方法】:
</script>

<style lang="less" scoped>
@import '@/assets/page.less';

.map-page {
    display: grid;
    grid-template-rows: auto 1fr;
    margin-top: 16px;
    min-height: 70vh;
    max-height: 80vh;

    .bottom-panel {
        display: grid;
        grid-template-columns: auto 1fr;
        margin-top: 16px;

        .table-panel {
            min-width: 250px;
            margin-right: 16px;

            .count-panel {
                padding: 5px 10px;
            }

            .list-panel {
                flex-grow: 1;
                overflow: auto;
                max-height: calc(100vh - 360px);
            }

            .pagination-panel {
                overflow: auto;
            }
        }
    }
}
</style>