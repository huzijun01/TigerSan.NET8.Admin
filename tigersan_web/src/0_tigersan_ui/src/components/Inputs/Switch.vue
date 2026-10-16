<template>
    <div class="switch" :class="model.classObj.value" @click="model.OnClick">
        <div class="circle-panel">
            <div class="circle-left"></div>
            <div class="circle"></div>
            <div class="circle-right"></div>
        </div>
        <div class="text-panel">
            <div class="text-left"></div>
            <div class="text">{{ model.Text.value }}</div>
            <div class="text-right"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { SwitchModel } from '../../models'

const { model } = defineProps({
    model: {
        type: SwitchModel,
        default: () => new SwitchModel()
    }
})
</script>

<style lang="less" scoped>
@height: 30px;
@circle-size: 24px;
@border-radius: 12px;

.flex-center {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
}

.switch {
    position: relative;
    width: 68px;
    height: @height;
    font-size: 16px;
    border-radius: @height;
    cursor: pointer;
    background: var(--color-darker-border);
    transition: var(--Global-Transition);

    .circle-panel {
        position: absolute;
        .flex-center();

        .circle {
            width: @circle-size;
            height: @circle-size;
            border-radius: @border-radius;
            margin: 0px 3px;
            background: white;
        }

        .circle-left {
            flex-grow: 0;
            transition: var(--Global-Transition);
        }

        .circle-right {
            flex-grow: 1;
            transition: var(--Global-Transition);
        }
    }

    .text-panel {
        position: absolute;
        .flex-center();

        .text {
            margin: 0px 8px;
            color: white;
            text-wrap: nowrap;
        }

        .text-left {
            flex-grow: 1;
            transition: var(--Global-Transition);
        }

        .text-right {
            flex-grow: 0;
            transition: var(--Global-Transition);
        }
    }

    &.on {
        background: var(--theme-brand);

        .circle-left {
            flex-grow: 1;
        }

        .circle-right {
            flex-grow: 0;
        }

        .text-left {
            flex-grow: 0;
        }

        .text-right {
            flex-grow: 1;
        }
    }

    &.disable {
        cursor: not-allowed;
        filter: brightness(90%);
    }
}
</style>