<template>
    <div class="tree-panel">
        <TreeNode v-for="n in model.RootNode.Childs" :key="n._id" :model="n"></TreeNode>

        <!-- 临时元素: -->
        <div class="temp-panel">
            <TreeNode ref="refNode" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import TreeNode from './TreeNode.vue'
import { TreeModel } from '../../models'

// 字段:
const refNode = ref<typeof TreeNode>()

const { model } = defineProps({
    model: {
        type: TreeModel<any>,
        default: () => new TreeModel<any>()
    }
})

onMounted(() => {
    AddHeightGetter()
    model.UpdateHeight()
})

// 方法:
function AddHeightGetter() {
    model._getFolderHeight = () => refNode.value?.GetHeight()
}
</script>

<style lang="less" scoped>
.tree-panel {
    display: grid;

    .temp-panel {
        height: 0;
        overflow: hidden;
    }
}
</style>
