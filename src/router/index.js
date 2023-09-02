import { createRouter, createWebHistory } from 'vue-router'
import Historico from '../views/Historico.vue'
import HistoricoIntegralizacao from '../views/HistoricoIntegralizacao.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Historico
    },
    {
      path: '/integralizacao',
      name: 'integralizacao',
      component: HistoricoIntegralizacao
    }
  ]
})

export default router
