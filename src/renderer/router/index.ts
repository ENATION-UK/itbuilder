import {createRouter, createWebHashHistory} from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/home.vue'),
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../pages/test.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../pages/about.vue'),
    },
    {
      path: '/status',
      name: 'status',
      component: () => import('../pages/status.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../pages/settings.vue'),
    },
    {
      path: '/ai',
      name: 'ai',
      component: () => import('../components/ai.vue'),
    }
  ]
})

export default router
