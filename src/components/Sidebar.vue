<script setup>
  import { onMounted, ref, watch } from "vue";
  import VirtualScroller from "primevue/virtualscroller";
  import { useConditionStore, useMessageStore } from "../stores/index.js";
  import getReq from "../api/get.js";
  import postReq from "../api/post.js";
  import router from "../routes/index.js";

  const store = useConditionStore();
  const storeMessage = useMessageStore();

  const users = ref([]);

  const callAPIGetUsers = async () => {
    try {
      const response = await getReq("/user/except");
      users.value = response;
    } catch (error) {
      // console.log("error :>> ", error);
      store.setLoggedOut();
      // router.push({ path: "/" });
    }
  };

  const callAPIGetMessages = async (receiver, participant2publicKey) => {
    const getReceiverPublicKeyResponse = await getReq(
      `/auth/receiver-publicKey?receiver=${receiver}`
    );

    console.log(
      "getReceiverPublicKeyResponse :>> ",
      getReceiverPublicKeyResponse
    );

    localStorage.setItem("receiverPublicKey", getReceiverPublicKeyResponse);
    try {
      storeMessage.setReceiverUsername(receiver);

      const url = `/conversation/create`;
      const res = await postReq(url, {
        participant1Username: store.username,
        participant2Username: receiver,
        participant1publicKey: localStorage.getItem("myPublicKey"),
        participant2publicKey: getReceiverPublicKeyResponse,
      });

      if (!!res?.id === false) return;

      storeMessage.setCurRoomID(res?.id);
    } catch (error) {
      console.log("error 2:>> ", error);
      store.setLoggedOut();
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
    <div class="max-h-[530px] w-[240px] overflow-y-scroll overflow-x-hidden">
      <ul
        class="flex flex-col p-3 bg-white"
        v-if="store.isLoggedIn"
      >
        <li
          v-for="user in users"
          :key="user.id"
          class="pb-2"
        >
          <Button
            severity="primary"
            class="w-[200px]"
            :label="user.username"
            icon="pi pi-user"
            @click="callAPIGetMessages(user.username, user.publicKey)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
  .sidebar {
    border-right: 1px solid #ccc;
  }
</style>
