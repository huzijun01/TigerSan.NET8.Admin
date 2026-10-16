<template>
    <circle :cx="model.X.value" :cy="model.Y.value" :r="model.R.value" :fill="model.Fill.value"
        :stroke="model.Stroke.value" :stroke-width="model.StrokeWidth.value" @click="model.OnClick" />
</template>

<script lang="ts" setup>
import { CircleModel } from './Shapes'

// 字段:
const { model } = defineProps({
    model: {
        type: CircleModel<any>,
        default: new CircleModel<any>()
    }
})

// 方法:
</script>

<style lang="less" scoped>
circle {
    cursor: pointer;
}
</style>