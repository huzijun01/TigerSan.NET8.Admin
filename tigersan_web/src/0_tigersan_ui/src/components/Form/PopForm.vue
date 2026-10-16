<template>
    <Pop :isShow="model.IsShow.value">
        <div class="form-panel" :style="model.FormPanelStyle.value">
            <div class="title-panel flex-between">
                <span class="title">{{ model.ShowTitle.value }}</span>
                <span class="close iconfont" @click="model.Close()">{{ Icons.Close }}</span>
            </div>
            <div class="content-panel" :style="model.ContentPanelStyle.value">
                <div class="center-content">
                    <slot name="center"></slot>
                    <table>
                        <tbody>
                            <slot></slot>
                        </tbody>
                    </table>
                </div>
                <div class="top-content">
                    <slot name="top"></slot>
                </div>
                <div class="bottom-content">
                    <slot name="bottom"></slot>
                </div>
                <div class="left-content">
                    <slot name="left"></slot>
                </div>
                <div class="right-content">
                    <slot name="right"></slot>
                </div>
            </div>
            <div class="button-panel flex-right">
                <button class="cancel" @click="model.Close()">{{ model.ShowCancelText.value }}</button>
                <button class="submit bg-success" @click="model.OnSubmit()">{{ model.ShowSubmitText.value }}</button>
            </div>
        </div>
    </Pop>
</template>

<script lang="ts" setup>
import Pop from '../Dialog/Pop.vue'
import { Icons } from '../../base'
import { ObjectHelper } from '../../helpers'
import { FormConfig, FormModel } from '../../models'

// 字段:
const { model } = defineProps({
    model: {
        type: FormModel<any>,
        default: () => new FormModel(new FormConfig(ObjectHelper.DefaultObjectAction))
    }
})

// 过程:

// 方法:
</script>

<style lang="less" scoped>
@1: 1/2;
@2: 2/3;
@3: 3/4;
@margin-right: 20px;
@margin-bottom: 25px;

table {
    border-collapse: separate;
    border-spacing: @margin-right @margin-bottom;
    margin: -@margin-bottom -@margin-right;
}

.form-panel {
    position: absolute;
    display: flex;
    flex-direction: column;
    max-width: 95vw;
    max-height: 95vh;
    border-radius: 10px;
    background-color: var(--theme-card-background);

    .title-panel {
        padding: 16px 27px 16px 24px;
        border-bottom: 1px solid var(--theme-border-divider);

        .title {
            margin-right: 16px;
            font-weight: bold;
        }

        .close {
            cursor: pointer;
        }
    }

    .content-panel {
        flex-grow: 1;
        display: grid;
        grid-template-rows: 0 auto 0;
        grid-template-columns: 0 auto 0;
        padding: 24px;
        overflow: auto;

        .center-content {
            grid-row: @2;
            grid-column: @2;
        }

        .top-content {
            grid-row: @1;
            grid-column: @2;
        }

        .bottom-content {
            grid-row: @3;
            grid-column: @2;
        }

        .left-content {
            grid-row: @2;
            grid-column: @1;
        }

        .right-content {
            grid-row: @2;
            grid-column: @3;
        }
    }

    .button-panel {
        padding: 10px 16px 10px 20px;
        border-top: 1px solid var(--theme-border-divider);

        .submit {
            margin-left: 10px;
        }
    }
}
</style>