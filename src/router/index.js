import { createRouter, createWebHistory } from 'vue-router'
import Historico from '../views/Historico.vue'
import HistoricoIntegralizacao from '../views/HistoricoIntegralizacao.vue'
import Inicio from '../views/Inicio.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'inicio',
      component: Inicio
    },
    {
      path: '/integralizacao',
      name: 'integralizacao',
      component: Historico
    },
    {
      path: '/progresso',
      name: 'progresso',
      component: HistoricoIntegralizacao
    },
    
  ]
})

export default router
