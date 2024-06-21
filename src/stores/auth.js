import { defineStore } from "pinia";
import { ref } from "vue";
import HTTP from "../api/axiosInstance";
import bcrypt from "bcryptjs";
import useKeyStore from "./key";

const useAuthStore = defineStore("auth", {
  state: () => ({
    isLoggedIn: ref(false),
    username: ref(""),
    token: ref(""),
    expiredTime: ref(null),
  }),
  getters: {
    getIsLoggedIn: (state) => state.isLoggedIn,
    getUsername: (state) => state.username,
    getToken: (state) => state.token,
    isAuthenticated: (state) => !!state.token && state.isLoggedIn,
  },
  actions: {
    setStoreData({ username, token, isLoggedIn }) {
      this.username = username;
      this.token = token;
      this.isLoggedIn = isLoggedIn; // bug: setStoreData function does not work
    },

    async register({ username, password }) {
      try {
        const response = await HTTP.post("/auth/register", {
          username,
          password,
        });

        if (response?.status && response?.status === "success") {
          const keyStore = useKeyStore();

          await keyStore.createKeyPair();
          await keyStore.exportPrivateKey(username);
          await keyStore.sendPublicKeyToServer(username);
        }
      } catch (error) {
        console.log(error?.message);
        throw error;
      }
    },

    async login({ username, password }) {
      try {
        const response = await HTTP.post("/auth/login", {
          username,
          password,
        });

        if (response?.status && response?.status === "success") {
          const keyStore = useKeyStore();
          this.username = response.username;
          this.token = response.token;
          this.isLoggedIn = true;

          //
          await keyStore.importPrivateKey();

          //
          localStorage.setItem(
            "user",
            JSON.stringify({
              username: this.username,
              token: this.token,
              isLoggedIn: this.isLoggedIn,
            })
          );

          //
          const privateKeyJwkStr = localStorage.getItem("privateKey") || "";

          const isMatch = bcrypt.compareSync(
            privateKeyJwkStr,
            response?.privateKeyHash
          );

          if (!isMatch) {
            this.$reset();
            localStorage.clear();
            throw new Error("Khóa private không hợp lệ!");
          }

          keyStore.setKeyPair(
            JSON.parse(response.publicKey),
            JSON.parse(privateKeyJwkStr)
          );
        }
      } catch (error) {
        throw error;
      }
    },

    logout() {
      console.log("BYE");
      this.$reset();
      localStorage.clear();
    },
  },
});

export default useAuthStore;
