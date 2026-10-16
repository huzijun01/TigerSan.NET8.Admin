<template>
    <DictionaryPage :model="dictionaryModel"></DictionaryPage>
</template>

<script lang="ts" setup>
import DictionaryPage from '../DictionaryPage.vue'
import { DictionaryModel, stationTypeHelper } from '@/models'

const dictionaryModel = new DictionaryModel('基站类型', stationTypeHelper)
</script>

<style lang="less" scoped></style>