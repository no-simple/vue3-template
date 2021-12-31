<script setup lang="ts">
  import { getTenantId } from '@/api/login'
  import { userStore } from '@/store/user'

  const queryTeant = async () => {
    const { data } = await getTenantId({ tenantSign: 'zunyi' })
    console.log(data)
  }

  const userinfo = userStore()

  const updateName = () => {
    queryTeant()
    queryTeant()
    queryTeant()
    queryTeant()
    setTimeout(() => {
      queryTeant()
    }, 1000)
  }
</script>

<template>
  <div>{{ userinfo.name }}</div>
  <el-button @click="updateName">fff</el-button>
</template>

<style scoped>
  a {
    color: #42b983;
  }

  label {
    margin: 0 0.5em;
    font-weight: bold;
  }

  code {
    background-color: #eee;
    padding: 2px 4px;
    border-radius: 4px;
    color: #304455;
  }
</style>

<style lang="scss">
  div {
    color: red;
  }
</style>
