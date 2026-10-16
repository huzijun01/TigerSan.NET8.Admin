import { ref } from 'vue'
import { Verify, FormModel, FormConfig, FormItemConfig, SwitchModel, Texts } from '@/0_tigersan_ui/tigerui'

/** “响铃设置”模型 */
class RingingSettingModel {
    /** 设备类型 */
    ProductType?: string
    /** 固件版本 */
    FirmwareVersion?: string
    /** 是否启用 */
    Enable = false
    /** 闪烁时长（快、响铃） */
    Ringing_Fast_On = 200
    /** 闪烁时长（快、空闲） */
    Ringing_Fast_Off = 200
    /** 闪烁时长（较快、响铃） */
    Ringing_Faster_On = 500
    /** 闪烁时长（较快、空闲） */
    Ringing_Faster_Off = 500
    /** 闪烁时长（中、响铃） */
    Ringing_Medium_On = 1000
    /** 闪烁时长（中、空闲） */
    Ringing_Medium_Off = 1000
    /** 闪烁时长（较慢、响铃） */
    Ringing_Slower_On = 2000
    /** 闪烁时长（较慢、空闲） */
    Ringing_Slower_Off = 2000
    /** 闪烁时长（慢、响铃） */
    Ringing_Slow_On = 4000
    /** 闪烁时长（慢、空闲） */
    Ringing_Slow_Off = 4000
}

/** 组件模型 */
const enableSwitch = new SwitchModel()

/** “响铃设置”实例 */
const ringingSetting = new RingingSettingModel()
ringingSetting.ProductType = undefined
ringingSetting.FirmwareVersion = undefined

/** “设备类型”项目配置 */
const configProductType: FormItemConfig<RingingSettingModel, string> = {
    _propName: 'ProductType',
    PropText: '设备类型',
    IsEquired: true,
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsNotUndefinedOrEmpty(source.ProductType)
    }
}

/** “固件版本”项目配置 */
const configFirmwareVersion: FormItemConfig<RingingSettingModel, string> = {
    _propName: 'FirmwareVersion',
    PropText: '固件版本',
    IsEquired: true,
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsNotUndefinedOrEmpty(source.FirmwareVersion)
    }
}

/** “是否启用”项目配置 */
const configEnable: FormItemConfig<RingingSettingModel, boolean> = {
    _propName: 'Enable',
    PropText: '响铃设置',
    IsEquired: true,
    Target: enableSwitch.Value
}

/** “单次响铃时长”项目配置 */
const configRingingTime: FormItemConfig<RingingSettingModel, boolean> = {
    _propName: '',
    _propNameVerticalAlign: 'top',
    PropText: '单次响铃时长',
    IsEquired: true,
    Target: enableSwitch.Value
}

/** “快、响铃”项目配置 */
const configRinging_Fast_On: FormItemConfig<RingingSettingModel, string> = {
    _propName: 'Ringing_Fast_On',
    PropText: '响铃',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Ringing_Fast_On, 200, 65000)
    }
}

/** “快、空闲”项目配置 */
const configRinging_Fast_Off: FormItemConfig<RingingSettingModel, string> = {
    _propName: 'Ringing_Fast_Off',
    PropText: '空闲',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Ringing_Fast_Off, 200, 65000)
    }
}

/** “较快、响铃”项目配置 */
const configRinging_Faster_On: FormItemConfig<RingingSettingModel, string> = {
    _propName: 'Ringing_Faster_On',
    PropText: '响铃',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Ringing_Faster_On, 200, 65000)
    }
}

/** “较快、空闲”项目配置 */
const configRinging_Faster_Off: FormItemConfig<RingingSettingModel, string> = {
    _propName: 'Ringing_Faster_Off',
    PropText: '空闲',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Ringing_Faster_Off, 200, 65000)
    }
}

/** “中、响铃”项目配置 */
const configRinging_Medium_On: FormItemConfig<RingingSettingModel, string> = {
    _propName: 'Ringing_Medium_On',
    PropText: '响铃',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Ringing_Medium_On, 200, 65000)
    }
}

/** “中、空闲”项目配置 */
const configRinging_Medium_Off: FormItemConfig<RingingSettingModel, string> = {
    _propName: 'Ringing_Medium_Off',
    PropText: '空闲',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Ringing_Medium_Off, 200, 65000)
    }
}

/** “较慢、响铃”项目配置 */
const configRinging_Slower_On: FormItemConfig<RingingSettingModel, string> = {
    _propName: 'Ringing_Slower_On',
    PropText: '响铃',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Ringing_Slower_On, 200, 65000)
    }
}

/** “较慢、空闲”项目配置 */
const configRinging_Slower_Off: FormItemConfig<RingingSettingModel, string> = {
    _propName: 'Ringing_Slower_Off',
    PropText: '空闲',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Ringing_Slower_Off, 200, 65000)
    }
}

/** “增”源数据获取方法 */
const GetSource = () => {
    return ringingSetting
}

/** “慢、响铃”项目配置 */
const configRinging_Slow_On: FormItemConfig<RingingSettingModel, string> = {
    _propName: 'Ringing_Slow_On',
    PropText: '响铃',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Ringing_Slow_On, 200, 65000)
    }
}

/** “慢、空闲”项目配置 */
const configRinging_Slow_Off: FormItemConfig<RingingSettingModel, string> = {
    _propName: 'Ringing_Slow_Off',
    PropText: '空闲',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.Ringing_Slow_Off, 200, 65000)
    }
}

/** “响铃设置”表单配置 */
let configringingSettingForm: FormConfig<RingingSettingModel> = {
    _getSource: GetSource,
    _itemConfigs: [
        configProductType,
        configEnable,
        configFirmwareVersion,
        configRingingTime,
        configRinging_Fast_On,
        configRinging_Fast_Off,
        configRinging_Faster_On,
        configRinging_Faster_Off,
        configRinging_Medium_On,
        configRinging_Medium_Off,
        configRinging_Slower_On,
        configRinging_Slower_Off,
        configRinging_Slow_On,
        configRinging_Slow_Off,
    ]
}

/** “响铃设置”表单模型 */
const ringingSettingForm = new FormModel(configringingSettingForm)

export default {
    enableSwitch,
    ringingSettingForm,
    configProductType,
    configFirmwareVersion,
    configEnable,
    configRingingTime,
    configRinging_Fast_On,
    configRinging_Fast_Off,
    configRinging_Faster_On,
    configRinging_Faster_Off,
    configRinging_Medium_On,
    configRinging_Medium_Off,
    configRinging_Slower_On,
    configRinging_Slower_Off,
    configRinging_Slow_On,
    configRinging_Slow_Off,
}