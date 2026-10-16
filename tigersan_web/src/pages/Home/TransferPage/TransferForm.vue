<template>
    <PopForm :model="model.form">
        <FormRow>
            <FormItem :model="model.configAssetId.ItemModel">
                <input type="text" v-model="model.configAssetId.Target.value" :readonly="model.IsAssetIdReadonly.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configCode.ItemModel">
                <input type="text" v-model="model.configCode.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configTarget.ItemModel">
                <Select :model="model.selectTargetForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configLogistics.ItemModel">
                <input type="text" v-model="model.configLogistics.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configDriver.ItemModel">
                <input type="text" v-model="model.configDriver.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configPhone.ItemModel">
                <input type="text" v-model="model.configPhone.Target.value">
            </FormItem>
        </FormRow>
    </PopForm>
</template>

<script lang="ts" setup>
import { PopForm, FormRow, FormItem, Select } from '@/0_tigersan_ui/tigerui'
import { TransferPageModel } from './TransferPageModel'

const { model } = defineProps({
    model: {
        type: TransferPageModel,
        default: () => new TransferPageModel()
    }
})

// 【方法】:
</script>

<style lang="less" scoped></style>