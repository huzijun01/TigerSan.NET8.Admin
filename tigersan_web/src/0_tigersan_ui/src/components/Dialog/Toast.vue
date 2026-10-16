<template>
    <Transition name="toast" appear>
        <div v-show="model.IsShow.value" class="toast-panel" ref="refRoot" :class="model._class"
            :style="model.RootStyle.value" @mouseenter="model.OnMouseEnter" @mouseleave="model.OnMouseLeave">
            <div class="mask flex-center">
                <i class="icon iconfont">{{ model._icon }}</i>
                <p class="msg">{{ model._msg }}</p>
            </div>
        </div>
    </Transition>
</template>

<script lang="ts" setup>
import { onMounted, shallowReactive } from 'vue'
import { ToastModel } from '../../models'

const { model } = defineProps({
    model: {
        type: ToastModel,
        default: () => new ToastModel(shallowReactive<ToastModel[]>([]))
    }
})

onMounted(() => {
    model._timerClose.Start()
})
</script>

<style lang="less" scoped>
.toast-panel {
    z-index: 99999;
    position: fixed;
    left: 50%;
    transform: translate(-50%);
    border-radius: 4px;
    width: max-content;
    max-width: calc(100% - 32px);
    overflow: hidden;
    background: var(--theme-panel-background);
    border: 1px solid;
    border-color: var(--color-brand-25);
    transition: var(--Global-Transition);

    * {
        color: var(--theme-brand);
    }

    .mask {
        gap: 8px;
        padding: 10px 15px;
        background: var(--color-brand-10);

        .icon {
            font-size: 18px;
        }

        .msg {
            margin: 0;
            flex-shrink: 1;
            font-size: 16px;
            user-select: text;
        }
    }

    &.success {
        border-color: var(--color-success-25);

        * {
            color: var(--color-success);
        }

        .mask {
            background: var(--color-success-10);
        }
    }

    &.warning {
        border-color: var(--color-warning-25);

        * {
            color: var(--color-warning);
        }

        .mask {
            background: var(--color-warning-10);
        }
    }

    &.error {
        border-color: var(--color-danger-25);

        * {
            color: var(--color-danger);
        }

        .mask {
            background: var(--color-danger-10);
        }
    }

    &.info {
        border-color: var(--color-info-25);

        * {
            color: var(--color-info);
        }

        .mask {
            background: var(--color-info-10);
        }
    }
}

/* 初始位置偏上20px，透明 */
.toast-enter-from {
    opacity: 0;
    transform: translate(-50%, -20px);
}

.toast-enter-active {
    transition: all var(--Global-Duration) ease-out;
}

/* 最终位置归位，不透明 */
.toast-enter-to {
    opacity: 1;
    transform: translate(-50%, 0);
}

.toast-leave-from {
    opacity: 1;
    transform: translate(-50%, 0);
}

.toast-leave-active {
    transition: all var(--Global-Duration) ease-in;
}

/* 离开时向上移动并消失，或者改为 +20px 向下 */
.toast-leave-to {
    opacity: 0;
    transform: translate(-50%, -20px);
}
</style>