<template>
    <div class="pagination flex-center">
        <slot></slot>
        <KeyValue :propName="Texts.Select.value" :propValue="selectedRowCount"
            v-if="model.IsShowSelectedRowCount.value">
        </KeyValue>
        <KeyValue :propName="Texts.Count.value" :propValue="model.Count.value" v-if="model.IsShowCount.value">
        </KeyValue>
        <Select v-if="model.IsShowPageSize.value" :model="model.PageSizeSelectModel" />
        <PaginationButton v-for="b in model.ButtonModels" :key="b._id" :model="b"></PaginationButton>
        <div class="page-to flex-center" v-if="model.IsShowPageTextBox.value">
            <span>{{ Texts.To.value }}</span>
            <input type="text" v-model="model.PageText.value" :style="pageTextStyle" @keyup.enter="handleEnter">
            <span>{{ Texts.page.value }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, type StyleValue } from 'vue'
import { Texts } from '../../texts'
import { PaginationModel } from '../../models'
import { Select, PaginationButton, KeyValue } from '../../components'

// 字段:
let { model, selectedRowCount } = defineProps({
    model: {
        type: PaginationModel,
        default: () => new PaginationModel()
    },
    selectedRowCount: {
        type: Number,
        default: 0
    }
})

const pageTextStyle = computed((): StyleValue => {
    return {
        width: `${model.PageTextWidth.value}px`
    }
})

// 方法:
function handleEnter(e: KeyboardEvent) {
    e.preventDefault()
    model.GoToPage()
}
</script>

<style lang="less" scoped>
@Gap: 10px;

.pagination {
    .page-to {
        margin-left: @Gap;

        input {
            margin: 0 5px;
        }
    }
}
</style>