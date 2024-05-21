<script setup>
  import { onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { useConditionStore, useMessageStore } from "../stores/index.js";
  import { io } from "socket.io-client";
  import router from "../routes/index";
  import { useToast } from "primevue/usetoast";
  import notification from "../utils/notification.js";
  import RSA from "../rsa/rsaMD.js";

  const toast = useToast();

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
    const token = localStorage.getItem("token");
    if (
      !socket.value ||
      !storeMessage.curRoomID ||
      newMessage.value.trim() === ""
    ) {
      return;
    }

    const { e, n } = JSON.parse(localStorage.getItem("participant2publicKey"));

    console.log("newMessage.value :>> ", RSA.maHoaRSA(newMessage.value, e, n));

    const encryptedMessage = RSA.maHoaRSA(newMessage.value, e, n);

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

    socket.value.emit("sendToken", { roomID: storeMessage.curRoomID, token });
    socket.value.emit("sendMessage", message);

    socket.value.on("chat message", (messages) => {
      storeMessage.setMessages(messages);
    });

    socket.value.on("token status", (status) => {
      if (!status) {
        router.go(0);
      }
    });

    newMessage.value = "";
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
      <div
        class="flex items-center justify-center gap-16 mb-3"
        v-if="storeMessage.messages[0]?.conversationId"
      >
        <p class="">
          Mã phòng:
          <strong>{{ storeMessage.messages[0]?.conversationId }}</strong>
        </p>

        <!--  -->
        <Button
          severity="primary"
          class=""
          :label="storeMessage.receiverUsername"
          icon="pi pi-user"
        />
        <!--  -->
      </div>

      <div
        v-for="message in storeMessage.messages"
        :key="message.id"
        class="mb-2"
      >
        <strong
          :class="{ 'text-red-400': message.senderUsername === store.username }"
        >
          <span>{{ message.senderUsername }}</span>
          <span v-if="message.senderUsername === store.username">
            (Me)</span
          ></strong
        >: {{ message.content }}
      </div>
    </div>
    <form class="flex gap-2 p-4 border-t border-gray-300 input-box">
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
        @click="sendMessage"
        rounded
        :disabled="!store.isLoggedIn || newMessage.trim() === ''"
      />
    </form>
  </div>
</template>

<style scoped>
  .messages {
    height: calc(100% - 50px);
  }
</style>
