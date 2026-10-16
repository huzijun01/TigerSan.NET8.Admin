<template>
    <!-- 灯光设置: -->
    <DrawerBox :model="lightSettingDrawerBox">
        <div class="setting-panel">
            <!-- 设置内容: -->
            <div class="setting-content">
                <!-- 基础设置: -->
                <Form>
                    <FormRow>
                        <FormItem :model="form.configProductType.ItemModel">
                            <Select :model="select.typeSelect" />
                        </FormItem>
                        <FormItem :model="form.configFirmwareVersion.ItemModel">
                            <Select :model="select.firmwareSelect" />
                        </FormItem>
                    </FormRow>
                    <FormRow>
                        <FormItem :model="form.configEnable.ItemModel">
                            <Switch :model="form.enableSwitch"></Switch>
                        </FormItem>
                    </FormRow>
                </Form>

                <!-- 灯色: -->
                <Form>
                    <FormRow>
                        <FormItem :model="form.configLightColor.ItemModel">
                            <CheckboxGroup :model="form.colorGroup">
                                <Checkbox :model="form.redCheckbox"></Checkbox>
                                <Checkbox :model="form.blueCheckbox"></Checkbox>
                                <Checkbox :model="form.greenCheckbox"></Checkbox>
                                <Checkbox :model="form.yelloCheckbox"></Checkbox>
                                <Checkbox :model="form.whiteCheckbox"></Checkbox>
                            </CheckboxGroup>
                        </FormItem>
                    </FormRow>
                </Form>

                <!-- 单次亮灯时长: -->
                <Form>
                    <FormRow>
                        <FormItem :model="form.configLightTime.ItemModel">
                            <Form>
                                <FormRow>
                                    <span>快：</span>
                                </FormRow>
                                <FormRow>
                                    <FormItem :model="form.configFlash_Fast_On.ItemModel">
                                        <input type="text" class="num" v-model="form.configFlash_Fast_On.Target.value">
                                        <span> ms</span>
                                    </FormItem>
                                    <FormItem :model="form.configFlash_Fast_Off.ItemModel">
                                        <input type="text" class="num" v-model="form.configFlash_Fast_Off.Target.value">
                                        <span> ms</span>
                                    </FormItem>
                                </FormRow>
                                <FormRow>
                                    <span>较快：</span>
                                </FormRow>
                                <FormRow>
                                    <FormItem :model="form.configFlash_Faster_On.ItemModel">
                                        <input type="text" class="num"
                                            v-model="form.configFlash_Faster_On.Target.value">
                                        <span> ms</span>
                                    </FormItem>
                                    <FormItem :model="form.configFlash_Faster_Off.ItemModel">
                                        <input type="text" class="num"
                                            v-model="form.configFlash_Faster_Off.Target.value">
                                        <span> ms</span>
                                    </FormItem>
                                </FormRow>
                                <FormRow>
                                    <span>中：</span>
                                </FormRow>
                                <FormRow>
                                    <FormItem :model="form.configFlash_Medium_On.ItemModel">
                                        <input type="text" class="num"
                                            v-model="form.configFlash_Medium_On.Target.value">
                                        <span> ms</span>
                                    </FormItem>
                                    <FormItem :model="form.configFlash_Medium_Off.ItemModel">
                                        <input type="text" class="num"
                                            v-model="form.configFlash_Medium_Off.Target.value">
                                        <span> ms</span>
                                    </FormItem>
                                </FormRow>
                                <FormRow>
                                    <span>较慢：</span>
                                </FormRow>
                                <FormRow>
                                    <FormItem :model="form.configFlash_Slower_On.ItemModel">
                                        <input type="text" class="num"
                                            v-model="form.configFlash_Slower_On.Target.value">
                                        <span> ms</span>
                                    </FormItem>
                                    <FormItem :model="form.configFlash_Slower_Off.ItemModel">
                                        <input type="text" class="num"
                                            v-model="form.configFlash_Slower_Off.Target.value">
                                        <span> ms</span>
                                    </FormItem>
                                </FormRow>
                                <FormRow>
                                    <span>慢：</span>
                                </FormRow>
                                <FormRow>
                                    <FormItem :model="form.configFlash_Slow_On.ItemModel">
                                        <input type="text" class="num" v-model="form.configFlash_Slow_On.Target.value">
                                        <span> ms</span>
                                    </FormItem>
                                    <FormItem :model="form.configFlash_Slow_Off.ItemModel">
                                        <input type="text" class="num" v-model="form.configFlash_Slow_Off.Target.value">
                                        <span> ms</span>
                                    </FormItem>
                                </FormRow>
                            </Form>
                        </FormItem>
                    </FormRow>
                </Form>
            </div>

            <!-- 按钮容器: -->
            <div class="button-panel">
                <Form>
                    <FormRow>
                        <FormItem>
                            <button>恢复默认值</button>
                            <button>保存</button>
                        </FormItem>
                    </FormRow>
                </Form>
            </div>
        </div>
    </DrawerBox>
</template>

<script lang="ts" setup>
import form from './LightSettingForm'
import select from './LightSettingSelect'
import {
    Form,
    Select,
    Switch,
    FormRow,
    FormItem,
    Checkbox,
    CheckboxGroup,
    DrawerBox,
    DrawerBoxModel,
} from '@/0_tigersan_ui/tigerui'

// 抽屉盒子:
const lightSettingDrawerBox = new DrawerBoxModel()
lightSettingDrawerBox.Title.value = '设备亮灯'
lightSettingDrawerBox.ContentMaxHeight.value = 820

// 选择框:
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

.checkbox {
    margin-right: 30px;
}
</style>