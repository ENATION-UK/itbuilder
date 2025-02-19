import {createRouter, createWebHashHistory} from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home.vue'),
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/test.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/about.vue'),
    },
    {
      path: '/status',
      name: 'status',
      component: () => import('../views/status.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/settings.vue'),
    },
    {
      path: '/ai',
      name: 'ai',
      component: () => import('../components/ai.vue'),
    }
  ]
})

export default router
