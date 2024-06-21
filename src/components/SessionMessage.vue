<script setup>
  import { computed, onMounted, ref, watch } from "vue";
  import useAuthStore from "../stores/auth";
  import useKeyStore from "../stores/key.js";
  import useSocketStore from "../stores/socket";
  import notification from "../utils/notification.js";

  const authStore = useAuthStore();
  const keyStore = useKeyStore();
  const socketStore = useSocketStore();

  const filteredMessages = computed(() =>
    socketStore.curMessages.filter(
      (message) => message.to === socketStore.receiver?.username
    )
  );
</script>

<template>
  <div class="min-h-[70vh] p-4 bg-gray-200 sidebar">
    <h2 class="mb-4 text-xl font-bold">Tin nhắn phiên hiện tại</h2>
    <div class="max-h-[530px] w-[240px]">
      <span
        >To: <strong>{{ socketStore.receiver?.username }}</strong></span
      >
      <ul>
        <li
          v-for="(message, index) in filteredMessages"
          :key="index"
        >
          <strong>{{ message.time }}</strong
          >: {{ message.content }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
