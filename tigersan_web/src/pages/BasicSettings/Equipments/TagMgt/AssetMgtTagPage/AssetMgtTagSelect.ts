import { Texts, SelectModel, SearchModel } from '@/0_tigersan_ui/tigerui'

const searchMacAddr = new SearchModel()
searchMacAddr.Placeholder.value = Texts.MacAddr

const typeSelect = new SelectModel()
typeSelect.Width.value = 300
typeSelect.Value.value = 'MBT02 可连接资产标签'
typeSelect.Items.push(...[
    'MBT02 可连接资产标签',
    'MBT02 资产中继器',
    'MTB04 5G资产标签',
])

const selectState = new SelectModel()
selectState.Width.value = 120
selectState.Value.value = '全部'
selectState.Items.push(...['全部', '在线', '离线'])

const firmwareSelect = new SelectModel()
firmwareSelect.Width.value = 120
firmwareSelect.Value.value = '全部'
firmwareSelect.Items.push(...[
    '全部',
    '3.2.0'
])

export default {
    searchMacAddr,
    typeSelect,
    selectState,
    firmwareSelect,
}