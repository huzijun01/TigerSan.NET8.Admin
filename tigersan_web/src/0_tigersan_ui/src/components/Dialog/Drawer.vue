<template>
    <Teleport to="body">
        <Transition name="drawer" appear>
            <div class="drawer-panel" ref="refRoot" v-show="model.IsShow.value" :style="model.RootStyle.value">
                <div class="title-panel flex-between">
                    <span class="title">{{ model.ShowTitle.value }}</span>
                    <span class="close iconfont" @click="model.Close">
                        {{ Icons.Close }}
                    </span>
                </div>
                <div class="content-panel">
                    <slot></slot>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { Icons } from '../../base'
import { DrawerModel } from '../../models'

// 字段:
const { model } = defineProps({
    model: {
        type: DrawerModel,
        default: () => new DrawerModel()
    }
})

const { refRoot } = model

// 过程:
onMounted(() => {
    model._behavior.Start()
})

onUnmounted(() => {
    model._behavior.Stop()
})
</script>

<style lang="less" scoped>
.drawer-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    background-color: var(--theme-card-background);

    .title-panel {
        flex-shrink: 0;
        padding: 16px 27px 16px 24px;
        border-bottom: 1px solid var(--theme-border-divider);

        .title {
            margin-right: 16px;
            font-weight: bold;
        }

        .close {
            cursor: pointer;
            transition: color 0.3s;

            &:hover {
                color: var(--theme-primary-color, #409eff);
            }
        }
    }

    .content-panel {
        flex-grow: 1;
        padding: 24px;
        overflow: auto;
    }
}

.drawer-enter-active,
.drawer-leave-active {
    transition: transform var(--Global-Duration) ease-out;
}

.drawer-enter-from,
.drawer-leave-to {
    transform: translateX(100%);
}

.drawer-enter-to,
.drawer-leave-from {
    transform: translateX(0);
}
</style>
