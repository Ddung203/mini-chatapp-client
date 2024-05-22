<script setup>
  import { onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { useConditionStore, useMessageStore } from "../stores/index.js";
  import { io } from "socket.io-client";
  import router from "../routes/index";
  import RSA from "../rsa/rsaMD.js";

  const store = useConditionStore();
  const storeMessage = useMessageStore();

  const oldMessages = ref([]);
  const newMessage = ref("");
  const socket = ref(null);
  const rooms = ref([]);

  // let { e, n } = JSON.parse(localStorage.getItem("receiverPublicKey"));

  const joinRoom = (roomID) => {
    if (!socket.value) return;

    const username = store.username;
    const myPublicKey = JSON.parse(localStorage.getItem("myPublicKey"));

    socket.value.emit("joinRoom", { username, roomID });
    storeMessage.setMessages([]);

    socket.value.emit("myPublicKey", { username, myPublicKey });

    socket.value.on("history", (messages) => {
      // console.log("history: messages :>> ", messages);
      handleMessage(messages);
    });

    socket.value?.on("sent myPublicKey", (data) => {
      // console.log(data);
      console.log("data :>> ", data);
    });
  };

  socket.value?.on("sent myPublicKey", (data) => {
    // console.log(data);
    console.log("data :>> ", data);
  });

  const sendMessage = () => {
    if (
      !socket.value ||
      !storeMessage.curRoomID ||
      newMessage.value.trim() === ""
    ) {
      return;
    }

    const token = localStorage.getItem("token");

    // Lấy public key của người nhận
    const { e, n } = JSON.parse(localStorage.getItem("receiverPublicKey"));

    const encryptedMessage = RSA.maHoaRSA(newMessage.value, e, n);

    const message = {
      roomID: storeMessage.curRoomID,
      data: {
        content: encryptedMessage,
        conversationId: storeMessage.curRoomID,
        id: socket.value.id,
        senderUsername: store.username,
        receiverUsername: storeMessage.receiverUsername,
      },
      originalContent: newMessage.value,
    };

    socket.value.emit("sendToken", { roomID: storeMessage.curRoomID, token });

    socket.value.emit("sendMessage", message);

    oldMessages.value.push(message);

    newMessage.value = "";
  };

  const handleMessage = (messages) => {
    const { d, n } = JSON.parse(localStorage.getItem("myPrivateKey"));
    messages.forEach((message) => {
      if (message.senderUsername === storeMessage.receiverUsername) {
        message.content = RSA.giaiMaRSA(message.content, d, n);
      } else if (message.senderUsername === store.username) {
        const matchedMessage = oldMessages.value.find(
          (oldMessage) => oldMessage.data.content === message.content
        );
        if (matchedMessage) {
          message.content = matchedMessage.originalContent;
        }
      }
    });

    storeMessage.setMessages(messages);
  };

  // Watch for changes in curRoomID and join the new room
  watch(
    () => storeMessage.curRoomID,
    (newRoomID) => {
      if (newRoomID) {
        joinRoom(newRoomID);
      }
    }
  );

  onMounted(() => {
    socket.value = io("http://localhost:8181/");

    socket.value.on("connect", () => {
      // console.log("socket.id :>> ", socket.value.id);
    });

    socket.value.on("roomList", (roomList) => {
      rooms.value = roomList;
    });

    socket.value.on("chat message", (messages) => {
      // console.log("Nhận tin nhắn: ", messages);
      handleMessage(messages);
    });

    socket.value.on("token status", (status) => {
      if (!status) {
        router.go(0);
      }
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

      <!--  -->
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
    <form
      class="flex gap-2 p-4 border-t border-gray-300 input-box"
      @submit.prevent="sendMessage"
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
