<template>
    <div class="table-item" ref="refRoot" :class="model.SelectClass.value" @contextmenu.prevent="Copy">
        <div class="size-panel">
            <div class="size" :class="model.EllipsisClass.value" v-html="FormattedText"></div>
            <span class="placeholder">*</span>
        </div>
        <div v-if="model.IsLink.value" class="input ellipsis" :style="InputStyle">
            <a @click="model.OnClick">{{ model.Text.value }}</a>
        </div>
        <input type="text" v-if="model.IsTextBox.value" class="input ellipsis" :style="InputStyle"
            :readonly="model.IsReadonly.value" v-model="model.Text.value" @input="OnInput" @change="OnChange" />
        <textarea v-if="model.IsTextarea.value" class="input" :style="InputStyle" :readonly="model.IsReadonly.value"
            v-model="model.Text.value" @input="OnInput" @change="OnChange"></textarea>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, computed, type StyleValue } from 'vue'
import { CopyBehavior, SizeBehavior, StringHelper } from '../../helpers';
import { TableHeaderModel, TableItemModel, TableModel, TableRowModel } from '../../models'

// 字段:
const sizeBehavior = new SizeBehavior()
const { refRoot } = sizeBehavior

const { model } = defineProps({
    model: {
        type: TableItemModel,
        default: () => new TableItemModel(new TableHeaderModel(new TableModel([]), ''), new TableRowModel(new TableModel([]), {}))
    }
})

const InputStyle = computed((): StyleValue => {
    return {
        width: `${sizeBehavior.ActualWidth.value}px`,
        height: `${sizeBehavior.ActualHeight.value}px`,
        textAlign: model._headerModel.TextAlign.value,
        color: model.Color.value,
        background: model.Background.value,
    }
})

const FormattedText = computed(() => {
    const text = model.IsTextarea.value
        ? StringHelper.StringToHtml(model.Text.value) :
        StringHelper.StringToHtml(model.Text.value, '')
    return StringHelper.IsNotEmpty(text) ? text : '0'
})

// 过程:
onMounted(() => {
    TextXSS()
    sizeBehavior.Observe()
})

// 方法:
function OnInput() {
    TextXSS()
    model.SetRowData()
    model._onItemTextInput()
}

function OnChange() {
    model._onItemTextChange()
}

function TextXSS() {
    model.Text.value = StringHelper.StringXSS(model.Text.value)
}

function Copy(event: MouseEvent) {
    CopyBehavior.Copy(model.Text.value, event)
}
</script>

<style lang="less" scoped>
@line-height: 1.5;
@input-padding: 12px 16px;

.table-item {
    position: relative;
    color: var(--theme-color);

    &:hover .size-panel {
        background: var(--theme-mask-hover);
    }

    &.select {
        background: var(--theme-table-row-background-selected);
    }

    .size-panel {
        display: flex;

        .size {
            margin: 0;
            padding: @input-padding;
            color: transparent; // 透明
            line-height: @line-height;
        }

        .placeholder {
            width: 0;
            overflow: hidden;
            line-height: @line-height;
        }
    }

    .input {
        /* 位置: */
        position: absolute;
        top: 0;
        left: 0;
        /* 尺寸: */
        width: auto;
        min-width: 50px;
        box-sizing: border-box;
        border: 0;
        padding: @input-padding;
        /* 颜色: */
        outline: none;
        box-shadow: none;
        background: transparent;
        /* 文本: */
        resize: none;
        overflow: hidden;
        user-select: text;
        white-space: pre-wrap; // 保留手动换行符
        overflow-wrap: normal; // 禁用自动换行
        line-height: @line-height;
    }
}
</style>