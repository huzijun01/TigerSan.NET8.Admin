<template>
    <Point v-for="p in model.Points" :key="p._id" :model="p" />
    <Rect v-for="r in model.Rects" :key="r._id" :model="r" />
    <Circle v-for="c in model.Circles" :key="c._id" :model="c" />
    <Line v-for="l in model.Lines" :key="l._id" :model="l" />
</template>

<script lang="ts" setup>
import Point from './Point.vue'
import Line from './Line.vue'
import Rect from './Rect.vue'
import Circle from './Circle.vue'
import { CsvLayerModel } from './Shapes.js';

// 字段:
const { model } = defineProps({
    model: {
        type: CsvLayerModel,
        default: new CsvLayerModel<any, any, any, any>()
    }
})

// 方法:
</script>

<style lang="less" scoped></style>