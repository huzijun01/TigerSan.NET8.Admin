<template>
    <div class="beian-panel flex-center">
        <span>{{ company }}</span>
        <span class="separator">|</span>
        <a :href="link" target="_blank" rel="noopener noreferrer" class="beian-link">{{ beian }}</a>
    </div>
</template>

<script lang="ts" setup>
const { company, beian, link } = defineProps({
    company: {
        type: String,
        default: 'company'
    },
    beian: {
        type: String,
        default: 'beian'
    },
    link: {
        type: String,
        default: '#'
    },
})
</script>

<style lang="less" scoped>
.beian-panel {
    &>* {
        color: var(--theme-color-placeholder);
    }
}
</style>