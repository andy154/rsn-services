import TaxCalc from '@/components/TaxCalc.vue'
import Worktable from '@/components/Worktable.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Worktable,
    },
    {
      path: '/taxcalc',
      name: 'taxcalc',
      component: TaxCalc
    },
  ],
})

export default router
