<template>
    <div class="search flex-stretch">
        <input type="text" v-model="model.Value.value" :placeholder="model.ShowPlaceholder.value"
            :readonly="model.IsReadonly.value" :style="model.WidthStyle.value" @input="model.OnInput"
            @change="model.OnChange" @keyup.enter="model.OnEnter">
        <div class="button-panel flex-center">
            <div class="button iconfont" @click="model.OnSearch">{{ Icons.Search }}</div>
            <div class="button iconfont" @click="model.OnClear">{{ Icons.Close_Circle }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icons } from '../../base'
import { SearchModel } from '../../models'

const { model } = defineProps({
    model: {
        type: SearchModel,
        default: () => new SearchModel()
    }
})
</script>

<style lang="less" scoped>
@size: 16px;

.search {
    position: relative;

    &>input {
        padding-right: 57px;
    }

    .button-panel {
        position: absolute;
        top: 0px;
        right: 0px;
        height: 100%;

        .button {
            width: @size;
            height: @size;
            font-size: @size;
            line-height: 1;
            cursor: pointer;
            margin-right: 10px;
            color: var(--color-placeholder-text);
        }
    }
}
</style>