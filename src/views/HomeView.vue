<script setup>
  import Header from "../components/Header.vue";
  import Sidebar from "../components/Sidebar.vue";
  import ChatBox from "../components/ChatBox.vue";
</script>

<template>
  <div>
    <Header />
    <div
      class="w-[100vw] mt-[76px] h-[90vh] overflow-x-hidden flex justify-center"
    >
      <div class="flex border border-[#ccc]">
        <Sidebar />
        <ChatBox />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .main {
    display: flex;
    height: calc(100vh - 60px); /* Adjust based on Header height */
  }
</style>
