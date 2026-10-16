<template>
    <div class="toasts-panel">
        <Toast v-for="m in models" :key="m._id" :model="m" />
    </div>
</template>

<script lang="ts" setup>
import Toast from './Toast.vue'
import { shallowReactive, type PropType, type ShallowReactive } from 'vue'
import { ToastModel } from '../../models'

const { models } = defineProps({
    models: {
        type: Object as PropType<ShallowReactive<ToastModel[]>>,
        default: () => shallowReactive<ToastModel[]>([])
    }
})
</script>

<style lang="less" scoped></style>