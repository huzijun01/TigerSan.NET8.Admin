<template>
    <div class="arrow-panel" :style="{ opacity }" @click="click()">
        <div class="arrow" :style="style">
            <span class="placeholder" v-show="!isShow">0</span>
            <span class="iconfont" v-show="isShow">{{ Icons.Arrow_Planar_Right }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { type PropType, type StyleValue } from 'vue'
import { Icons } from '../../base'

// 字段:
const { isShow, style, opacity, click } = defineProps({
    isShow: {
        type: Boolean,
        default: true
    },
    style: {
        type: Object as PropType<StyleValue>,
        default: {}
    },
    opacity: {
        type: Number,
        default: 1
    },
    click: {
        type: Function,
        default: () => { }
    }
})
</script>

<style lang="less" scoped>
.arrow-panel {
    padding-right: 2px;

    &:hover {
        .arrow .iconfont {
            font-weight: bold !important;
            color: var(--theme-brand) !important;
        }
    }

    .arrow {
        padding: 6px;
        font-size: 12px;
        transition: var(--Global-Transition);

        .placeholder {
            opacity: 0;
        }

        .iconfont {
            transition: var(--Global-Transition);
        }
    }
}
</style>
