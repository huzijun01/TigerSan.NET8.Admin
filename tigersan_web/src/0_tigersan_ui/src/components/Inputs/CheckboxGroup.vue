<template>
    <div class="checkbox-group flex-right" ref="refGroup">
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, watch } from 'vue';
import { CheckboxGroupModel } from '../../models'

// 字段:
const { model } = defineProps({
    model: {
        type: CheckboxGroupModel,
        default: () => new CheckboxGroupModel()
    }
})

const refGroup = shallowRef<HTMLElement | undefined>()
const checkboxes = ref<HTMLInputElement[]>([])

// 过程:
watch(refGroup, () => {
    updateCheckboxes()
})

// 方法:
function updateCheckboxes() {
    if (!refGroup.value) return;

    // 使用 querySelectorAll 获取所有后代 checkbox
    const checkboxElements = refGroup.value.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"]'
    )

    // 转换为数组并更新响应式引用
    checkboxes.value = Array.from(checkboxElements)
    checkboxes.value.forEach(ckb => {
        ckb.onchange = UpdateValues
    })

    UpdateValues()
}

function UpdateValues() {
    const checked = checkboxes.value.filter(cb => cb.checked)
    const values = checked.map(c => c.value)
    model.Values.value = values
    model.OnChange()
}
</script>

<style lang="less" scoped></style>