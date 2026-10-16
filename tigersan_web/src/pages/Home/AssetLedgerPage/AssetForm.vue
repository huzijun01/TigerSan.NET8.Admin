<template>
    <PopForm :model="form.assetForm">
        <FormRow>
            <FormItem :model="form.configCompany.ItemModel">
                <Select :model="form.selectCompanyForm" />
            </FormItem>
            <FormItem :model="form.configDepartment.ItemModel">
                <Select :model="form.selectDepartmentForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configAssetType.ItemModel">
                <Select :model="form.selectAssetTypeForm" />
            </FormItem>
            <FormItem :model="form.configIsAuto.ItemModel">
                <Select :model="form.selectIsAutoForm" />
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configAssetId.ItemModel">
                <input type="text" v-model="form.configAssetId.Target.value">
            </FormItem>
            <FormItem :model="form.configTagId.ItemModel">
                <input type="text" v-model="form.configTagId.Target.value" :disabled="!form.IsTagIdEnable.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configName.ItemModel">
                <input type="text" v-model="form.configName.Target.value">
            </FormItem>
            <FormItem :model="form.configComment.ItemModel">
                <input type="text" v-model="form.configComment.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="form.configVehicle.ItemModel">
                <Select :model="form.selectVehicleForm" />
            </FormItem>
        </FormRow>
    </PopForm>
</template>

<script lang="ts" setup>
import { onMounted, type PropType } from 'vue'
import { Select, PopForm, FormRow, FormItem } from '@/0_tigersan_ui/tigerui'
import { AssetFormModel } from './AssetFormModel'
// 【字段】:
const { form } = defineProps({
    form: {
        type: Object as PropType<AssetFormModel>,
        default: () => new AssetFormModel()
    }
})

// 【过程】:
onMounted(async () => {
    await form.RefreshForm()
})
// 【方法】:
</script>

<style lang="less" scoped></style>