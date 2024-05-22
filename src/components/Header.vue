<script setup>
  import { ref } from "vue";
  import { useConditionStore, useMessageStore } from "../stores/index.js";
  import postReq from "../api/post.js";
  import { useToast } from "primevue/usetoast";
  import notification from "../utils/notification.js";
  import RSA from "../rsa/rsaMD.js";

  const toast = useToast();
  const store = useConditionStore();
  const storeMessage = useMessageStore();

  const inputUsername = ref("");
  const inputPassword = ref("");

  const loginHandler = async () => {
    try {
      if (
        inputUsername.value.trim() === "" ||
        inputPassword.value.trim() === ""
      ) {
        notification(toast, "error", "Thông báo", "Đăng nhập thất bại!", 1500);
        return;
      }

      const response = await postReq("/auth/login", {
        username: inputUsername.value,
        password: inputPassword.value,
      });

      if (response?.token && response?.token.length > 0) {
        store.setLoggedIn();
        store.setUsername(response.username);
        localStorage.setItem("token", response.token);

        // Sinh cặp khóa
        const { publicKey, privateKey } = RSA.sinhKhoaRSA();

        const res = await postReq("/auth/save-publicKey", { publicKey });

        store.setParticipant1publicKey(res.publicKey);

        localStorage.setItem("myPublicKey", res.publicKey);
        localStorage.setItem("myPrivateKey", JSON.stringify(privateKey));

        notification(
          toast,
          "success",
          "Thông báo",
          "Đăng nhập thành công!",
          1500
        );
      }

      inputUsername.value = "";
      inputPassword.value = "";
    } catch (e) {
      console.log("e :>> ", e);
      notification(toast, "error", "Error", e.response?.data?.error, 2000);
    }
  };

  //
  const registerHandler = async () => {
    try {
      if (
        inputUsername.value.trim() === "" ||
        inputPassword.value.trim() === ""
      ) {
        notification(toast, "error", "Lỗi", "Đăng ký thất bại", 2500);
        return;
      }

      const response = await postReq("/auth/register", {
        username: inputUsername.value,
        password: inputPassword.value,
      });

      notification(
        toast,
        "success",
        "Thông báo",
        "Đăng ký tài khoản thành công!",
        1000
      );
    } catch (e) {
      notification(toast, "error", "Thông báo", e.response?.data?.error, 1000);
      return;
    }
  };

  //
  const logoutHandler = async () => {
    store.setLoggedOut();
    storeMessage.setResetMessages();
  };
</script>

<template>
  <Toast />
  <div class="fixed top-0 left-0 w-[100vw] bg-white z-40">
    <header class="flex items-center justify-around py-3 border border-[#ccc]">
      <!--  -->
      <div class="left">
        <p v-if="store.isLoggedIn">
          Xin chào, <strong>{{ store.username }}</strong>
        </p>
        <p v-if="!store.isLoggedIn">Đăng nhập hoặc đăng ký để bắt đầu ❤</p>
      </div>

      <!--  -->
      <div v-if="!store.isLoggedIn">
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
          v-if="!store.isLoggedIn"
          label="Đăng ký"
          severity="secondary"
          rounded
          @click="registerHandler"
        />

        <Button
          v-if="!store.isLoggedIn"
          label="Đăng nhập"
          rounded
          @click="loginHandler"
        />

        <Button
          v-if="store.isLoggedIn"
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
