<script setup>
  import { ref } from "vue";
  import useAuthStore from "../stores/auth";

  const authStore = useAuthStore();
</script>

<template>
  <h1>template check</h1>
  <p>{{ authStore.username }}</p>
</template>

<style scoped>
  /*  */
</style>
