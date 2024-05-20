<script setup>
  import { onMounted, ref, watch } from "vue";
  import { useConditionStore, useMessageStore } from "../stores/index.js";
  import getReq from "../api/get.js";

  const store = useConditionStore();
  const storeMessage = useMessageStore();

  const users = ref([]);

  const callAPIGetUsers = async () => {
    try {
      const response = await getReq("/user/except");
      users.value = response;
    } catch (error) {
      console.log("error :>> ", error);
    }
  };

  // const chooseUser = ref("");

  const callAPIGetMessages = async (un) => {
    try {
      const url = `/message/users?senderUsername=${store.username}&receiverUsername=${un}`;

      const response = await getReq(url);

      // console.log("response :>> ", response);
      storeMessage.setMessages(response);
    } catch (error) {
      console.log("error :>> ", error);
    }
  };

  watch(
    () => store.isLoggedIn,
    (isLoggedIn) => {
      if (isLoggedIn) {
        callAPIGetUsers();
      }
    }
  );

  onMounted(() => {
    if (store.isLoggedIn) {
      callAPIGetUsers();
    }
  });
</script>

<template>
  <div class="w-1/4 min-h-[70vh] p-4 bg-gray-200 sidebar">
    <h2 class="mb-4 text-xl font-bold">Danh sách bạn bè</h2>
    <ul
      class="flex flex-col items-center justify-center"
      v-if="store.isLoggedIn"
    >
      <li
        v-for="user in users"
        :key="user.id"
        class="mb-2"
      >
        <Button
          class="w-[200px]"
          :label="user.username"
          icon="pi pi-user"
          @click="callAPIGetMessages(user.username)"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
  .sidebar {
    border-right: 1px solid #ccc;
  }
</style>
