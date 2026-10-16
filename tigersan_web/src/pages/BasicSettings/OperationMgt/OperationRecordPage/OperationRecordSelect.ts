import { DatePickerModel, DateType, SelectModel } from '@/0_tigersan_ui/tigerui'

const operationTypeSelect = new SelectModel()
operationTypeSelect.Width.value = 150
operationTypeSelect.Value.value = '全部'
operationTypeSelect.Items.push(...[
    '全部',
    '修改参数',
    '升级',
    '亮灯',
    '恢复出厂',
    '关机',
    '连接状态',
    '参数同步',
    '响铃命令',
    '关灯命令',
    '亮灯&响铃',
    '设备导入',
    '关闭铃声',
    '传感器',
])

const eqpTypeSelect = new SelectModel()
eqpTypeSelect.Width.value = 350
eqpTypeSelect.Value.value = undefined
eqpTypeSelect.Items.push(...[
    'MWC03 4G智能工牌',
    'MBT02 可连接资产标签',
    'MBT02 资产中继器',
    'MTB04 5G资产标签',
    'MST03 资产测温标签',
    'MSR01-A 毫米波雷达传感器(人体存在版)',
    'MG8 4G迷你网关',
    'MG5 户外蜂窝网关',
    'MWC04 4G小型融合定位工牌',
    'MST03 光传感器（定制）',
    'MSR01-B 毫米波雷达传感器(人流量版)',
])

const date = new DatePickerModel()
date._type = DateType.datetimerange
date._onChange = value => {
    console.log(value)
}

export default {
    operationTypeSelect,
    eqpTypeSelect,
    date,
}