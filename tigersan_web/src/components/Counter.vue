<template>
    <div class="counter flex-center">
        <div class="box">
            <h2>Counter</h2>
            <div>sum = {{ sum }}</div>
            <button @click="Add">Add</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { DialogHelper } from '@/0_tigersan_ui/tigerui'

let sum = ref(0)

function Add() {
    ++sum.value
    DialogHelper.Information(`sum = ${sum.value}`)
}
</script>

<style lang="less" scoped>
.counter {
    flex-direction: column;

    .box {
        button {
            margin-top: 15px;
        }
    }
}
</style>