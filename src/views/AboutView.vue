<script setup>
  import { ref } from "vue";
  import useAuthStore from "../stores/auth";
  const authStore = useAuthStore();
</script>

<template>
  <h1>template</h1>
  <router-link to="/">
    <Button>Chuyen trang</Button>
  </router-link>
</template>

<style scoped>
  /*  */
</style>
