import { ref } from 'vue'
import { Verify, FormModel, FormConfig, FormItemConfig, Texts } from '@/0_tigersan_ui/tigerui'

/** “预警设置”模型 */
class AlarmSettingModel {
    /** 电量预警值 */
    BatteryAlarmRate = 0
    /** 设备离线时间（分钟） */
    EqpOfflineMinutes = 0
    /** 设备离线时间（秒） */
    EqpOfflineSeconds = 0
}

/** “预警设置”实例 */
const alarmSetting = new AlarmSettingModel()
alarmSetting.BatteryAlarmRate = 20
alarmSetting.EqpOfflineMinutes = 0
alarmSetting.EqpOfflineSeconds = 20

/** “电量预警值”项目配置 */
const configBatteryAlarmRate: FormItemConfig<AlarmSettingModel, string> = {
    _propName: 'BatteryAlarmRate',
    PropText: '电量预警值',
    IsEquired: true,
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.BatteryAlarmRate, 1, 100)
    }
}

/** “设备离线时间（分钟）”项目配置 */
const configEqpOfflineMinutes: FormItemConfig<AlarmSettingModel, string> = {
    _propName: 'EqpOfflineMinutes',
    PropText: '设备离线时间',
    IsEquired: true,
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.EqpOfflineMinutes, 0, 1000)
    }
}

/** “设备离线时间（秒）”项目配置 */
const configEqpOfflineSeconds: FormItemConfig<AlarmSettingModel, string> = {
    _propName: 'EqpOfflineSeconds',
    PropText: '',
    Target: ref(),
    _isVerifyOk: source => {
        return Verify.IsWithinRange(source.EqpOfflineSeconds, 1, 59)
    }
}

/** “增”源数据获取方法 */
const GetSource = () => {
    return alarmSetting
}

/** “预警设置”表单配置 */
let configAlarmSettingForm: FormConfig<AlarmSettingModel> = {
    _getSource: GetSource,
    _itemConfigs: [
        configBatteryAlarmRate,
        configEqpOfflineSeconds,
        configEqpOfflineMinutes,
    ]
}

/** “预警设置”表单模型 */
const alarmSettingForm = new FormModel(configAlarmSettingForm)

export default {
    alarmSettingForm,
    configBatteryAlarmRate,
    configEqpOfflineMinutes,
    configEqpOfflineSeconds,
}