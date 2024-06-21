<script setup>
  import { ref } from "vue";
  import useAuthStore from "../stores/auth";

  const authStore = useAuthStore();
</script>

<template>
  <div class="mt-[20px] flex flex-col items-center justify-center gap-5">
    <h1 class="text-xl font-bold">Thông tin tài khoản người dùng</h1>
    <p>Không có thông tin hihi</p>
    <router-link to="/">
      <Button>Quay lại</Button>
    </router-link>
  </div>
</template>

<style scoped>
  /*  */
</style>
