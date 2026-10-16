<template>
    <DictionaryPage :model="model"></DictionaryPage>
</template>

<script lang="ts" setup>
import DictionaryPage from '../DictionaryPage.vue'
import { DictionaryModel, siteTypeHelper } from '@/models'

const model = new DictionaryModel('场地类型', siteTypeHelper, true)
</script>

<style lang="less" scoped></style>