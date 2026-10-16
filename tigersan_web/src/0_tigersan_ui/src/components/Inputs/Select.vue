<template>
    <div class="select" ref="refRoot" :class="model.RootClass.value" :style="model.widthStyle.value" @click="OnClick">
        <input type="text" ref="refInput" v-model="model.Text.value" :placeholder="model.ShowPlaceholder.value"
            :disabled="!model.IsEnabled.value">
        <div class="button-panel flex-center">
            <div class="arrow iconfont" :style="model.arrowStyle.value">{{ Icons.Arrow_Right }}</div>
        </div>
        <div class="mask" v-if="!model.IsAllowSearch.value"></div>
    </div>
</template>

<script lang="ts" setup>
import SelectMenu from './SelectMenu.vue'
import { watch, onMounted, onBeforeUnmount } from 'vue'
import { Icons } from '../../base'
import { SelectModel } from '../../models'
import { ContentBehavior } from '../../helpers'

// 字段:
const { model } = defineProps({
    model: {
        type: SelectModel<any>,
        default: () => new SelectModel()
    }
})

const { refRoot, refInput } = model

const behavior = new ContentBehavior(
    'select-menu-panel',
    SelectMenu,
    () => SelectModel._appMenu,
    (content) => SelectModel._appMenu = content
)

const watchIsOpen = watch(model.IsOpen, (isOpen) => {
    if (isOpen) {
        behavior.AddContent(model)
    }
})

// 过程:
onMounted(async () => {
    if (model._isAutoUpdate) await model.UpdateItemsAsync()
})

onBeforeUnmount(() => {
    watchIsOpen.stop()
    SetEventListener(false)
    model.IsOpen.value = false
})

// 方法:

/** 点击后 */
function OnClick() {
    if (!refInput.value) {
        console.warn('The refInput is undefined!')
        return
    }

    if (!model.IsEnabled.value) return

    if (!model.IsOpen.value) {
        model.IsOpen.value = true
    } else if (refInput.value != document.activeElement) {
        model.IsOpen.value = false
    }

    SetEventListener(model.IsOpen.value)
}

/** 设置事件监听 */
function SetEventListener(isAddOrRemove: boolean) {
    if (isAddOrRemove) {
        window.addEventListener('resize', model.UpdateMenuPosition)
        window.addEventListener('click', window_OnClick)
    } else {
        window.removeEventListener('resize', model.UpdateMenuPosition)
        window.removeEventListener('click', window_OnClick)
    }
}

/** 点击窗口后 */
function window_OnClick(event: MouseEvent) {
    if (!model.refRoot.value) {
        console.warn('The refRoot is undefined!')
        return
    }

    const target = event.target as HTMLElement

    if (IsClickOutside(target, model.refRoot.value)
        && (!model.refMenu.value || IsClickOutside(target, model.refMenu.value))) {
        model.IsOpen.value = false
    }
}

/** 是否点击外部 */
function IsClickOutside(target: HTMLElement, panel: HTMLElement): boolean {
    return !panel.contains(target) && target != panel;
}
</script>

<style lang="less" scoped>
@size: 16px;

.select {
    position: relative;

    &.open input {
        border-color: var(--theme-brand);
    }

    &>input {
        width: 100%;
        padding-right: 31px;
    }

    .button-panel {
        position: absolute;
        top: 0px;
        right: 0px;
        height: 100%;

        .arrow {
            width: @size;
            height: @size;
            font-size: @size;
            line-height: 1;
            cursor: pointer;
            margin-right: 10px;
            color: var(--color-placeholder-text);
            /* 过渡: */
            transition: var(--Global-Transition);
        }
    }

    .mask {
        position: absolute;
        top: 0px;
        right: 0px;
        height: 100%;
        width: 100%;
        cursor: pointer;
    }
}
</style>