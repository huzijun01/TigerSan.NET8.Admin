<template>
    <div class="table-header flex-center" ref="refRoot">
        <span class="ellipsis">{{ model.ShowText.value }}</span>
        <div class="sort-btn flex-center" v-if="model.IsShowSlot.value" @click="model.OnSlotClick">
            <div class="triangle-up" :class="model.AscClass.value"></div>
            <div class="triangle-down" :class="model.DescClass.value"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { TableHeaderModel, TableModel } from '../../models'

// 字段:
const { model } = defineProps({
    model: {
        type: TableHeaderModel,
        default: () => new TableHeaderModel(new TableModel([]), '')
    }
})

const { refRoot } = model._sizeBehavior

// 过程:
onMounted(() => {
    model._sizeBehavior.Observe()
})
</script>

<style lang="less" scoped>
.table-header {
    padding: 12px 16px;
    color: var(--theme-color);

    &:hover {
        background: var(--theme-mask-hover);
    }

    .sort-btn {
        flex-direction: column;
        margin-left: 8px;
        cursor: pointer;

        .triangle-up {
            margin-bottom: 3px;
        }
    }
}

@h: 5px;
@w: 5px;

.triangle-up,
.triangle-down {
    width: 0;
    height: 0;
    border-style: solid;
}

/* 上三角：箭头向上 */
.triangle-up {
    border-width: 0 @w @h @w;
    border-color: transparent transparent var(--theme-color) transparent;

    &.active {
        border-color: transparent transparent var(--theme-brand) transparent;
    }
}

/* 下三角：箭头向下 */
.triangle-down {
    border-width: @h @w 0 @w;
    border-color: var(--theme-color) transparent transparent transparent;

    &.active {
        border-color: var(--theme-brand) transparent transparent transparent;
    }
}
</style>