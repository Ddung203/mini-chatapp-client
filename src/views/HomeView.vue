<script setup>
  import { onMounted } from "vue";
  import Header from "../components/Header.vue";
  import Footer from "../components/Footer.vue";
  import Sidebar from "../components/Sidebar.vue";
  import ChatBox from "../components/ChatBox.vue";
  import Check from "../components/Check.vue";
  import useAuthStore from "../stores/auth";
  import useKeyStore from "../stores/key";

  const authStore = useAuthStore();
  const keyStore = useKeyStore();

  // Handlers
  const loginHandler = async () => {
    try {
      await authStore.login({ username: "ddung", password: "123" });
    } catch (error) {
      console.log("error :>> ", error);
      authStore.logout();
    }
  };

  const sendPublicKeyHandler = async () => {
    try {
      await keyStore.sendPublicKeyToServer();
    } catch (error) {
      console.log("error :>> ", error);
    }
  };

  //
  onMounted(loginHandler);
</script>

<template>
  <div>
    <h1>123</h1>
    <Button @click="authStore.logout">LOG OUT</Button>

    <router-link to="/about">
      <Button>Chuyen trang</Button>
    </router-link>

    <Check />

    <Button @click="keyStore.createKeyPair()">Tạo khóa</Button>
    <Button @click="sendPublicKeyHandler">Gửi khóa</Button>

    <Header />
    <!-- <div
      class="w-[100vw] mt-[76px] h-[90vh] overflow-x-hidden flex justify-center"
    >
      <div class="flex border border-[#ccc]">
        <Sidebar />
        <ChatBox />
      </div>
    </div> -->
    <!-- <Footer /> -->
  </div>
</template>

<style scoped>
  .main {
    display: flex;
    height: calc(100vh - 60px); /* Adjust based on Header height */
  }
</style>
