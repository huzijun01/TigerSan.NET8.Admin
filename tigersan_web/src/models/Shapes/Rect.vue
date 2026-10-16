<template>
    <rect :x="model.X.value" :y="model.Y.value" :width="model.W.value" :height="model.H.value" :fill="model.Fill.value"
        :stroke="model.Stroke.value" :stroke-width="model.StrokeWidth.value" @click="model.OnClick" />
</template>

<script lang="ts" setup>
import { RectModel } from './Shapes'

// 字段:
const { model } = defineProps({
    model: {
        type: RectModel<any>,
        default: new RectModel<any>()
    }
})

// 方法:
</script>

<style lang="less" scoped>
rect {
    cursor: pointer;
}
</style>