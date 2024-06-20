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

import bcrypt from "bcryptjs";

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
    async sendPublicKeyToServer(username, privateKeyJwkStr) {
      try {
        const salt = bcrypt.genSaltSync(10);
        const privateKeyHash = bcrypt.hashSync(privateKeyJwkStr, salt);

        const response = await HTTP.post("/auth/save-publicKey", {
          username,
          publicKey: JSON.stringify(this.publicKeyJwk),
          privateKeyHash,
        });

        console.log("sendPublicKeyToServer: ", response);
      } catch (error) {
        console.log(error?.message);
        return;
      }
    },

    setKeyPair(publicKeyJwk, privateKeyJwk) {
      this.publicKeyJwk = publicKeyJwk;
      this.privateKeyJwk = privateKeyJwk;
    },
  },
});

export default useKeyStore;
