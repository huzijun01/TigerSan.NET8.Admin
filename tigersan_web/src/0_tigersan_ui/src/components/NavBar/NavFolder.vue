<template>
    <div class="nav-folder" v-if="model.IsAllowShow.value">
        <div class="border" ref="refRoot" @click="OnClick">
            <div class="icon iconfont">{{ model.Icon }}</div>
            <div class="title ellipsis">{{ model.ShowTitle }}</div>
            <div class="arrow iconfont" :class="{ open: model.IsOpen.value }">{{ Icons.Arrow_Right }}</div>
        </div>
        <div class="content" :style="{ 'height': `${model.SubItemsHeight.value}px` }">
            <NavFolder v-for="f in model.FolderModels" :key="f._id" :model="f" />
            <NavButton v-for="b in model.ButtonModels" :key="b._id" :model="b" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icons } from '../../base'
import { shallowRef, onMounted } from 'vue'
import { NavButton, NavFolder } from '../../components'
import { NavBarModel, NavFolderModel } from '../../models'

// 字段:
const refRoot = shallowRef<HTMLElement | undefined>()

const { model } = defineProps({
    model: {
        type: NavFolderModel,
        default: NavBarModel._defaultFolderModel
    }
})

// 导出:
defineExpose({
    GetHeight: () => refRoot.value?.getBoundingClientRect().height
})

// 过程:
onMounted(() => {
    model.UpdateOldState()
    model.UpdateHeight()
})

// 方法:
function OnClick() {
    model.IsOpen.value = !model.IsOpen.value

    model.Clicked?.(model)

    if (model.IsOpen.value) {
        model.Opened?.(model)
    } else {
        model.Closed?.(model)
    }

    model.NavBarModel.UpdateHeight()
}
</script>

<style lang="less" scoped>
.nav-folder {
    .border {
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

        .icon {
            flex-shrink: 0;
            font-size: var(--NavIcon-FontSize);
        }

        .title {
            flex-grow: 1;
            margin: 0px 8px;
            font-size: var(--NavText-FontSize);
        }

        .arrow {
            flex-shrink: 0;
            margin: 0px 8px;
            font-size: var(--NavText-FontSize);
            transition: var(--Global-Transition);

            &.open {
                transform: rotate(90deg);
            }
        }
    }

    .content {
        margin-left: 15px;
        overflow: hidden;
        transition: var(--Global-Transition);
    }
}
</style>