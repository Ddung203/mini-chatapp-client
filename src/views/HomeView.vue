<script setup>
  import { ref, onBeforeUnmount, onMounted } from "vue";
  import Header from "../components/Header.vue";
  import Footer from "../components/Footer.vue";
  import Sidebar from "../components/Sidebar.vue";
  import ChatBox from "../components/ChatBox.vue";
  import useAuthStore from "../stores/auth";
  import useKeyStore from "../stores/key";
  import useSocketStore from "../stores/socket";

  const authStore = useAuthStore();
  const keyStore = useKeyStore();
  const socketStore = useSocketStore();

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
  // const handleBeforeUnload = (event) => {
  //   event.preventDefault();
  //   event.returnValue = "";
  //   showAlert.value = true;
  // };

  // onMounted(() => {
  //   window.addEventListener("beforeunload", handleBeforeUnload);
  // });

  // onBeforeUnmount(() => {
  //   window.removeEventListener("beforeunload", handleBeforeUnload);
  // });
</script>

<template>
  <div>
    <Header />
    <div
      class="w-[100vw] mt-[76px] h-[90vh] overflow-x-hidden flex justify-center"
    >
      <div
        v-if="authStore.isAuthenticated"
        class="flex border border-[#ccc]"
      >
        <Sidebar />
        <ChatBox />
      </div>
      <div
        v-if="!authStore.isAuthenticated"
        class="p-3 mt-[100px] lg:mt-7"
      >
        <p class="pb-2 text-xl font-bold">
          Đề tài: Xây dựng dựng sản phẩm truyền tin mã hóa sử dụng RSA
        </p>

        <p class="font-bold">GVHD: TS. Lê Thị Anh</p>
        <br />
        <p>Nhóm: 3</p>
        <br />
        <ul>
          <li>Thành viên 1: Dương Văn Dũng - 2021602195</li>
          <li>Thành viên 2: Trần Văn Dự - 18120004</li>
          <li>Thành viên 3: Ngô Văn Đức - 18120006</li>
          <li>Thành viên 4: Quản Anh Đức - 18120008</li>
          <li>Thành viên 5: Trịnh Xuân Anh Đức - 18120010</li>
        </ul>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<style scoped>
  .main {
    display: flex;
    height: calc(100vh - 60px);
  }
</style>
