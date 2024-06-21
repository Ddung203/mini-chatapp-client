import { defineStore } from "pinia";
import { ref } from "vue";
import { io } from "socket.io-client";
import router from "../routes/index";
import useAuthStore from "./auth.js";
import HTTP from "../api/axiosInstance.js";
import useKeyStore from "./key.js";
import { maHoaRSA, giaiMaRSA } from "../encode/rsa/rsa.js";

const useSocketStore = defineStore("socket", {
  state: () => ({
    socket: ref(null),
    rooms: ref([]),
    roomID: ref(null),
    userOnlineList: ref([]),
    receiver: ref(null),
    oldMessages: ref([]),
    curMessages: ref([]),
    newMessage: ref(""),
  }),

  getters: {
    // bug: always return empty array
    getUserOnlineList: (state) => {
      return state.userOnlineList.map((user) => user.username);
    },
  },

  actions: {
    clear() {
      this.$reset();
    },

    setCurMessages(message) {
      this.curMessages.push(message);
    },

    setReceiver(receiver) {
      this.receiver = receiver;
    },

    initializeSocket() {
      this.socket = io("http://localhost:8181/");

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
    },

    async loginSocket(username) {
      if (this.socket) {
        await this.socket.emit("login", { username });
      }
    },

    async disconnectSocket(username) {
      if (this.socket) {
        await this.socket.emit("logout", username);
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

      this.socket.emit("joinRoom", { username, roomID });
    },

    leaveRoom() {
      if (!this.socket || this.roomID == null) return;

      const authStore = useAuthStore();
      const username = authStore.getUsername;

      this.socket.emit("leaveRoom", { username, roomID: this.roomID });
    },

    async sendMessage(content) {
      const authStore = useAuthStore();
      const keyStore = useKeyStore();

      const encryptMessaged = maHoaRSA({
        plaintext: content.trim(),
        publicKey: keyStore.receiverPublicKey,
      });

      const dataMessage = {
        conversationId: this.roomID,
        content: encryptMessaged,
        senderUsername: authStore.getUsername,
        receiverUsername: this.receiver?.username,
      };

      this.socket.emit("sendMessage", dataMessage);
    },

    async handleMessage() {
      const keyStore = useKeyStore();
      this.socket.on("chatMessage", async (messages) => {
        const decryptedMessages = [];

        for (const message of messages) {
          if (message.senderUsername === this.receiver.username) {
            try {
              const decryptedMessage = await giaiMaRSA({
                ciphertext: message.content,
                privateKey: keyStore.privateKeyJwk,
              });

              //
              decryptedMessages.push({
                ...message,
                content: decryptedMessage,
              });
            } catch (error) {
              console.log("Error decrypting message: ", error);
              //
              decryptedMessages.push(message);
            }
          } else {
            decryptedMessages.push(message);
          }
        }

        this.oldMessages = decryptedMessages;
      });
    },
  },
});

export default useSocketStore;
