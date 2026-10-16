<template>
    <table class="form-panel" :style="styleObj">
        <tbody>
            <slot></slot>
        </tbody>
    </table>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

let { marginH, marginV } = defineProps({
    marginH: {
        type: Number,
        default: 20
    },
    marginV: {
        type: Number,
        default: 25
    }
})

const styleObj = computed(
    () => {
        return {
            borderSpacing: `${marginH}px ${marginV}px`
        }
    }
)
</script>

<style lang="less" scoped>
table {
    border-collapse: separate;
}
</style>