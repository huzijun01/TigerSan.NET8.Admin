<template>
    <div class="count-card" :style="style">
        <div class="title-panel flex-left">
            <div class="icon iconfont">{{ icon }}</div>
            <div class="title">{{ title }}</div>
        </div>
        <div class="count">{{ count }}</div>
    </div>
</template>

<script lang="ts" setup>
import { Icons } from '../../base'
import { computed, type StyleValue } from 'vue'

//字段:
const { icon, title, count, background } = defineProps({
    icon: {
        type: String,
        default: Icons.File_Linear
    },
    title: {
        type: String,
        default: Icons.File_Linear
    },
    count: {
        type: Number,
        default: 0
    },
    background: {
        type: String,
        default: ''
    },
})

const style = computed((): StyleValue => {
    return {
        background
    }
})
</script>

<style lang="less" scoped>
.count-card {
    padding: 15px;
    border-radius: 2px;
    font-weight: bold;

    * {
        color: var(--theme-button-color);
    }

    .title-panel {
        * {
            font-size: 18px;
        }

        .icon {
            margin-right: 8px;
        }
    }

    .count {
        font-size: 24px;
    }
}
</style>