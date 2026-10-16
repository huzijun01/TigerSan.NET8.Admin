<template>
    <div class="default-page flex-center">
        <span class="flex-center">{{ Texts.NoContent.value }}</span>
    </div>
</template>

<script lang="ts" setup>
import { Texts } from '../../texts'

</script>

<style lang="less" scoped>
.default-page {
    width: 100%;
    height: 100%;
    background: var(--theme-panel-background);
}
</style>