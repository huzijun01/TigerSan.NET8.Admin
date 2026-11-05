<template>
    <div class="svg-panel">
        <div class="bg" ref="refRoot" :style="model.BgStyle.value">
            <img :src="model.BgUrl.value" :style="model.ImageStyle.value" />
            <slot></slot>
        </div>
        <svg :style="model._size.SizeStyle.value" @mousedown="model.OnMouseDown" @mouseup="model.OnMouseUp"
            @mousemove="model.OnMouseMove">
            <defs>
                <pattern id="flow_canvas_grid_item" width="61" height="61" patternUnits="userSpaceOnUse">
                    <path id="flow_canvas_grid_path1" stroke-width="1" fill="none"
                        d="M0 15L60 15M15 0L15 60M0 30L60 30M30 0L30 60M0 45L60 45M45 0L45 60"
                        stroke="var(--theme-grid-color-primary)" />
                    <path id="flow_canvas_grid_path2" stroke-width="1" fill="none" d="M0 60L60 60M60 0L60 60"
                        stroke="var(--theme-grid-color-secondary)" />
                </pattern>
            </defs>
            <!-- 网格: -->
            <rect id="flow_canvas_grids_box" v-if="model.IsShowGrid.value" width="100%" height="100%"
                fill="url(#flow_canvas_grid_item)" />
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
import CsvLayer from './SvgLayer.vue'
import { onMounted, onBeforeUnmount } from 'vue'
import { SvgModel } from '../../models'

// 字段:
const { model } = defineProps({
    model: {
        type: SvgModel,
        default: new SvgModel()
    }
})

const { refRoot } = model._size

// 过程:
onMounted(() => {
    model._size.Observe()
    model._bgBlob.Load()
})

onBeforeUnmount(() => {
    model._size.Unobserver()
    model._bgBlob.Dispose()
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