<template>
  <div class="app-panel flex-stretch full-view">
    <RouterPage />
  </div>
</template>

<script lang="ts" setup>
import Home from "@/routes/Home/Home.vue"
import Login from "@/routes/Login/Login.vue"
import { createRouter, RouterPage } from '@/0_tigersan_ui/tigerui'
import { InitTree } from './navs/navModel'

InitTree()

createRouter([
  {
    path: '/',
    component: Login
  },
  {
    path: 'Home',
    component: Home
  },
])
</script>

<style lang="less" scoped></style>