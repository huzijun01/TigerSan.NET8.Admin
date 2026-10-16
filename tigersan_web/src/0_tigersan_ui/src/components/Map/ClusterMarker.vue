<template>
    <div class="cluster-marker" :style="markerStyle" @click="OnClick">
        {{ model.count }}
    </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'
import { ClusterMarkerModel } from '../../models/Map/ClusterMarkerModel';

//字段:
const { model } = defineProps({
    model: {
        type: Object as PropType<ClusterMarkerModel<any>>,
        default: () => new ClusterMarkerModel()
    },
})

const factor = Math.pow(model.totalCount / model.count, 1 / 18)
const Hue = 180 - factor * 180
const bgColor = `hsla(${Hue}, 100%, 40%, 0.7)`
const fontColor = `hsla(${Hue}, 100%, 90%, 1)`
const borderColor = `hsla(${Hue}, 100%, 40%, 1)`
const shadowColor = `hsla(${Hue}, 100%, 90%, 1)`
const markerStyle: any = {
    backgroundColor: bgColor,
    width: `${model.size}px`,
    height: `${model.size}px`,
    border: `solid 1px ${borderColor}`,
    borderRadius: `${model.size / 2}px`,
    boxShadow: `0 0 5px ${shadowColor}`,
    lineHeight: `${model.size}px`,
    color: fontColor,
    fontSize: '14px',
    textAlign: 'center'
}

function OnClick() {
    model.onClick?.(model.data)
}
</script>

<style scoped lang="less">
.cluster-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
}
</style>
