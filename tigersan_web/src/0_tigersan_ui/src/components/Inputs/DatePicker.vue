<template>
    <ElConfigProvider :locale="model._locale">
        <div :style="model.RootStyle.value">
            <el-date-picker v-model="model.Date.value" @change="model.OnChange" :type="model._type"
                :format="model._format" :value-format="model._valueFormat" :placeholder="model._placeholder"
                :start-placeholder="model._startPlaceholder" :end-placeholder="model._endPlaceholder" />
        </div>
    </ElConfigProvider>
</template>

<script lang="ts" setup>
import { ElConfigProvider } from 'element-plus'
import { DatePickerModel } from '../../models'

const { model } = defineProps({
    model: {
        type: DatePickerModel,
        default: () => new DatePickerModel()
    }
})
</script>

<style lang="less">
.el-date-editor {
    width: var(--width) !important;
}

.el-input__wrapper {
    width: var(--width) !important;

    * {
        color: var(--theme-color) !important;
    }

    box-shadow: none !important;
    border: 1px solid var(--theme-border) !important;
    background-color: var(--theme-input-background) !important;

    &.is-focus {
        box-shadow: var(--theme-brand) !important;
        border: 1px solid var(--theme-brand) !important;
    }

    .el-input__prefix {
        display: var(--prefix-display);
    }

    .el-input__inner {
        width: 100% !important;
    }
}

.el-picker__popper {
    border-color: var(--theme-brand) !important;

    .el-picker-panel {
        * {
            color: var(--theme-color) !important;
        }

        &>* {
            background-color: var(--theme-input-background) !important;
        }

        .el-date-table td.in-range .el-date-table-cell {
            background-color: var(--color-brand-25) !important;
        }

        .el-picker-panel__footer {
            button {
                border: 0px !important;
                background: var(--theme-brand) !important;

                * {
                    color: var(--theme-button-color) !important;
                }
            }
        }
    }

    .el-popper__arrow::before {
        border: 1px solid var(--theme-brand) !important;
        background: var(--theme-input-background) !important;
    }

    .el-time-panel {
        background-color: var(--theme-input-background) !important;

        .el-time-spinner__item {
            &:hover {
                background: var(--theme-mask-hover) !important;
            }
        }
    }
}
</style>