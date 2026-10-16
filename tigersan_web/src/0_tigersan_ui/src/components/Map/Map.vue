<template>
    <div class="amap-panel">
        <div class="map-container" ref="refContainer"></div>
        <div class="search-panel" v-if="model.IsShowSelect.value">
            <Select :model="model.SelectAddr" />
        </div>
        <div class="button-panel" v-if="model.IsShowButton.value">
            <button class="bg-success" :disabled="!model.IsEditing.value" @click="model.SavePolygon">
                {{ Texts.Save.value }}
            </button>
            <button :disabled="!model.IsAllowCreate.value" @click="model.NewPolygon">
                {{ Texts.Add.value }}
            </button>
            <button :disabled="!model.IsEditing.value" class="bg-danger" @click="model.RemoveTagetPolygon">
                {{ Texts.Delete.value }}
            </button>
        </div>
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
import Select from '../Inputs/Select.vue'
import { onMounted, onBeforeUnmount, type PropType } from 'vue'
import { Texts } from '../../texts'
import { MapModel } from '../../models/Map/MapModel'

//字段:
const { model } = defineProps({
    model: {
        type: Object as PropType<MapModel<any, any>>,
        default: () => new MapModel()
    },
})

const { refContainer } = model

onMounted(async () => {
    if (model._isAutoInit) await model.InitAsync()
})

onBeforeUnmount(() => {
    model.Destroy()
})
</script>

<style lang="less">
@padding: 10px;

.amap-panel {
    position: relative;
    width: 100%;
    height: 100%;
    min-width: 600px;
    min-height: 600px;

    &>* {
        position: absolute;
    }

    .map-container {
        width: 100%;
        height: 100%;
    }

    .search-panel {
        padding: @padding;
    }

    .button-panel {
        right: 0;
        padding: @padding;

        button {
            margin-left: 10px;
        }
    }

    .amap-maptype {
        right: @padding;
        bottom: 110px;

        .amap-ctrl-list-layer {
            background: var(--theme-input-background);
        }
    }
}
</style>
