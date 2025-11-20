import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
  /**
   * chrome extension 默认地址是 src/devtools/main.ts 加载的页面路径
   * 即：pages/devtools/openapi-codegen-panel.html
   * 因此此处用 hash 模式（或者可以用 memory 模式？）
   */
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/project',
    },
    {
      path: '/network',
      component: () => import('@/views/network/NetworkList.vue')
    },
    {
      path: '/project',
      component: () => import('@/views/project/ProjectList.vue')
    },
    {
      path: '/project-detail',
      name: 'project-detail',
      props: (to) => ({ 
        ...to.params, 
        ...to.query 
      }),
      component: () => import('@/views/project/ProjectDetail.vue')
    },
    {
      path: '/popup',
      component: () => import('@/views/popup/PopupView.vue')
    }
  ]
})