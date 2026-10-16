<template>
    <text class="iconfont" :class="model.Class.value" :style="model.Style.value" :x="model.X.value" :y="model.Y.value"
        :fill="model.Fill.value" @click="model.OnClick">
        {{ model.Text.value }}
    </text>
</template>

<script lang="ts" setup>
import { PointModel } from './Shapes'

// 字段:
const { model } = defineProps({
    model: {
        type: PointModel<any>,
        default: new PointModel<any>()
    }
})

// 方法:
</script>

<style lang="less" scoped>
text {
    cursor: pointer;
    text-anchor: middle;
    box-shadow: var(--color-box-shadow) 0px 0px 3px;

    &:hover {
        fill: var(--color-danger);
    }

    &.position {
        pointer-events: none;
    }
}
</style>