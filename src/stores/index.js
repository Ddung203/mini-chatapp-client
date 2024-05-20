import { defineStore } from "pinia";

const useConditionStore = defineStore("condition", {
  state: () => ({
    isLoggedIn: JSON.parse(localStorage.getItem("isLoggedIn")) || false,
    username: JSON.parse(localStorage.getItem("username")) || "",
    token: localStorage.getItem("token") || "",
  }),
  getters: {
    getUsername: (state) => state.username,

    getToken: (state) => state.token,

    isAuthenticated: (state) => !!state.token && state.isLoggedIn,
  },
  actions: {
    setLoggedIn() {
      localStorage.setItem("isLoggedIn", true);
      this.isLoggedIn = true;
    },
    setLoggedOut() {
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      this.isLoggedIn = false;
    },
    setUsername(username) {
      localStorage.setItem("username", JSON.stringify(username));
      this.username = username;
    },
  },
});

const useMessageStore = defineStore("message", {
  state: () => ({
    messages: [],
  }),
  getters: {},
  actions: {
    setMessages(messages) {
      // localStorage.setItem("messages", JSON.stringify(messages));
      this.messages = messages;
    },
  },
});

export { useConditionStore, useMessageStore };
