<template>
    <DictionaryPage :model="model"></DictionaryPage>
</template>

<script lang="ts" setup>
import DictionaryPage from '../DictionaryPage.vue'
import { DictionaryModel, assetTypeHelper } from '@/models'

const model = new DictionaryModel('资产类型', assetTypeHelper, true)
</script>

<style lang="less" scoped></style>