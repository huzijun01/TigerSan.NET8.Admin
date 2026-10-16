<template>
    <div class="state-page">
        <div class="left-panel flex-stretch">
            <div class="map-panel">
                <Map :model="model.map" />
            </div>
        </div>
        <div class="right-panel">
            <RowData :model="model.station" />
        </div>
        <div class="bottom-panel flex-left">
            <div class="addr-panel flex-left">
                <div class="location-mode" v-if="model.IsShowLocationMode.value">{{ model.LocationMode.value }}</div>
            </div>
            <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { Map, Texts, RowData, TableModel } from '@/0_tigersan_ui/tigerui'
import { BaseStationDto } from '@/models'
import { StationStatePageModel } from './StationStatePageModel'

// 【字段】:
const { model } = defineProps({
    model: {
        type: StationStatePageModel,
        default: () => new StationStatePageModel(new TableModel<BaseStationDto>([]))
    }
})

const { station: stationState } = model

// 【过程】:
onMounted(() => {
    model.Refresh()
})

// 【方法】:
</script>

<style lang="less" scoped>
.state-page {
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 1fr auto;
    margin-top: 16px;
    min-height: 70vh;
    max-height: 80vh;

    .right-panel {
        grid-column: 2/3;
        padding: 0 15px;
    }

    .bottom-panel {
        grid-row: 2/3;
        padding-top: 15px;

        .addr-panel {
            flex-grow: 1;

            .location-mode {
                padding: 3px 5px;
                margin-right: 10px;
                border-radius: 3px;
                color: var(--theme-brand);
                background: var(--color-brand-10);
            }

            .addr {
                user-select: text;
            }
        }
    }
}
</style>