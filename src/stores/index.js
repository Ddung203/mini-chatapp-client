import { defineStore } from "pinia";

// Helper functions
function getLocalStorageItem(key, defaultValue) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : defaultValue;
}

function setLocalStorageItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const useConditionStore = defineStore("condition", {
  state: () => ({
    isLoggedIn: getLocalStorageItem("isLoggedIn", false),
    username: getLocalStorageItem("username", ""),
    token: localStorage.getItem("token") || "",
  }),
  getters: {
    getUsername: (state) => state.username,
    getToken: (state) => state.token,
    isAuthenticated: (state) => !!state.token && state.isLoggedIn,
  },
  actions: {
    setLoggedIn() {
      setLocalStorageItem("isLoggedIn", true);
      this.isLoggedIn = true;
    },
    setLoggedOut() {
      [
        "token",
        "isLoggedIn",
        "username",
        "curRoomID",
        "receiverUsername",
      ].forEach((item) => localStorage.removeItem(item));

      this.$reset(); // Pinia's reset function
    },
    setUsername(username) {
      setLocalStorageItem("username", username);
      this.username = username;
    },
  },
});

const useMessageStore = defineStore("message", {
  state: () => ({
    messages: [],
    curRoomID: localStorage.getItem("curRoomID") || "",
    receiverUsername: getLocalStorageItem("receiverUsername", ""),
  }),
  getters: {},
  actions: {
    setMessages(messages) {
      this.messages = messages;
    },
    setCurRoomID(curRoomID) {
      localStorage.setItem("curRoomID", curRoomID);
      this.curRoomID = curRoomID;
    },
    setReceiverUsername(receiverUsername) {
      setLocalStorageItem("receiverUsername", receiverUsername);
      this.receiverUsername = receiverUsername;
    },
  },
});

export { useConditionStore, useMessageStore };
