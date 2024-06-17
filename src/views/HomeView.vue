<script setup>
  import { ref, onBeforeUnmount, onMounted, onUpdated } from "vue";
  import Header from "../components/Header.vue";
  import Footer from "../components/Footer.vue";
  import Sidebar from "../components/Sidebar.vue";
  import ChatBox from "../components/ChatBox.vue";
  import Check from "../components/Check.vue";
  import useAuthStore from "../stores/auth";
  import useKeyStore from "../stores/key";
  import { exportPrivateKey } from "../encode";

  const authStore = useAuthStore();
  const keyStore = useKeyStore();
  const showAlert = ref(false);

  // bug: onMounted function does not work
  // onMounted(() => {
  //   const user = JSON.parse(localStorage.getItem("user")) || {};

  //   console.log("user :>> ", Object.keys(user));
  //   console.log("user?.isLoggedIn :>> ", user?.isLoggedIn);
  //   if (user?.isLoggedIn) {
  //     authStore.setStoreData(user?.username, user?.token, user?.isLoggedIn);
  //   } else {
  //     return;
  //   }
  // });

  // Xác nhận Tải lại website
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = "";
    showAlert.value = true;
  };

  onMounted(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  });
</script>

<template>
  <div>
    <Header />
    <!-- <div
      class="w-[100vw] mt-[76px] h-[90vh] overflow-x-hidden flex justify-center"
    >
      <div class="flex border border-[#ccc]">
        <Sidebar />
        <ChatBox />
      </div>
    </div> -->
    <Footer></Footer>
  </div>
</template>

<style scoped>
  .main {
    display: flex;
    height: calc(100vh - 60px); /* Adjust based on Header height */
  }
</style>
