<template>
    <div class="nav-button" ref="refRoot" v-if="model.IsAllowShow.value" @click="OnClick" :class="{
        selected: model.IsSelected.value
    }">
        <div class="icon iconfont">{{ model.Icon }}</div>
        <div class="title ellipsis">{{ model.ShowTitle }}</div>
    </div>
</template>

<script lang="ts" setup>
import { shallowRef } from 'vue'
import { NavBarModel, NavButtonModel } from '../../models'

// 字段:
const refRoot = shallowRef<HTMLElement | undefined>()

const { model } = defineProps({
    model: {
        type: NavButtonModel,
        default: NavBarModel._defaultButtonModel
    }
})

// 导出:
defineExpose({
    GetHeight: () => refRoot.value?.getBoundingClientRect().height
})

// 方法:
function OnClick() {
    model.Clicked?.(model)

    if (!model.IsSelected.value) {
        model.Checked?.(model)
    }

    model.NavBarModel.SelectedButtonModel = model

    if (!model.NavBarModel.OpenedButtonModels.includes(model)) {
        model.NavBarModel.OpenedButtonModels.push(model)
    }
}
</script>

<style lang="less" scoped>
.nav-button {
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: var(--Global-Transition);

    &>* {
        color: var(--theme-nav-color);
    }

    &:hover {
        background: var(--theme-nav-item-background-hover);

        * {
            font-weight: bold;
            color: var(--theme-nav-color-hover);
        }
    }

    &.selected {
        font-weight: bold;
        background: var(--theme-nav-item-background-selected);

        * {
            color: var(--theme-nav-color-selected);
        }
    }

    .icon {
        flex-shrink: 0;
        font-size: var(--NavIcon-FontSize);
    }

    .title {
        flex-grow: 1;
        margin: 0px 8px;
        font-size: var(--NavText-FontSize);
    }
}
</style>