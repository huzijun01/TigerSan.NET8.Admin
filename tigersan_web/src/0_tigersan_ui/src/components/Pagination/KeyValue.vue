<template>
    <div v-if="isShow" class="key-value ellipsis" :style="marginRightStyle" @contextmenu.prevent="Copy">
        <span>{{ propName }}</span>
        <span>{{ Texts.Colon.value }}</span>
        <a v-if="isLink" :style="ColorStyle" @click="click()">{{ propValue }}</a>
        <span v-if="!isLink" :style="ColorStyle">{{ propValue }}</span>
    </div>
</template>

<script lang="ts" setup>
import { computed, type PropType, type StyleValue } from 'vue'
import { Theme } from '../../base'
import { Texts } from '../../texts'
import { AnyTypes } from '../../types'
import { CopyBehavior, StringHelper } from '../../helpers'

// 字段:
let { propName, propValue, color, marginRight, isLink, isAutoHidden, click } = defineProps({
    propName: {
        type: String,
        default: 'name'
    },
    propValue: {
        type: AnyTypes as PropType<any>,
        default: ''
    },
    color: {
        type: String,
        default: Theme.Brand
    },
    marginRight: {
        type: Number,
        default: 15
    },
    isLink: {
        type: Boolean,
        default: false
    },
    isAutoHidden: {
        type: Boolean,
        default: false
    },
    click: {
        type: Function,
        default: () => { }
    }
})

const ColorStyle: StyleValue = {
    'color': color,
    'user-select': 'text',
}

const marginRightStyle: StyleValue = {
    'marginRight': `${marginRight}px`,
}

const isShow = computed(() => { return !(isAutoHidden && !StringHelper.IsNotEmpty(propValue)) })

function Copy(event: MouseEvent) {
    CopyBehavior.Copy(propValue, event)
}
</script>

<style lang="less" scoped></style>