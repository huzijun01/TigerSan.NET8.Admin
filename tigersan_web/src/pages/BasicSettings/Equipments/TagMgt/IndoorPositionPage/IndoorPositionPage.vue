<template>
    <PageCard>
        <div class="indoor-position-panle">
            <div class="button-panel">
                <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
                <button class="bg-success" :disabled="!model.IsEditing.value" @click="model.Save">
                    {{ Texts.Save.value }}</button>
                <button class="bg-danger" :disabled="!model.IsEditing.value" @click="model.Cancel">
                    {{ Texts.Cancel.value }}</button>
                <button :disabled="model.IsEditing.value" @click="model.AddStation1">{{ AddStation }}</button>
                <button :disabled="model.IsEditing.value" @click="model.EditLine">{{ EditingLine }}</button>
                <button :disabled="model.IsEditing.value" @click="model.EditRect">{{ EditingRect }}</button>
                <button :disabled="model.IsEditing.value" @click="model.EditCircle">{{ EditCircle }}</button>
            </div>
            <div class="bottom-panel">
                <TabView :model="model.tabList" />
                <Svg :model="model._svg">
                    <img :src="model.BgUrl.value" />
                </Svg>
            </div>
        </div>
    </PageCard>

    <!-- 表单: -->
    <PopForm :model="model.stationForm">
        <FormRow>
            <FormItem :model="model.configMacAddr.ItemModel">
                <input type="text" v-model="model.configMacAddr.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configX.ItemModel">
                <input type="text" disabled v-model="model.configX.Target.value">
            </FormItem>
        </FormRow>
        <FormRow>
            <FormItem :model="model.configY.ItemModel">
                <input type="text" disabled v-model="model.configY.Target.value">
            </FormItem>
        </FormRow>
    </PopForm>
</template>

<script lang="ts" setup>
import Svg from '@/models/Shapes/Svg.vue'
import { onMounted } from 'vue'
import { PopForm, FormRow, FormItem, PageCard, TabView, TextModel, Texts } from '@/0_tigersan_ui/tigerui'
import { IndoorPositionPageModel } from './IndoorPositionPageModel'
const model = new IndoorPositionPageModel()
const AddStation = TextModel.Computed('AddStation', '添加基站')
const EditingLine = TextModel.Computed('EditingLine', '修改线')
const EditingRect = TextModel.Computed('EditingRect', '修改矩形')
const EditCircle = TextModel.Computed('EditCircle', '修改圆')

onMounted(async () => {
    await model.Refresh()
})
</script>

<style lang="less" scoped>
.indoor-position-panle {
    display: grid;
    grid-template-rows: auto 1fr;
    flex-grow: 1;

    .button-panel {
        overflow: auto;
        margin-bottom: 15px;

        &>* {
            margin-right: 10px;
        }
    }

    .bottom-panel {
        display: grid;
        grid-template-columns: auto 1fr;
        margin-top: 16px;
        height: calc(100vh - 220px);
    }
}
</style>