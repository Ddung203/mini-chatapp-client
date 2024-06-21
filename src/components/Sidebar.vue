<script setup>
  import { onMounted, ref, watch } from "vue";
  import useAuthStore from "../stores/auth";
  import useKeyStore from "../stores/key.js";
  import useSocketStore from "../stores/socket";
  import notification from "../utils/notification.js";

  const authStore = useAuthStore();
  const keyStore = useKeyStore();
  const socketStore = useSocketStore();

  const joinRoomHandler = async (partnerUsername) => {
    if (authStore.getUsername !== partnerUsername) {
      socketStore.setReceiver({ username: partnerUsername });
      await socketStore.getRoomID(authStore.getUsername, partnerUsername);

      socketStore.joinRoom(socketStore.roomID);
      await keyStore.setReceiverPublicKey(partnerUsername);

      console.log("oldMessages :>> ", socketStore.oldMessages);

      socketStore.handleMessage();
    } else {
      console.log("Bạn không thể kết nối với chính mình");
      return;
    }

    return;
  };
</script>

<template>
  <div class="min-h-[70vh] p-4 bg-gray-200 sidebar">
    <h2 class="mb-4 text-xl font-bold">Danh sách bạn bè</h2>
    <div class="max-h-[530px] w-[240px] overflow-y-scroll overflow-x-hidden">
      <ul
        class="flex flex-col p-3 bg-white"
        v-if="authStore.isAuthenticated"
      >
        <li
          v-for="user in socketStore.userOnlineList"
          :key="user.id"
          class="pb-2"
        >
          <Button
            v-if="user.username !== authStore.getUsername"
            severity="primary"
            class="w-[200px]"
            :label="user.username"
            icon="pi pi-user"
            @click="joinRoomHandler(user.username)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
  .sidebar {
    border-right: 1px solid #ccc;
  }
</style>
