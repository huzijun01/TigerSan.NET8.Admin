<template>
    <Pop :isShow="model.IsShow.value" :maskStyle="model.MaskStyle.value">
        <div class="pop-window" :style="model.Style.value">
            <div class="title-panel flex-between">
                <span class="title">{{ model.ShowTitle.value }}</span>
                <span class="close iconfont" @click="model.Close">{{ Icons.Close }}</span>
            </div>
            <div class="content-panel">
                <slot></slot>
            </div>
        </div>
    </Pop>
</template>

<script lang="ts" setup>
import Pop from '../Dialog/Pop.vue'
import { Icons } from '../../base'
import { PopWindowModel } from '../../models'

// 字段:
const { model } = defineProps({
    model: {
        type: PopWindowModel,
        default: () => new PopWindowModel()
    }
})

// 过程:

// 方法:
</script>

<style lang="less" scoped>
.pop-window {
    display: flex;
    flex-direction: column;
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 10px;
    background-color: var(--theme-card-background);

    .title-panel {
        padding: 16px 27px 16px 24px;
        border-bottom: 1px solid var(--theme-border-divider);

        .title {
            margin-right: 16px;
            font-weight: bold;
        }

        .close {
            cursor: pointer;
        }
    }

    .content-panel {
        flex-grow: 1;
        padding: 24px;
        overflow: auto;
    }
}
</style>