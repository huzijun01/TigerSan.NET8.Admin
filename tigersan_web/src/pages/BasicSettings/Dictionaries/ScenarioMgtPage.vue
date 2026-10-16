<template>
    <DictionaryPage :model="model"></DictionaryPage>
</template>

<script lang="ts" setup>
import DictionaryPage from '../DictionaryPage.vue'
import { DictionaryModel, scenarioHelper } from '@/models'
const model = new DictionaryModel('场景', scenarioHelper)
</script>

<style lang="less" scoped></style>