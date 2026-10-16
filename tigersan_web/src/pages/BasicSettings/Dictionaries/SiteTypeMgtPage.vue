<template>
    <DictionaryPage :model="dictionaryModel"></DictionaryPage>
</template>

<script lang="ts" setup>
import DictionaryPage from '../DictionaryPage.vue'
import { DictionaryModel, siteTypeHelper } from '@/models'

const dictionaryModel = new DictionaryModel('场地类型', siteTypeHelper, true)
</script>

<style lang="less" scoped></style>