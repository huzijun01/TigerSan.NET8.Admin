<template>
    <div class="select-menu" ref="refMenu" v-if="model.IsOpen.value" :class="model.RootClass.value"
        :style="model.menuStyle.value">
        <div class="menu-item flex-left line" v-if="model.IsAllowMultiSelect.value" @click="OnSelectAllClick">
            <input type="checkbox" v-model="model.IsSelectAll.value">
            <span>{{ Texts.SelectAll.value }}</span>
        </div>
        <div class="menu-item flex-left line" v-if="!model.IsAllowMultiSelect.value && model.IsShowClear.value"
            @click="model.Unselect">
            <span>{{ Texts.Clear.value }}</span>
        </div>
        <div v-for="i in model.ItemModels.value" :key="i._id">
            <div class="menu-item flex-left" v-if="i.IsShow.value" @click="i.OnClick">
                <input type="checkbox" v-if="model.IsAllowMultiSelect.value" v-model="i.IsChecked.value">
                <span>{{ i.Text.value }}</span>
            </div>
        </div>
        <div v-if="model.IsNoContent.value" class="placeholder flex-center">{{ Texts.NoContent.value }}</div>
        <Loading v-if="model.IsLoading.value" :fontSize="15" :style="model.menuStyle.value" />
    </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import { Texts } from '../../texts'
import { SelectModel } from '../../models'
import Loading from '../Dialog/Loading.vue'

// 字段:
const { model } = defineProps({
    model: {
        type: SelectModel,
        default: () => new SelectModel()
    }
})

const refMenu = shallowRef<HTMLElement | undefined>()

// 监听:
const refMenuWatch = watch(refMenu, menu => {
    if (!menu) return
    model.refMenu.value = refMenu.value
    model.UpdateMenuPosition()
})

// 过程:
onBeforeUnmount(() => {
    refMenuWatch.stop()
})

// 方法:
function OnSelectAllClick() {
    model._checkboxBehavior.Toggle()
}
</script>

<style lang="less" scoped>
@import '../../assets/styles/input.less';

@font-size: 14px;

.select-menu {
    /* 位置: */
    position: absolute;
    /* 显示: */
    overflow: auto;
    /* 尺寸: */
    padding: 5px 0px;
    border-radius: 5px;
    border: 1px solid var(--theme-border-active);
    /* 颜色: */
    background: var(--theme-input-background);
    /* 其它: */
    z-index: 9999;
    /* 动画配置 */
    animation: top-scaleY-animation var(--Global-Animation);

    &.top-open {
        /* 动画配置 */
        animation: bottom-scaleY-animation var(--Global-Animation);
    }

    .menu-item {
        /* 尺寸: */
        padding: 5px 32px 5px 20px;
        font-size: @font-size;
        /* 其它: */
        cursor: pointer;
        .ellipsis();

        &:hover {
            background: var(--theme-mask-hover);
        }

        input {
            margin-right: 5px;
        }
    }

    .line {
        border: solid var(--theme-border-divider);
        border-width: 0 0 2px 0;
    }

    .placeholder {
        padding: 5px;
        color: var(--theme-color-placeholder);
    }
}
</style>