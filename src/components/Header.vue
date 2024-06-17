<script setup>
  import { ref } from "vue";
  import { useToast } from "primevue/usetoast";
  import notification from "../utils/notification.js";
  import useAuthStore from "../stores/auth.js";
  import keyAuthStore from "../stores/key.js";
  import { exportPrivateKey, importPrivateKey } from "../encode/index.js";

  const toast = useToast();
  const authStore = useAuthStore();
  const keyStore = keyAuthStore();

  const inputUsername = ref("");
  const inputPassword = ref("");

  const loginHandler = async () => {
    try {
      const signInData = {
        username: inputUsername.value.trim(),
        password: inputPassword.value.trim(),
      };

      await authStore.login(signInData);
    } catch (error) {
      authStore.logout();
      notification(toast, "error", "Lỗi", error?.message, 2500);
    }
  };

  //
  const sendPublicKeyHandler = async (username) => {
    try {
      const privateKeyJwkStr = JSON.stringify(keyStore.getPrivateKeyJwk);
      await keyStore.sendPublicKeyToServer(username, privateKeyJwkStr);
    } catch (error) {
      console.log("sendPublicKeyHandler error:: ", error);
      throw error;
    }
  };
  //
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

      await keyStore.createKeyPair();
      await exportPrivateKey(signInData.username);
      await sendPublicKeyHandler(signInData.username);

      notification(
        toast,
        "success",
        "Thông báo",
        "Đăng ký tài khoản thành công!",
        1000
      );
    } catch (e) {
      notification(toast, "error", "Thông báo", e.message, 1000);
      return;
    }
    return;
  };

  //
  const logoutHandler = async () => {
    authStore.logout();
    keyStore.clear();
  };
</script>

<template>
  <Toast />
  <div class="fixed top-0 left-0 w-[100vw] bg-white z-40">
    <header class="flex items-center justify-around py-3 border border-[#ccc]">
      <!--  -->
      <div class="left">
        <p v-if="authStore.isAuthenticated">
          Xin chào,
          <router-link to="/about">
            <strong>{{ authStore.username }}</strong>
          </router-link>
          😎
        </p>
        <p v-if="!authStore.isAuthenticated">
          Đăng nhập hoặc đăng ký để bắt đầu ❤
        </p>
      </div>

      <!--  -->
      <div v-if="!authStore.isAuthenticated">
        <form class="flex gap-4 py-2">
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
      <div class="flex gap-5 right">
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
          @click="logoutHandler"
        />
      </div>
    </header>
  </div>
</template>

<style scoped>
  /*  */
</style>
