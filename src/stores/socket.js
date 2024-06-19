import { defineStore } from "pinia";
import { ref } from "vue";
import { io } from "socket.io-client";
import router from "../routes/index";
import {
  generateKeyPair,
  encryptMessage,
  decryptMessage,
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from "../encode";
import { useConditionStore, useMessageStore } from "../stores/index.js"; //
import RSA from "../rsa/rsaMD.js"; //
import useAuthStore from "./auth.js";
import HTTP from "../api/axiosInstance.js";

const useSocketStore = defineStore("socket", {
  state: () => ({
    socket: ref(null),
    rooms: ref([]),
    roomID: ref(null),
    userOnlineList: ref([]),
    receiver: ref({}),
    oldMessages: ref([]),
    newMessage: ref(""),
  }),

  getters: {
    // bug: always return empty array
    getUserOnlineList: (state) => {
      return state.userOnlineList.map((user) => user.username);
    },
  },

  actions: {
    initializeSocket() {
      this.socket = io("http://localhost:8181/", {
        transports: ["websocket"],
      });

      this.socket.on("connect", () => {
        console.log("ID:: ", this.socket.id);
      });

      this.socket.on("connect_error", (err) => {
        // the reason of the error, for example "xhr poll error"
        console.log(err.message);

        // some additional description, for example the status code of the initial HTTP response
        console.log(err.description);

        // some additional context, for example the XMLHttpRequest object
        console.log(err.context);
      });

      this.socket.on("roomList", (rooms) => {
        this.rooms = rooms;
      });

      this.socket.on("userOnlineListChanged", (userOnlineList) => {
        this.userOnlineList = userOnlineList;
      });

      // this.socket.on("chat message", (messages) => {
      //   this.handleMessage(messages);
      // });
    },

    async loginSocket(username) {
      // console.log(`loginSocket(${username})`);
      if (this.socket) {
        await this.socket.emit("login", { username });
      }
    },

    async disconnectSocket(username) {
      if (this.socket) {
        await this.socket.emit("logout", username);
        this.socket.disconnect();
      }
    },

    async getRoomID(username, partnerUsername) {
      try {
        const response = await HTTP.post("/conversation/roomID", {
          username,
          partnerUsername,
        });

        if (response?.status && response?.status === "success") {
          this.roomID = response.roomID;
        }
      } catch (error) {
        console.log("error :>> ", error);
        throw error;
      }
    },

    joinRoom(roomID) {
      if (!this.socket) return;

      const authStore = useAuthStore();
      const username = authStore.getUsername;

      console.log("joinRoom :>> ", { username, roomID });

      this.socket.emit("joinRoom", { username, roomID });
    },

    leaveRoom() {
      if (!this.socket || this.roomID == null) return;

      const authStore = useAuthStore();
      const username = authStore.getUsername;

      console.log("leaveRoom", { username, roomID: this.roomID });

      this.socket.emit("leaveRoom", { username, roomID: this.roomID });
    },

    sendMessage() {
      const store = useConditionStore();
      const storeMessage = useMessageStore();

      if (
        !this.socket ||
        !storeMessage.curRoomID ||
        this.newMessage.trim() === ""
      ) {
        return;
      }

      const token = localStorage.getItem("token");

      // Lấy public key của người nhận
      const { e, n } = JSON.parse(localStorage.getItem("receiverPublicKey"));

      const encryptedMessage = RSA.maHoaRSA(this.newMessage, e, n);

      const message = {
        roomID: storeMessage.curRoomID,
        data: {
          content: encryptedMessage,
          conversationId: storeMessage.curRoomID,
          id: this.socket.id,
          senderUsername: store.username,
          receiverUsername: storeMessage.receiverUsername,
        },
        originalContent: this.newMessage,
      };

      this.socket.emit("sendToken", { roomID: storeMessage.curRoomID, token });
      this.socket.emit("sendMessage", message);

      this.oldMessages.push(message);
      this.newMessage = "";
    },

    handleMessage(messages) {
      const storeMessage = useMessageStore();
      const store = useConditionStore();
      const { d, n } = JSON.parse(localStorage.getItem("myPrivateKey"));

      messages.forEach((message) => {
        if (message.senderUsername === storeMessage.receiverUsername) {
          message.content = RSA.giaiMaRSA(message.content, d, n);
        } else if (message.senderUsername === store.username) {
          const matchedMessage = this.oldMessages.find(
            (oldMessage) => oldMessage.data.content === message.content
          );
          if (matchedMessage) {
            message.content = matchedMessage.originalContent;
          }
        }
      });

      storeMessage.setMessages(messages);
    },
  },
});

export default useSocketStore;
