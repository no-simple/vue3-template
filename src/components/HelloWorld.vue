<script setup lang="ts">
  import { userStore } from '@/store/user'

  const userinfo = userStore()

  const updateName = () => {
    userinfo.$patch({
      name: 'yuxi',
    })
  }
</script>

<template>
  <div @click="updateName">{{ userinfo.name }}</div>
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
v