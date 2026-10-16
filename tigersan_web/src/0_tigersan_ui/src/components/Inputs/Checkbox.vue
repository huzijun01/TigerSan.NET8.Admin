<template>
    <div class="checkbox flex-right" :class="{ 'disabled': model.IsReadonly.value }">
        <input type="checkbox" :id="model._id" v-model="model.IsChecked.value" :value="model.Value.value"
            :disabled="model.IsReadonly.value" @change="model.OnChange">
        <label class="text" :for="model._id">{{ model.Text.value }}</label>
    </div>
</template>

<script lang="ts" setup>
import { CheckboxModel } from '../../models'

const { model } = defineProps({
    model: {
        type: CheckboxModel,
        default: () => new CheckboxModel()
    }
})
</script>

<style lang="less" scoped>
.checkbox {
    * {
        cursor: pointer;
    }

    &.disabled {
        * {
            cursor: not-allowed;
        }
    }

    .text {
        padding-left: 10px;
    }
}
</style>