<template>
    <div v-if="model.IsShow.value" class="tree-node-panel" :class="model.RootClass.value">
        <div class="back-panel flex-center" ref="refRoot">
            <Arrow :class="{ hidden: !model.IsHaveChild.value }" :style="model.arrowStyle.value"
                :click="model.OnClickArrow" />
            <input type="checkbox" class="checkbox" v-if="model._tree.IsShowCheckbox.value"
                v-model="model.IsChecked.value" :indeterminate="model.IsIndeterminate.value" @change="model.OnChange">
            <div class="text" :style="model.ColorStyle.value" @click="model.OnClick">{{ model.ShowText }}</div>
        </div>
        <div class="content-panel" :style="model.ContentPanelStyle.value">
            <Arrow :opacity="0" />
            <div class="node-panel" ref="refSizePanel">
                <TreeNode v-for="c in model.Childs" :key="c._id" :model="c" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Arrow from './Arrow.vue'
import { shallowRef, onMounted } from 'vue'
import { TreeModel, TreeNodeModel } from '../../models'

// 字段:
const refRoot = shallowRef<HTMLElement | undefined>()

const { model } = defineProps({
    model: {
        type: TreeNodeModel,
        default: () => new TreeNodeModel(new TreeModel())
    }
})

// 导出:
defineExpose({
    GetHeight: () => refRoot.value?.getBoundingClientRect().height
})

onMounted(() => {
    model.UpdateOldState()
    model.UpdateHeight()
})
</script>

<style lang="less" scoped>
.tree-node-panel {
    display: grid;
    grid-template-rows: min-content min-content;

    .arrow-panel.hidden {
        visibility: hidden;
        pointer-events: none;
    }

    &.active {
        &>.back-panel {
            background: var(--theme-tree-node-background-active) !important;

            .text {
                font-weight: bold;
                color: var(--theme-brand);
            }
        }
    }

    .back-panel {
        align-items: center;
        border-radius: 5px;
        cursor: pointer;
        transition: var(--Global-Transition);

        &:hover {
            background: var(--theme-mask-hover);
        }

        .checkbox {
            margin-right: 8px;
        }

        .text {
            flex-grow: 1;
            padding: 5px 0px;
            text-wrap: nowrap;
            transition: var(--Global-Transition);
        }
    }

    .content-panel {
        display: grid;
        grid-template-columns: auto 1fr;
    }
}
</style>
