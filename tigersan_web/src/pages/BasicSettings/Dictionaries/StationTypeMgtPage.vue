<template>
    <DictionaryPage :model="model"></DictionaryPage>
</template>

<script lang="ts" setup>
import DictionaryPage from '../DictionaryPage.vue'
import { DictionaryModel, stationTypeHelper } from '@/models'

const model = new DictionaryModel('基站类型', stationTypeHelper)
</script>

<style lang="less" scoped></style>