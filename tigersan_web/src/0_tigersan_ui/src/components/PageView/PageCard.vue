<template>
    <div class="page-card flex-stretch">
        <div class="scroll-panel flex-column" :style="styleObj">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { Constants, Theme } from '../../base'
import { ClassObserver, DomHelper } from '../../helpers'

// 字段:
const isOpen = ref(false)

let { margin, padding, borderRadius, navWidth, topPanelHeight, background } = defineProps({
    margin: {
        type: Number,
        default: 20
    },
    padding: {
        type: Number,
        default: 20
    },
    borderRadius: {
        type: Number,
        default: 10
    },
    navWidth: {
        type: Number,
        default: 200
    },
    topPanelHeight: {
        type: Number,
        default: 71
    },
    background: {
        type: String,
        default: Theme.CardBackground
    },
})

let styleObj = computed(() => {
    let offsetX = margin * 2 + padding * 2
    let offsetY = margin * 2 + topPanelHeight
    if (isOpen.value) {
        offsetX += navWidth
    }

    return {
        margin: `${margin}px`,
        padding: `${padding}px`,
        borderRadius: `${borderRadius}px`,
        width: `calc(100vw - ${offsetX}px)`,
        height: `calc(100vh - ${offsetY}px)`,
        background: background,
    }
})

const bodyClassObserver = new ClassObserver(undefined, UpdateIsOpen)

// 过程:
onMounted(() => {
    UpdateIsOpen()
    bodyClassObserver.Start()
})

onBeforeUnmount(() => {
    bodyClassObserver.Stop()
})

// 方法:
function UpdateIsOpen() {
    isOpen.value = DomHelper.IsIncludeClass(Constants.NavOpen)
}
</script>

<style lang="less" scoped>
.page-card {
    .scroll-panel {
        overflow: auto;

        &>* {
            width: 100% !important;
        }
    }
}
</style>