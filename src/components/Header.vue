<script setup>
  import { onMounted, ref } from "vue";
  import { useToast } from "primevue/usetoast";
  import notification from "../utils/notification.js";
  import useAuthStore from "../stores/auth.js";
  import useKeyStore from "../stores/key.js";
  import useSocketStore from "../stores/socket.js";
  import { detectMobile } from "../utils/detectMobile.js";

  const toast = useToast();

  const isMobile = ref(false);

  const authStore = useAuthStore();
  const keyStore = useKeyStore();
  const socketStore = useSocketStore();

  const inputUsername = ref("cuoicuoi");
  const inputPassword = ref("123");
  const userOnlineList = ref([]);

  // Xử lý đăng ký
  const registerHandler = async () => {
    try {
      const signInData = {
        username: inputUsername.value.trim(),
        password: inputPassword.value.trim(),
      };
      if (signInData.username === "" || signInData.password === "") {
        notification(
          toast,
          "error",
          "Lỗi",
          "Thông tin đăng ký không được để trống!",
          2000
        );
        return;
      }

      await authStore.register(signInData);

      notification(
        toast,
        "success",
        "Thông báo",
        "Đăng ký tài khoản thành công!",
        1000
      );
    } catch (error) {
      notification(toast, "error", "Lỗi", error.message, 1500);
      return;
    }
    return;
  };

  // Xử lý đăng nhập
  const loginHandler = async () => {
    try {
      const signInData = {
        username: inputUsername.value.trim(),
        password: inputPassword.value.trim(),
      };

      await authStore.login(signInData);

      socketStore.initializeSocket();

      socketStore.loginSocket(signInData.username);

      userOnlineList.value = socketStore.userOnlineList.map(
        (user) => user.username
      );
    } catch (error) {
      authStore.logout();
      notification(toast, "error", "Lỗi", error?.message, 2000);
    }
  };

  //  Xử lý đăng xuất
  const logoutHandler = async (username) => {
    userOnlineList.value = socketStore.userOnlineList.map(
      (user) => user.username
    );
    socketStore.leaveRoom();
    socketStore.disconnectSocket(username);
    authStore.logout();
    socketStore.clear();
    keyStore.clear();
  };

  //
  onMounted(() => {
    isMobile.value = detectMobile();
  });
</script>

<template>
  <Toast />
  <div class="fixed top-0 left-0 w-[100vw] bg-white z-40">
    <header
      class="flex flex-col lg:flex-row items-center justify-around py-3 border border-[#ccc]"
    >
      <!--  -->
      <div class="left">
        <p v-if="authStore.isAuthenticated">
          Xin chào,
          <router-link to="/about">
            <strong>{{ authStore.username }}</strong>
          </router-link>
          😎
        </p>
        <p v-if="!authStore.isAuthenticated && !isMobile">
          Đăng nhập hoặc đăng ký để bắt đầu ❤
        </p>
      </div>

      <!--  -->
      <div v-if="!authStore.isAuthenticated">
        <form class="flex flex-col gap-4 py-2 lg:flex-row">
          <FloatLabel>
            <InputText
              id="username"
              v-model="inputUsername"
            />
            <label for="username">Username</label>
          </FloatLabel>

          <FloatLabel>
            <InputText
              id="password"
              v-model="inputPassword"
              type="password"
            />
            <label for="password">Password</label>
          </FloatLabel>
        </form>
      </div>

      <!--  -->
      <div class="flex gap-5 lg:flex-row right">
        <Button
          v-if="!authStore.isAuthenticated"
          label="Đăng ký"
          severity="secondary"
          rounded
          @click="registerHandler"
        />

        <Button
          v-if="!authStore.isAuthenticated"
          label="Đăng nhập"
          rounded
          @click="loginHandler"
        />

        <Button
          v-if="authStore.isAuthenticated"
          label="Đăng xuất"
          severity="danger"
          rounded
          @click="logoutHandler(authStore.getUsername)"
        />
      </div>
    </header>
  </div>
</template>

<style scoped>
  /*  */
</style>
