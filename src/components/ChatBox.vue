<script setup>
  import { onMounted, ref, watch } from "vue";
  import router from "../routes/index";
  import useAuthStore from "../stores/auth";
  import useKeyStore from "../stores/key";
  import useSocketStore from "../stores/socket";
  import { getCurrentTimeInTimezone, formatDate } from "../utils/iTime";

  const authStore = useAuthStore();
  const keyStore = useKeyStore();
  const socketStore = useSocketStore();

  const newMessage = ref("Hello");

  const sendMessageHandler = async () => {
    await socketStore.sendMessage(newMessage.value);
    socketStore.setCurMessages({
      to: socketStore.receiver.username,
      content: newMessage.value,
      time: getCurrentTimeInTimezone(7, "HH:mm:ss"),
    });
    newMessage.value = "";

    await socketStore.handleMessage();
  };

  const dateObject = (dateString) => {
    return new Date(dateString);
  };

  // onMounted();
</script>

<template>
  <div class="flex flex-col w-[400px] h-full chatbox">
    <div
      v-if="authStore.getIsLoggedIn"
      class="flex-1 p-4 overflow-y-auto messages"
    >
      <!-- Thông tin chat box hiện tại -->
      <div class="flex items-center justify-center gap-16 mb-3">
        <p class="">
          Mã phòng:
          <strong>{{ socketStore.roomID }}</strong>
        </p>

        <!--  -->
        <Button
          severity="primary"
          class=""
          :label="socketStore.receiver?.username"
          icon="pi pi-user"
        />
        <!--  -->
      </div>

      <!-- Tin nhắn -->
      <div
        v-for="message in socketStore.oldMessages"
        :key="message.id"
        class="mb-2"
      >
        <strong
          :class="{
            'text-red-400': message.senderUsername === authStore.username,
          }"
        >
          <span>{{ message.senderUsername }}</span>
          <span v-if="message.senderUsername === authStore.username">
            (Me)</span
          ></strong
        >:

        {{ message.content }}
        (<i class="text-sm">{{
          formatDate(dateObject(message.sentAt), "HH:mm:ss")
        }}</i
        >)
      </div>
    </div>

    <!-- Gửi tin nhắn -->
    <form
      class="flex gap-2 p-4 border-t border-gray-300 input-box"
      @submit.prevent="sendMessageHandler"
    >
      <InputText
        class="w-full p-2 border rounded"
        type="text"
        placeholder="Type a message..."
        v-model="newMessage"
      />
      <Button
        class="w-24"
        type="submit"
        icon="pi pi-send"
        iconPos="right"
        label="Gửi"
        rounded
        :disabled="
          !authStore.isLoggedIn ||
          newMessage.trim() === '' ||
          !socketStore.roomID
        "
      />
    </form>
  </div>
</template>

<style scoped>
  .messages {
    height: calc(100% - 50px);
  }
</style>
