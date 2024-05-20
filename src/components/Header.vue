<script setup>
  import { ref } from "vue";
  import { useConditionStore } from "../stores/index.js";
  import postReq from "../api/post.js";
  import { useToast } from "primevue/usetoast";

  const toast = useToast();
  const store = useConditionStore();

  const inputUsername = ref("");
  const inputPassword = ref("");

  const loginHandler = async () => {
    try {
      if (
        inputUsername.value.trim() !== "" ||
        inputPassword.value.trim() !== ""
      ) {
        const response = await postReq("/auth/login", {
          username: inputUsername.value,
          password: inputPassword.value,
        });

        if (response?.data?.error) throw new Error(response?.data?.error);

        if (response?.token && response?.token.length > 0) {
          store.setUsername(response.username);
          store.setLoggedIn();
          localStorage.setItem("token", response.token);

          //
          toast.add({
            severity: "success",
            summary: "Thông báo",
            detail: "Đăng nhập thành công!",
            life: 2000,
          });
        }

        inputUsername.value = "";
        inputPassword.value = "";
      }
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: error.message,
        life: 2000,
      });
    }
  };

  const logoutHandler = async () => {
    store.setLoggedOut();
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
