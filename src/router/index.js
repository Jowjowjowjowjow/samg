import { createRouter, createWebHistory } from 'vue-router'
import Historico from '../views/Historico.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Historico
    }
  ]
})

export default router
