<template>
    <div class="tab-view-panel">
        <div class="tab-panel flex-left">
            <div class="tab" :class="p.SelectedClass.value" v-for="p in model.Pages" :key="p._id" @click="p.OnClick">
                <span>{{ p.ShowTitle.value }}</span>
            </div>
        </div>
        <div class="content-list-panel flex-column" :style="model.ContentStyle.value">
            <div v-for="p in model.Pages" :key="p._id" class="content-panel flex-stretch" :class="p.HiddenClass.value">
                <PageContent :component="p._component" :rootProps="p._rootProps" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import PageContent from '../PageView/PageContent.vue'
import { TabViewModel } from '../../models'

// 字段:
const { model } = defineProps({
    model: {
        type: TabViewModel,
        default: () => new TabViewModel()
    }
})
</script>

<style lang="less" scoped>
.tab-view-panel {
    display: grid;
    grid-template-rows: auto 1fr;

    .tab-panel {
        overflow: auto;

        .tab {
            cursor: pointer;
            padding: 5px 10px;
            color: var(--theme-color);
            transition: var(--Global-Transition);
            border: 0px solid transparent;
            border-bottom-width: 3px;

            span {
                transition: var(--Global-Transition);
            }

            &:hover span {
                color: var(--theme-brand);
            }

            &.selected {
                border-color: var(--theme-brand);

                span {
                    font-weight: bold;
                    color: var(--theme-brand);
                }
            }
        }
    }

    .content-list-panel {
        overflow: auto;

        &>.content-panel {
            flex-grow: 1;
        }
    }
}
</style>