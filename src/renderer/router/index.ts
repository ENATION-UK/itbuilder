import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/home.vue'),
    },

    {
      path: '/project/:name',
      name: 'project',
      component: () => import('../pages/project.vue'),
      children: [
        {
          path: 'action/:type',
          name: 'action',
          component: () => import('../pages/ActionPage.vue'),
          props: true
        },
        {
          path: 'ai',
          name: 'ai',
          component: () => import('../pages/ai.vue'),
          props:true
        },
        {
          path: 'doc',
          name: 'doc',
          component: () => import('../pages/doc.vue'),
          props:true
        },
        {
          path: 'code',
          name: 'code',
          component: () => import('../pages/code.vue'),
          props:true
        },
        {
          path: 'generation/:id',
          name: 'project-generation',
          component: () => import('../pages/generation.vue'),
          props:true
        }
      ]
    },
    {
      path: '/play',
      name: 'play',
      component: () => import('../pages/playground.vue'),
    },
    {
      path: '/play1',
      name: 'play1',
      component: () => import('../pages/playground1.vue'),
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
    }
  ]
})

export default router
