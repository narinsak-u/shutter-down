import { createRouter, createWebHistory } from 'vue-router'
import Gallery from '@/components/Gallery.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Gallery },
  ],
})

export default router
