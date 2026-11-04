<template>
    <text class="iconfont" :class="model.Class.value" :style="model.Style.value" :x="model.X.value" :y="model.Y.value"
        :fill="model.IconFill.value" @click="model.OnClick">
        {{ model.Icon.value }}
    </text>
    <text v-if="model.Text.value" :x="model.X.value" :y="model.labelY.value" :fill="model.TextFill.value"
        :style="model.labelStyle.value" @click="model.OnClick">
        {{ model.Text.value }}
    </text>
</template>

<script lang="ts" setup>
import { PointModel } from '../../models/Svg/Shapes'

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

.icon-label {
    text-anchor: middle;
    dominant-baseline: mathematical;
    user-select: none;
}
</style>