import { defineStore } from "pinia";
import { ref } from "vue";
import HTTP from "../api/axiosInstance";
import {
  generateKeyPair,
  encryptMessage,
  decryptMessage,
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from "../encode";

const useKeyStore = defineStore("key", {
  state: () => ({
    publicKeyJwk: ref(null),
    privateKeyJwk: ref(null),
    onlineUsers: ref([]),
    messages: ref([]),
  }),
  getters: {
    getPublicKeyJwk: (state) => state.publicKeyJwk,
    getPrivateKeyJwk: (state) => state.privateKeyJwk,
  },
  actions: {
    clear() {
      this.$reset();
      localStorage.clear();
    },

    async createKeyPair() {
      this.publicKeyJwk = await generateKeyPair();
      this.privateKeyJwk = JSON.parse(localStorage.getItem("privateKey"));
    },
    async sendPublicKeyToServer() {
      try {
        const response = await HTTP.post("/auth/save-publicKey", {
          publicKey: JSON.stringify(this.publicKeyJwk),
        });

        console.log("sendPublicKeyToServer: ", response);
      } catch (error) {
        console.log(error?.message);
        return;
      }
    },
  },
});

export default useKeyStore;
