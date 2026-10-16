<template>
    <DictionaryPage :model="dictionaryModel"></DictionaryPage>
</template>

<script lang="ts" setup>
import DictionaryPage from '../DictionaryPage.vue'
import { DictionaryModel, tagTypeHelper } from '@/models'

const dictionaryModel = new DictionaryModel('标签类型', tagTypeHelper)
</script>

<style lang="less" scoped></style>