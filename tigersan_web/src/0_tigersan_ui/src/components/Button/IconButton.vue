<template>
    <div class="icon-button flex-center" @click="OnClick">
        <div class="icon iconfont" v-if="isShowIcon" :style="iconStyle">{{ icon }}</div>
        <div class="text ellipsis" v-if="isShowText" :style="textStyle">{{ text }}</div>
    </div>
</template>
<script lang="ts" setup>
import { Icons } from '../../base'

const { icon, text, click, iconSize, fontSize } = defineProps({
    icon: {
        type: String,
        default: Icons.About
    },
    text: {
        type: String,
        default: 'Button'
    },
    iconSize: {
        type: Number,
        default: 20
    },
    fontSize: {
        type: Number,
        default: 16
    },
    click: {
        type: Function,
    }
})

const isShowIcon = icon.trim() != ''
const isShowText = text.trim() != ''
const strIconSize = iconSize > 0 ? `${iconSize}px` : undefined
const strFontSize = fontSize > 0 ? `${fontSize}px` : undefined
const iconStyle: any = { fontSize: strIconSize, width: strIconSize, height: strIconSize }
const textStyle: any = { fontSize: strFontSize }

function OnClick(payload: PointerEvent) {
    if (click) {
        click(payload)
    }
}
</script>
<style lang="less" scoped>
.icon-button {
    cursor: pointer;

    &:hover {
        * {
            color: var(--theme-brand);
        }
    }

    * {
        line-height: 1;
    }

    .text {
        margin: 0 10px;
        max-width: 200px;
        line-height: 1.5;
    }
}
</style>
