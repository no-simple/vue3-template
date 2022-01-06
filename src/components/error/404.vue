<template>
  <div class="error">
    <div class="wrap">
      <p class="error_p fade_animition-top">404</p>
      <p class="error_text fade_animition">你访问的页面不存在</p>
      <el-button type="primary" v-show="goHomeVisible" @click="_toHome" class="common_btn-defalut fade_animition">返回首页</el-button>
    </div>
    <img src="./404.png" class="error_img fade_img-animition" alt="">
  </div>
</template>

<script>
import { getLocalStorageItem } from '@/utils/storage-helper'
import { USER_TOKEN } from '@/utils/constant'

export default {
  data () {
    return {
      goHomeVisible: true,
    }
  },
  methods: {
    // 登出
    _toHome () {
      // this.$store.commit('_logOut')
      this.$router.push('/')
    }
  },
  created () {
    if (getLocalStorageItem(USER_TOKEN) === null) {
      this.goHomeVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
@import url('./common.less');
</style>
