<template>
    <div class="position-info" @click="model.OnClick" :style="model.Style.value">
        <div class="icon-panel flex-center iconfont">{{ model.Icon.value }}</div>
        <div class="info-panel">
            <div class="title ellipsis">
                {{ model.Title.value }}
            </div>
            <div class="time ellipsis">
                <span>{{ Texts.ReportTime.value }}</span>
                <span>{{ Texts.Colon.value }}</span>
                <span>{{ model.ReportTimeText.value }}</span>
            </div>
            <div class="type-panel" v-if="model.IsShowLocationModeText.value">
                <span class="type">{{ model.LocationModeText.value }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { type PropType } from 'vue'
import { Texts } from '@/0_tigersan_ui/tigerui'
import { PositionInfoModel, PositionDto } from '@/models'

//字段:
const { model } = defineProps({
    model: {
        type: Object as PropType<PositionInfoModel>,
        default: () => new PositionInfoModel(new PositionDto())
    },
})

</script>

<style lang="less" scoped>
.position-info {
    display: grid;
    grid-template-columns: auto 1fr;
    padding: 10px;
    border: solid var(--theme-border-divider);
    border-width: 0 0 2px 0;
    color: var(--theme-nav-color);
    cursor: pointer;

    &:hover {
        background: var(--theme-mask-hover);
    }

    * {
        font-size: 14px;
    }

    .icon-panel {
        font-size: 20px;
        margin-right: 10px;
        color: var(--theme-brand);
    }

    .info-panel {
        .title {
            cursor: auto;
            user-select: text;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .time {
            margin-bottom: 10px;
            color: var(--theme-color-placeholder);
        }

        .type-panel {
            .type {
                padding: 3px;
                border-radius: 5px;
                color: var(--theme-brand);
                background: var(--color-brand-10);
            }
        }
    }
}
</style>