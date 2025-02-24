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
          path: 'ai/',
          name: 'ai',
          component: () => import('../components/ai.vue'),
          props:true
        },
        {
          path: 'flow/:id',
          name: 'project-flow',
          component: () => import('../pages/flow.vue'),
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
