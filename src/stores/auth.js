import { defineStore } from "pinia";
import { ref } from "vue";
import HTTP from "../api/axiosInstance";
import bcrypt from "bcryptjs";
import { importPrivateKey } from "../encode";

const useAuthStore = defineStore("auth", {
  state: () => ({
    isLoggedIn: ref(false),
    username: ref(""),
    token: ref(""),
  }),
  getters: {
    getIsLoggedIn: (state) => state.isLoggedIn,
    getUsername: (state) => state.username,
    getToken: (state) => state.token,
    isAuthenticated: (state) => !!state.token && state.isLoggedIn,
  },
  actions: {
    async register({ username, password }) {
      try {
        const response = await HTTP.post("/auth/register", {
          username,
          password,
        });

        if (response?.status && response?.status === "success") {
          return true;
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

        // console.log("actions: response :>> ", response);
        if (response?.status && response?.status === "success") {
          this.username = response.username;
          this.token = response.token;
          this.isLoggedIn = true;
          await importPrivateKey();
          localStorage.setItem("user", JSON.stringify(response));

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