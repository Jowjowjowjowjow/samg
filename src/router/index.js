import { createRouter, createWebHistory } from 'vue-router'
import Migracao from '../views/Migracao.vue'
import Progresso from '../views/Progresso.vue'
import Inicio from '../views/Inicio.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'inicio',
    //   component: Inicio
    // },
    {
      path: '/',
      name: 'migracao',
      component: Migracao
    },
    {
      path: '/progresso',
      name: 'progresso',
      component: Progresso
    },
    
  ]
})

export default router
