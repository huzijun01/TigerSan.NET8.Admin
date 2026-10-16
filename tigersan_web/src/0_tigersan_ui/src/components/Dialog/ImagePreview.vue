<template>
    <PopWindow :model="model">
        <img :src="model.Url.value" :alt="model.ShowTitle.value" :style="{
            maxWidth: '80vw',
            maxHeight: '80vh',
        }">
    </PopWindow>
</template>

<script lang="ts" setup>
import PopWindow from './PopWindow.vue'
import { ImagePreviewModel } from '../../models'

const { model } = defineProps({
    model: {
        type: ImagePreviewModel,
        default: new ImagePreviewModel()
    }
})
</script>

<style lang="less" scoped></style>