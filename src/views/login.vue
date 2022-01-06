<script setup lang="ts">
  import { USER_TOKEN } from '@/utils/constant'
  import { useRouter } from 'vue-router'

  const Router = useRouter()
  const token =
    'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJmMWNjNmZhNC03MWEyLTRlMmItODU3Zi1kNTQyNjZkMGFjZmEiLCJ1c2VySWQiOiJhNzNkYzRhZGZjZjZhM2EzNjRkYTZkODhjNDUwYjJhZiIsImNsaWVudElkIjoicHJvcGVydHlfYl91c2VyIiwidGVuYW50SWQiOiJmYTY3MGE2YjY1MzkyNWJkNTVlZTcyODZmODAwMzAzNyIsImlwIjoiMTkyLjE2OC40MS4xMDAiLCJsb2dpblNvdXJjZSI6IldFQiIsImFjY291bnRUeXBlIjozLCJleHAiOjE2NTAwNzkwMjV9.cOvJuVQwWHbkLKtugHBPIyANOhSNrW4gDLCQwfKA85M'
  // 登录
  const onLogin = (): void => {
    localStorage.setItem(USER_TOKEN, token)
    Router.replace('/')
  }
</script>

<template>
  <el-button @click="onLogin">登录</el-button>
</template>
