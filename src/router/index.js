import { createRouter, createWebHistory } from 'vue-router'
import PaginaInicial from '../views/PaginaInicial.vue'
import Exemplo from '../views/exemplosVue/Exemplo.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: PaginaInicial
    },
    {
      path: '/exemplo',
      name: 'exemplo',
      component: Exemplo
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

export default router
