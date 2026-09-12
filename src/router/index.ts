import { createRouter, createWebHistory } from 'vue-router'
import Gallery from '@/components/Gallery.vue'

const uploaderUrl = (import.meta.env.VITE_UPLOADER_URL as string | undefined)?.trim()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Gallery },
    {
      path: '/admin',
      redirect: () => {
        if (uploaderUrl) window.location.replace(uploaderUrl)
        return '/'
      },
    },
  ],
})

export default router
