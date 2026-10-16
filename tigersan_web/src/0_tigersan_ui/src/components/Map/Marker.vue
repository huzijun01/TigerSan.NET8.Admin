<template>
    <div class="marker" :class="rootClass" :style="markerStyle" @mouseover="InitInfo" @click="OnClick">
        <span class="icon iconfont" :style="model.iconStyle">{{ model.icon }}</span>
        <div class="info" ref="refInfo" :style="infoStyle"></div>
        <div class="flag iconfont" :class="model.FlagClass.value">{{ Icons.Flag_Planar }}</div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, shallowRef, type App, type PropType, type StyleValue } from 'vue'
import { Icons } from '../../base'
import { ComponentHelper } from '../../helpers'
import { MarkerModel } from '../../models/Map/MarkerModel'

//字段:
const { model } = defineProps({
    model: {
        type: Object as PropType<MarkerModel<any, any>>,
        default: () => new MarkerModel()
    },
})

const refInfo = shallowRef<HTMLElement | undefined>()

const markerStyle: StyleValue = {
    '--size': MarkerModel.size + 'px',
}

const infoStyle: any = {
    top: `${MarkerModel.size}px`,
    left: `${MarkerModel.size}px`,
}

const rootClass = {
    default: !model.icon
}

let app: App | undefined

function OnClick() {
    model.onClick?.(model.data)
}

const InitInfo = () => {
    if (model.info && refInfo.value && refInfo.value.children.length < 1) {
        app = ComponentHelper.CreateApp(model.info, { model: model.infoModel })
        if (!app) {
            console.warn('The app is undefined!')
            return
        }
        app.mount(refInfo.value)
    }
}

onBeforeUnmount(() => {
    app?.unmount()
    app = undefined
})
</script>

<style scoped lang="less">
.marker {
    position: relative;
    color: var(--theme-color);

    .icon {
        font-size: var(--size);
        text-shadow: 2px 2px 4px var(--theme-mask-hover);
    }

    &.default {
        width: var(--size);
        height: var(--size);
        border-radius: calc(var(--size) / 2);
        border: 1px solid hsl(180, 100%, 40%);
        box-shadow: hsl(180, 100%, 50%) 0px 0px 3px;
        background-color: hsla(180, 100%, 50%, 0.3);
    }

    &:hover .info {
        display: block;
    }

    .info {
        display: none;
        position: absolute;
    }

    .flag {
        display: none;
        position: absolute;
        left: 50%;
        bottom: 50%;
        font-size: 18px;

        &.start {
            display: block;
            color: var(--color-success);
        }

        &.end {
            display: block;
            color: var(--color-danger);
        }
    }
}
</style>
