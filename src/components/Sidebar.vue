<script setup>
  import { onMounted, ref, watch } from "vue";
  import { useConditionStore, useMessageStore } from "../stores/index.js";
  import getReq from "../api/get.js";
  import postReq from "../api/post.js";

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

  const callAPIGetMessages = async (un) => {
    try {
      storeMessage.setReceiverUsername(un);

      const url = `/conversation/create`;

      const res = await postReq(url, {
        participant1Username: store.username,
        participant2Username: un,
      });

      if (!!res?.id === false) return;

      storeMessage.setCurRoomID(res?.id);
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
