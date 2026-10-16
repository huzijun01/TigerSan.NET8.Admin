<template>
    <div class="svg-panel">
        <div class="bg" ref="refRoot" :style="model.BgStyle.value">
            <slot></slot>
        </div>
        <svg :style="model._size.SizeStyle.value" @mousedown="model.OnMouseDown" @mouseup="model.OnMouseUp"
            @mousemove="model.OnMouseMove">
            <!-- 图层: -->
            <CsvLayer v-for="l in model.Layers" :key="l._id" :model="l" />
            <!-- 临时: -->
            <Point v-if="model.TempPoint.value" :model="model.TempPoint.value" />
            <Line v-if="model.TempLine.value" :model="model.TempLine.value" />
            <Rect v-if="model.TempRect.value" :model="model.TempRect.value" />
            <Circle v-if="model.TempCircle.value" :model="model.TempCircle.value" />
            <Point v-if="model.Position.value" :model="model.Position.value" />
        </svg>
    </div>
</template>

<script lang="ts" setup>
import Point from './Point.vue'
import Line from './Line.vue'
import Rect from './Rect.vue'
import Circle from './Circle.vue'
import CsvLayer from './CsvLayer.vue'
import { onMounted, onUnmounted } from 'vue'
import { CsvModel } from './CsvModel'

// 字段:
const { model } = defineProps({
    model: {
        type: CsvModel,
        default: new CsvModel()
    }
})

const { refRoot } = model._size

// 过程:
onMounted(() => {
    model._size.Observe()
})

onUnmounted(() => {
    model._size.Unobserver()
})
</script>

<style lang="less" scoped>
.svg-panel {
    position: relative;
    overflow: auto;

    svg {
        top: 0;
        left: 0;
        position: absolute;
    }
}
</style>