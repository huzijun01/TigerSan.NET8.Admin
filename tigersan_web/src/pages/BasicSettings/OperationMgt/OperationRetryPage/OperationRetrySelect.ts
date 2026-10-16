import { DatePickerModel, DateType, SelectModel, SearchModel } from '@/0_tigersan_ui/tigerui'

const searchMacAddr = new SearchModel()
searchMacAddr.Placeholder.value = '请输入MAC地址'

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
eqpTypeSelect.Value.value = 'MBT02可连接资产标签'
eqpTypeSelect.Items.push(...[
    'MBT02可连接资产标签',
    'MBT02资产中继器',
    'MST03 Light Sensor',
])

const date = new DatePickerModel()
date._type = DateType.datetimerange
date._onChange = value => {
    console.log(value)
}

export default {
    searchMacAddr,
    operationTypeSelect,
    eqpTypeSelect,
    date,
}