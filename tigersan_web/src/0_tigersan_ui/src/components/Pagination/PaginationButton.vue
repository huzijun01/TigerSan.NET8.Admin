<template>
    <div class="pagination-button flex-center" v-if="model.IsShow.value" :class="classObj" @click="OnClick">
        <div class="text">{{ model.Text.value }}</div>
        <div class="hover-text">{{ model.HoverText.value }}</div>
        <div class="placeholder">&nbsp;</div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { PaginationModel, PaginationButtonModel } from '../../models'

// 字段:
const { model } = defineProps({
    model: {
        type: PaginationButtonModel,
        default: () => new PaginationButtonModel(new PaginationModel())
    }
})

const classObj = computed(() => {
    return {
        'selected': model.IsSelected.value,
        'enabled': model.IsEnable.value,
        'disabled': !model.IsEnable.value,
        'have-hover': model.HoverText.value.trim() != ''
    }
})

// 方法:
function OnClick() {
    if (!model.IsEnable.value) return

    model.IsSelected.value = true

    if (model._onCheckedInternal) {
        model._onCheckedInternal()
    }

    if (model.Checked) {
        model.Checked(model._pagination.SelectedNum.value)
    }
}
</script>

<style lang="less" scoped>
.show-text {
    .text {
        display: block;
    }

    .hover-text {
        display: none;
    }
}

.show-hover-text {
    .text {
        display: none;
    }

    .hover-text {
        display: block;
    }
}

.pagination-button {
    .show-text();
    padding: 5px 10px;
    cursor: pointer;
    transition: var(--Global-Transition);

    .placeholder {
        width: 0px;
        overflow: hidden;
    }

    &.selected {
        font-weight: bold;

        &>* {
            color: var(--theme-brand);
        }
    }

    &.enabled.have-hover:hover {
        .show-hover-text();

        &>* {
            color: var(--theme-brand);
        }
    }

    &.disabled {
        .show-text();
        cursor: not-allowed;
        color: var(--theme-color-disabled);
    }
}
</style>