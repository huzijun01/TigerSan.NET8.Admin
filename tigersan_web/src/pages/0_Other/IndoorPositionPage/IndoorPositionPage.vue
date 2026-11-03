<template>
    <div class="indoor-position-panle">
        <div class="button-panel">
            <button class="bg-success" @click="model.Refresh">{{ Texts.Refresh.value }}</button>
            <button class="bg-success" :disabled="!model.IsEditing.value" @click="model.Save">
                {{ Texts.Save.value }}</button>
            <button class="bg-warning" :disabled="!model.AllowedEdit.value" @click="model.EditStation">
                {{ EditStation }}</button>
            <button class="bg-danger" :disabled="!model.IsEditing.value" @click="model.Cancel">
                {{ Texts.Cancel.value }}</button>
            <!-- <button class="bg-warning" :disabled="model.IsEditing.value" @click="model.EditLine">{{ EditLine }}</button> -->
            <!-- <button class="bg-warning" :disabled="model.IsEditing.value" @click="model.EditRect">{{ EditRect }}</button> -->
        </div>
        <div class="bottom-panel">
            <TabView :model="model.tabList" />
            <Svg :model="model._svg" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { TabView, TextModel, Texts, Svg } from '@/0_tigersan_ui/tigerui'
import { IndoorPositionPageModel } from './IndoorPositionPageModel'
const EditStation = TextModel.Computed('EditStation', '修改基站')
// const EditLine = TextModel.Computed('EditLine', '修改线')
// const EditRect = TextModel.Computed('EditRect', '修改矩形')

const { model } = defineProps({
    model: {
        type: IndoorPositionPageModel,
        default: () => new IndoorPositionPageModel()
    }
})

model.tagList.listStyle = model.stationList.listStyle = { height: `calc(100vh - 380px)` }

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
        text-wrap: nowrap;

        &>* {
            margin-right: 10px;
        }
    }

    .bottom-panel {
        display: grid;
        grid-template-columns: auto 1fr;
        margin-top: 16px;
        height: calc(100vh - 300px);
    }
}
</style>