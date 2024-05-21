<script setup>
  import { onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { useConditionStore, useMessageStore } from "../stores/index.js";
  import { io } from "socket.io-client";

  const store = useConditionStore();
  const storeMessage = useMessageStore();

  const newMessage = ref("");
  const socket = ref(null);
  const rooms = ref([]);

  const joinRoom = (roomID) => {
    if (!socket.value) return;

    socket.value.emit("joinRoom", roomID);
    storeMessage.setMessages([]);

    socket.value.on("history", (messages) => {
      storeMessage.setMessages(messages);
    });
  };

  const sendMessage = () => {
    if (
      !socket.value ||
      !storeMessage.curRoomID ||
      newMessage.value.trim() === ""
    )
      return;

    const message = {
      roomID: storeMessage.curRoomID,
      data: {
        content: newMessage.value,
        conversationId: storeMessage.curRoomID,
        id: socket.value.id,
        senderUsername: store.username,
        receiverUsername: storeMessage.receiverUsername,
      },
    };

    socket.value.emit("sendMessage", message);
    newMessage.value = "";

    socket.value.on("chat message", (messages) => {
      storeMessage.setMessages(messages);
    });
    // storeMessage.messages.push(message.data);
  };

  // Watch for changes in curRoomID and join the new room
  watch(
    () => storeMessage.curRoomID,
    (newRoomID) => {
      if (newRoomID) {
        // console.log("newRoomID :>> ", newRoomID);
        joinRoom(newRoomID);
      }
    }
  );

  // 1
  onMounted(() => {
    socket.value = io("http://localhost:8181/");

    socket.value.on("connect", () => {
      // console.log("socket.id :>> ", socket.value.id);
      // Tham gia vào phòng hiện tại nếu đã có
      // if (storeMessage.curRoomID && storeMessage.curRoomID >= 0) {
      //   joinRoom(storeMessage.curRoomID);
      // }
    });

    socket.value.on("roomList", (roomList) => {
      rooms.value = roomList;
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
