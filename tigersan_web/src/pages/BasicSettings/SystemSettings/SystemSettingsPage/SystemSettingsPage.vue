<template>
    <PageCard>
        <div class="settings-page">
            <MqttSettingForm></MqttSettingForm>
            <AlarmSettingForm></AlarmSettingForm>
            <LightSettingForm></LightSettingForm>
            <RingingSettingForm></RingingSettingForm>
        </div>
    </PageCard>
</template>

<script lang="ts" setup>
import { PageCard } from '@/0_tigersan_ui/tigerui'
import MqttSettingForm from './Forms/MqttSettingForm.vue'
import AlarmSettingForm from './Forms/AlarmSettingForm.vue'
import LightSettingForm from './Forms/LightSettingForm.vue'
import RingingSettingForm from './Forms/RingingSettingForm.vue'
</script>

<style lang="less" scoped>
.settings-page {
    display: flex;
    flex-direction: column;
    height: 100%; // 必须设置父容器高度

    .button-panel {
        &>button:not(:last-child) {
            margin-right: 10px;
        }
    }
}
</style>