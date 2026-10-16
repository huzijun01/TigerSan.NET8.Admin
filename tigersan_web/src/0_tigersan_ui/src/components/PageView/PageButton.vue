<template>
    <div class="page-button" @click="OnClick" :class="{
        selected: model.IsSelected.value
    }">
        <div class="sub-border">
            <div class="icon iconfont">{{ model.Icon }}</div>
            <div class="title ellipsis">{{ model.ShowTitle }}</div>
            <button v-if="model.IsShowCloseButton.value" class="close iconfont circle-button" @click.stop="Close">{{
                Icons.Close }}</button>
        </div>
        <div class="line"></div>
    </div>
</template>

<script lang="ts" setup>
import { Icons } from '../../base'
import { ArrayHelper } from '../../helpers'
import { NavBarModel, NavButtonModel } from '../../models'

// 字段:
const { model } = defineProps({
    model: {
        type: NavButtonModel,
        default: NavBarModel._defaultButtonModel
    }
})

// 方法:
function OnClick() {
    model.NavBarModel.SelectedButtonModel = model;
}

function Close() {
    const oldIsSelected = model.IsSelected.value
    ArrayHelper.Delete(model.NavBarModel.OpenedButtonModels, model)

    if (oldIsSelected) {
        model.NavBarModel.SelectedButtonModel = ArrayHelper.GetFirst(model.NavBarModel.OpenedButtonModels)
    }
}
</script>

<style lang="less" scoped>
.page-button {
    position: relative;
    border-radius: 10px 10px 0px 0px;
    transition: var(--Global-Transition);

    * {
        color: var(--theme-color);
    }

    .sub-border {
        display: flex;
        align-items: center;
        width: 150px;
        padding: 5px;
        border-radius: 10px;
        cursor: pointer;
        transition: var(--Global-Transition);

        .icon {
            flex-shrink: 0;
            font-size: var(--PageButton-FontSize);
        }

        .title {
            flex-grow: 1;
            margin: 0px 5px;
            font-size: var(--PageButton-FontSize);
        }

        .close {
            flex-shrink: 0;
        }
    }

    .line {
        position: absolute;
        right: 0;
        top: 50%;
        width: 2px;
        height: 20px;
        transform: translateY(-50%);
        transition: var(--Global-Transition);
        background: var(--theme-nav-line-background);
    }

    &:hover {
        .sub-border {
            background: var(--theme-nav-item-background-hover);
        }

        .line {
            background: transparent;
        }
    }

    &.selected {
        font-weight: bold;
        background: var(--theme-nav-item-background-selected);

        * {
            color: var(--theme-brand);
        }

        .sub-border {
            background: transparent;
        }

        .line {
            background: transparent;
        }
    }
}
</style>