<template>
    <div class="pie-panel" :style="model.RootStyle.value">
        <div class="title-panel">
            <span class="title" v-if="model.IsShowTitle.value" :style="{ fontSize: model.TitleSize.value + 'px' }">
                {{ model.ShowTitle.value }}
            </span>
        </div>
        <div class="pie">
            <svg :viewBox="`0 0 ${model.PieWidth.value} ${model.PieHeight.value}`">
                <circle class="bg-circle" cx="50%" cy="50%" :r="model.Radius.value"
                    :style="model.styleBgCircle.value" />
                <circle v-for="c in model.Items.value" :key="c._id" :class="c.Class.value" :style="c.Style.value"
                    cx="50%" cy="50%" :r="c.Radius.value" @mouseenter="c.OnActive" @mouseleave="c.OnUnactive" />
                <line v-if="model.IsShowGuideLine.value" v-for="c in model.Items.value" :key="c._id"
                    :class="c.Class.value" :x1="c.X1.value" :x2="c.X2.value" :y1="c.Y1.value" :y2="c.Y2.value"
                    :stroke="model.Color.value" />
                <text v-if="model.IsShowGuideLine.value" class="name" v-for="c in model.Items.value" :key="c._id"
                    :class="c.Class.value" :x="c.X2.value" :y="c.Y2.value" :fill="model.Color.value"
                    :text-anchor="c.Anchor.value" :alignment-baseline="c.Baseline.value"
                    :style="model.styleFontSize.value">{{ c.ShowName.value }}</text>
            </svg>
            <span class="center-text" :style="model.styleFontSize.value">{{ model.CenterText.value }}</span>
        </div>
        <div class="example-panel flex-center" v-if="model.IsShowExample.value">
            <div class="example flex-center" v-for="c in model.Items.value" :key="c._id" :class="c.Class.value"
                @mouseenter="c.OnActive" @mouseleave="c.OnUnactive">
                <div class="color" :style="{ background: c._color }"></div>
                <div class="name" :style="model.styleFontSize.value">{{ c.ShowName.value }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { PieModel } from '../../models'

const { model } = defineProps({
    model: {
        type: PieModel,
        default: () => new PieModel()
    }
})

onMounted(async () => {
    if (model._isAutoInit) await model.Init()
})
</script>

<style lang="less" scoped>
.center {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.hidden {
    display: none;
}

.active {
    z-index: 2;
    filter: brightness(1.1);
}

.pie-panel {
    display: grid;
    grid-template-rows: auto 1fr auto;

    &>* {
        text-align: center;
    }

    .title {
        margin-bottom: 10px;
        font-weight: bold;
    }

    .pie {
        position: relative;

        * {
            color: var(--theme-color);
        }

        svg {
            overflow: visible;
            position: absolute;
            width: 100%;
            height: 100%;
            .center();

            circle {
                fill: none;
                cursor: pointer;
                stroke-linecap: butt;
                transform-origin: center;
                transition: all var(--Global-Duration);
            }

            .bg-circle {
                z-index: 0;
                transition: none;
                pointer-events: none;
                stroke: var(--color-info);
            }

            .name {
                z-index: 2;
            }
        }

        .center-text {
            position: absolute;
            .center();
        }
    }

    .example-panel {
        .example {
            margin-top: 10px;
            margin-right: 10px;
            cursor: pointer;

            .color {
                width: 15px;
                height: 15px;
                margin-right: 5px;
                border-radius: 5px;
                background: #000;
            }
        }
    }
}
</style>