import { createWebHistory, createRouter } from "vue-router";

import HomeView from "../views/HomeView.vue";
import NotFoundView from "../views/NotFoundView.vue";

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/:catchAll(.*)", component: NotFoundView },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Log any routing errors
router.onError((error) => {
  console.error("Router error:", error);
});

export default router;
