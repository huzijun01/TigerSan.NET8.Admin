<template>
    <div class="page-bar-panel">
        <div class="page-bar" :style="styleObj">
            <PageButton v-for="b in model.OpenedButtonModels" :key="b._id" :model="b" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { PageButton } from '../../components';
import { NavBarModel } from '../../models'

// 字段:
let { model, offsetX } = defineProps({
    model: {
        type: NavBarModel,
        default: () => new NavBarModel()
    },
    offsetX: {
        type: Number,
        default: 0
    },
})

const marginX = 10

const styleObj = computed(() => {
    let offset = offsetX + marginX

    if (model.IsOpen.value) {
        offset += model.Width.value
    }

    return {
        maxWidth: `calc(100vw - ${offset}px)`
    }
})
</script>

<style lang="less" scoped>
@margin-x: 5px;

.page-bar-panel {
    flex-grow: 1;
    margin: 10px @margin-x 0px @margin-x;
    overflow: hidden;

    .page-bar {
        display: flex;
        overflow: auto;
    }
}
</style>