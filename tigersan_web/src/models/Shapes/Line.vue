<template>
    <line :x1="model.X1.value" :y1="model.Y1.value" :x2="model.X2.value" :y2="model.Y2.value"
        :stroke="model.Stroke.value" :stroke-width="model.StrokeWidth.value" @click="model.OnClick" />
</template>

<script lang="ts" setup>
import { LineModel } from './Shapes'

// 字段:
const { model } = defineProps({
    model: {
        type: LineModel<any>,
        default: new LineModel<any>()
    }
})

// 方法:
</script>

<style lang="less" scoped>
line {
    cursor: pointer;
}
</style>