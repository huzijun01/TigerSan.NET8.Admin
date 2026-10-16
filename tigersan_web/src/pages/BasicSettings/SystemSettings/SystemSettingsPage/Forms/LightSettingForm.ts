import { ref } from 'vue'
import { Verify, FormModel, FormConfig, FormItemConfig, SwitchModel, CheckboxModel, CheckboxGroupModel, Texts } from '@/0_tigersan_ui/tigerui'

/** “灯光设置”模型 */
class LightSettingModel {
    /** 设备类型 */
    ProductType?: string
    /** 固件版本 */
    FirmwareVersion?: string
    /** 是否启用 */
    Enable = false
    /** 灯色 */
    LightColor = []
    /** 闪烁时长（快、亮灯） */
    Flash_Fast_On = 200
    /** 闪烁时长（快、灭灯） */
    Flash_Fast_Off = 200
    /** 闪烁时长（较快、亮灯） */
    Flash_Faster_On = 500
    /** 闪烁时长（较快、灭灯） */
    Flash_Faster_Off = 500
    /** 闪烁时长（中、亮灯） */
    Flash_Medium_On = 1000
    /** 闪烁时长（中、灭灯） */
    Flash_Medium_Off = 1000
    /** 闪烁时长（较慢、亮灯） */
    Flash_Slower_On = 2000
    /** 闪烁时长（较慢、灭灯） */
    Flash_Slower_Off = 2000
    /** 闪烁时长（慢、亮灯） */
    Flash_Slow_On = 4000
    /** 闪烁时长（慢、灭灯） */
    Flash_Slow_Off = 4000
}

/** 组件模型 */
const enableSwitch = new SwitchModel()
const redCheckbox = new CheckboxModel()
redCheckbox.IsChecked.value = true
redCheckbox.Text.value = '红色'
redCheckbox.Value.value = '红色'
const blueCheckbox = new CheckboxModel()
blueCheckbox.Text.value = '蓝色'
blueCheckbox.Value.value = '蓝色'
const greenCheckbox = new CheckboxModel()
greenCheckbox.Text.value = '绿色'
greenCheckbox.Value.value = '绿色'
const yelloCheckbox = new CheckboxModel()
yelloCheckbox.Text.value = '黄色'
yelloCheckbox.Value.value = '黄色'
const whiteCheckbox = new CheckboxModel()
whiteCheckbox.Text.value = '白色'
whiteCheckbox.Value.value = '白色'
const colorGroup = new CheckboxGroupModel()

/** “灯光设置”实例 */
const lightSetting = new LightSettingModel()
lightSetting.ProductType = undefined
lightSetting.FirmwareVersion = undefined

/** “设备类型”项目配置 */
const configProductType: FormItemConfig<LightSettingModel, string> = {
    _propName: 'ProductType',
    PropText: '设备类型',
    IsEquired: true,
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsNotUndefinedOrEmpty(source.ProductType)
    }
}

/** “固件版本”项目配置 */
const configFirmwareVersion: FormItemConfig<LightSettingModel, string> = {
    _propName: 'FirmwareVersion',
    PropText: '固件版本',
    IsEquired: true,
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsNotUndefinedOrEmpty(source.FirmwareVersion)
    }
}

/** “是否启用”项目配置 */
const configEnable: FormItemConfig<LightSettingModel, boolean> = {
    _propName: 'Enable',
    PropText: '灯光设置',
    IsEquired: true,
    Target: enableSwitch.Value
}

/** “灯色”项目配置 */
const configLightColor: FormItemConfig<LightSettingModel, string[]> = {
    _propName: 'LightColor',
    PropText: '灯色',
    IsEquired: true,
    Target: colorGroup.Values,
    _isVerifyOk: source => {
        return Verify.IsArrayNotEmpty(source.LightColor)
    }
}

/** “单次亮灯时长”项目配置 */
const configLightTime: FormItemConfig<LightSettingModel, boolean> = {
    _propName: '',
    _propNameVerticalAlign: 'top',
    PropText: '单次亮灯时长',
    IsEquired: true,
    Target: enableSwitch.Value
}

/** “快、亮灯”项目配置 */
const configFlash_Fast_On: FormItemConfig<LightSettingModel, string> = {
    _propName: 'Flash_Fast_On',
    PropText: '亮灯',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Flash_Fast_On, 200, 65000)
    }
}

/** “快、灭灯”项目配置 */
const configFlash_Fast_Off: FormItemConfig<LightSettingModel, string> = {
    _propName: 'Flash_Fast_Off',
    PropText: '灭灯',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Flash_Fast_Off, 200, 65000)
    }
}

/** “较快、亮灯”项目配置 */
const configFlash_Faster_On: FormItemConfig<LightSettingModel, string> = {
    _propName: 'Flash_Faster_On',
    PropText: '亮灯',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Flash_Faster_On, 200, 65000)
    }
}

/** “较快、灭灯”项目配置 */
const configFlash_Faster_Off: FormItemConfig<LightSettingModel, string> = {
    _propName: 'Flash_Faster_Off',
    PropText: '灭灯',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Flash_Faster_Off, 200, 65000)
    }
}

/** “中、亮灯”项目配置 */
const configFlash_Medium_On: FormItemConfig<LightSettingModel, string> = {
    _propName: 'Flash_Medium_On',
    PropText: '亮灯',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Flash_Medium_On, 200, 65000)
    }
}

/** “中、灭灯”项目配置 */
const configFlash_Medium_Off: FormItemConfig<LightSettingModel, string> = {
    _propName: 'Flash_Medium_Off',
    PropText: '灭灯',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Flash_Medium_Off, 200, 65000)
    }
}

/** “较慢、亮灯”项目配置 */
const configFlash_Slower_On: FormItemConfig<LightSettingModel, string> = {
    _propName: 'Flash_Slower_On',
    PropText: '亮灯',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Flash_Slower_On, 200, 65000)
    }
}

/** “较慢、灭灯”项目配置 */
const configFlash_Slower_Off: FormItemConfig<LightSettingModel, string> = {
    _propName: 'Flash_Slower_Off',
    PropText: '灭灯',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Flash_Slower_Off, 200, 65000)
    }
}

/** “增”源数据获取方法 */
const GetSource = () => {
    return lightSetting
}

/** “慢、亮灯”项目配置 */
const configFlash_Slow_On: FormItemConfig<LightSettingModel, string> = {
    _propName: 'Flash_Slow_On',
    PropText: '亮灯',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Flash_Slow_On, 200, 65000)
    }
}

/** “慢、灭灯”项目配置 */
const configFlash_Slow_Off: FormItemConfig<LightSettingModel, string> = {
    _propName: 'Flash_Slow_Off',
    PropText: '灭灯',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Flash_Slow_Off, 200, 65000)
    }
}

/** “灯光设置”表单配置 */
let configLightSettingForm: FormConfig<LightSettingModel> = {
    _getSource: GetSource,
    _itemConfigs: [
        configProductType,
        configEnable,
        configFirmwareVersion,
        configLightColor,
        configLightTime,
        configFlash_Fast_On,
        configFlash_Fast_Off,
        configFlash_Faster_On,
        configFlash_Faster_Off,
        configFlash_Medium_On,
        configFlash_Medium_Off,
        configFlash_Slower_On,
        configFlash_Slower_Off,
        configFlash_Slow_On,
        configFlash_Slow_Off,
    ]
}

/** “灯光设置”表单模型 */
const lightSettingForm = new FormModel(configLightSettingForm)

export default {
    enableSwitch,
    redCheckbox,
    blueCheckbox,
    greenCheckbox,
    yelloCheckbox,
    whiteCheckbox,
    colorGroup,
    lightSettingForm,
    configProductType,
    configFirmwareVersion,
    configEnable,
    configLightColor,
    configLightTime,
    configFlash_Fast_On,
    configFlash_Fast_Off,
    configFlash_Faster_On,
    configFlash_Faster_Off,
    configFlash_Medium_On,
    configFlash_Medium_Off,
    configFlash_Slower_On,
    configFlash_Slower_Off,
    configFlash_Slow_On,
    configFlash_Slow_Off,
}