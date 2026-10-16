<template>
    <Teleport to="body">
        <div class="pop-mask" v-if="isShow" :style="maskStyle">
            <slot></slot>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import type { PropType, StyleValue } from 'vue'

let { isShow, maskStyle } = defineProps({
    isShow: {
        type: Boolean,
        default: false
    },
    maskStyle: {
        type: Object as PropType<StyleValue | undefined>,
        default: undefined
    },
})
</script>

<style lang="less" scoped>
.pop-mask>* {
    pointer-events: all;
}
</style>