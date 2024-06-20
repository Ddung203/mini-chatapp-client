<script setup>
  import { onMounted, ref, watch } from "vue";
  import router from "../routes/index";
  import useAuthStore from "../stores/auth";
  import useKeyStore from "../stores/key";
  import useSocketStore from "../stores/socket";

  const authStore = useAuthStore();
  const keyStore = useKeyStore();
  const socketStore = useSocketStore();

  const newMessage = ref("Hello");

  const sendMessageHandler = async () => {
    await socketStore.sendMessage(newMessage.value);
    newMessage.value = "";

    await socketStore.handleMessage();
  };

  // onMounted();
</script>

<template>
  <div class="flex flex-col w-[760px] h-full chatbox">
    <div
      v-if="authStore.getIsLoggedIn"
      class="flex-1 p-4 overflow-y-auto messages"
    >
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

      <!--  -->
      <div
        v-for="message in socketStore.oldMessages"
        :key="message.id"
        class="mb-2"
      >
        <strong
          :class="{
            'text-red-400':
              socketStore.receiver?.username === authStore.username,
          }"
        >
          <span>{{ message.senderUsername }}</span>
          <span v-if="message.senderUsername === authStore.username">
            (Me)</span
          ></strong
        >: {{ message.content }}
      </div>
    </div>
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
