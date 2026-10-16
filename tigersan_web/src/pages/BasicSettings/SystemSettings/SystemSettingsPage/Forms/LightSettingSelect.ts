import { SelectModel } from '@/0_tigersan_ui/tigerui'

const typeSelect = new SelectModel()
typeSelect.Width.value = 300
typeSelect.Value.value = undefined
typeSelect.Items.push(...[
    'MBT02可连接资产标签',
    'MBT02资产中继器',
])

const firmwareSelect = new SelectModel()
firmwareSelect.Width.value = 120
firmwareSelect.Value.value = undefined
firmwareSelect.Items.push(...[
])

export default {
    typeSelect,
    firmwareSelect
}