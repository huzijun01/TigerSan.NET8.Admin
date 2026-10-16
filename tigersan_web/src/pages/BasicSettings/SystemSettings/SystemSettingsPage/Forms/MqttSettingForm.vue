<template>
    <!-- 预警设置: -->
    <DrawerBox :model="mqttSettingDrawerBox">
        <div class="setting-panel">
            <!-- 设置内容: -->
            <div class="setting-content">
                <!-- 基础设置: -->
                <Form>
                    <FormRow>
                        <FormItem :model="itemIsListening">
                            <Switch :model="form.switchIsListening" />
                        </FormItem>
                        <FormItem>
                            <KeyValue :propName="Texts.LastReportTime.value" :propValue="form.LastReportTime.value" />
                        </FormItem>
                    </FormRow>
                </Form>
            </div>

            <!-- 按钮容器: -->
            <div class="button-panel">
                <Form>
                    <FormRow>
                        <FormItem>
                            <div class="button-panel">
                                <button @click="form.Refresh">{{ Texts.Refresh.value }}</button>
                                <button @click="form.Save">{{ Texts.Save.value }}</button>
                            </div>
                        </FormItem>
                    </FormRow>
                </Form>
            </div>
        </div>
    </DrawerBox>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { Form, FormRow, FormItem, DrawerBox, DrawerBoxModel, Switch, Texts, KeyValue, FormItemModel, TextModel } from '@/0_tigersan_ui/tigerui'
import { MqttSettingForm } from './MqttSettingForm'

const form = new MqttSettingForm()

// 抽屉盒子:
const mqttSettingDrawerBox = new DrawerBoxModel()
mqttSettingDrawerBox.Title.value = 'MQTT设置'

// 项目:
const itemIsListening = FormItemModel.GetDefault()
itemIsListening.PropText.value = TextModel.Computed('IsListening: ', '是否正在监听：')

onMounted(async () => {
    await form.Refresh()
})
</script>

<style lang="less" scoped>
.settings-page {
    display: flex;
    flex-direction: column;
    height: 100%; // 必须设置父容器高度

    .setting-panel {
        display: grid;
        grid-template-columns: 1fr auto;

        .setting-content {
            .num {
                width: 100px;
            }
        }

        .button-panel {
            button:not(:last-child) {
                margin-right: 10px;
            }
        }
    }
}
</style>