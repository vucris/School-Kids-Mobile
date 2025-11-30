// src/router/routes.js
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue'),
    meta: { guestOnly: true },
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // vào / thì chuyển sang /feed
      {
        path: '',
        redirect: { name: 'feed' },
      },

      {
        path: 'feed',
        name: 'feed',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: 'features',
        name: 'features',
        component: () => import('pages/FeaturesPage.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: 'health',
        name: 'health',
        component: () => import('pages/HealthPage.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: 'attendance',
        name: 'attendance',
        component: () => import('pages/AttendancePage.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: 'menu',
        name: 'menu',
        component: () => import('pages/MenuPage.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('pages/NotificationsPage.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: 'account',
        name: 'account',
        component: () => import('pages/AccountPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'albums/:albumId',
        name: 'album-detail',
        component: () => import('pages/AlbumDetailPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/parent/weekly-menu',
        name: 'parent-weekly-menu',
        component: () => import('pages/MenuWeeklyPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/feedback',
        name: 'feedback-page',
        component: () => import('pages/FeedbackPage.vue'),
      },

      {
        path: '/child/:studentId',
        name: 'child-detail',
        component: () => import('pages/ChildDetailPage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
