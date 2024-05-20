<script setup>
  import { onBeforeUnmount, onMounted, ref } from "vue";
  import { useConditionStore, useMessageStore } from "../stores/index.js";
  import { io } from "socket.io-client";

  const store = useConditionStore();
  const storeMessage = useMessageStore();

  const newMessage = ref("");
  const socket = ref(null);

  function computeUserIdFromHeaders(headers) {
    console.log("headers :>> ", headers);
    return storeMessage.messages[0]?.conversationId;
  }

  const sendMessage = () => {
    if (newMessage.value.trim() !== "") {
      const message = {
        id: storeMessage.messages.length + 1,
        user: "Me",
        text: newMessage.value,
      };
      storeMessage.messages.push(message);
      socket.value.emit("sendMessage", message);
      newMessage.value = "";
    }
  };

  onMounted(() => {
    socket.value = io("http://localhost:8181/");

    socket.value.on("connect", () => {
      console.log("socket.id :>> ", socket.value.id);
      console.log(socket.value.connected);
    });

    socket.value.on("disconnect", () => {
      console.log("disconnect");
      console.log(socket.value.connected);
    });

    socket.value.on("history", (history) => {
      console.log("history :>> ", history);
      storeMessage.messages = history;
    });

    socket.value.on("chat message", (message) => {
      console.log("chat message :>> ", message);
      storeMessage.messages.push(message);
    });
  });

  onBeforeUnmount(() => {
    if (socket.value) {
      socket.value.disconnect();
    }
  });
</script>

<template>
  <div class="flex flex-col w-[760px] h-full chatbox">
    <div
      v-if="store.isLoggedIn"
      class="flex-1 p-4 overflow-y-auto messages"
    >
      <p
        v-if="storeMessage.messages[0]?.conversationId"
        class="pb-4"
      >
        Mã phòng:
        <strong>{{ storeMessage.messages[0]?.conversationId }}</strong>
      </p>
      <div
        v-for="message in storeMessage.messages"
        :key="message.id"
        class="mb-2"
      >
        <strong>{{ message.senderUsername }}</strong
        >: {{ message.content }}
      </div>
    </div>
    <div class="flex gap-2 p-4 border-t border-gray-300 input-box">
      <InputText
        class="w-full p-2 border rounded"
        type="text"
        placeholder="Type a message..."
        v-model="newMessage"
      />
      <Button
        class="w-24"
        type="submit"
        label="Gửi"
        @click="sendMessage"
        rounded
        :disabled="!store.isLoggedIn || newMessage.trim() === ''"
      />
    </div>
  </div>
</template>

<style scoped>
  .messages {
    height: calc(100% - 50px);
  }
</style>
