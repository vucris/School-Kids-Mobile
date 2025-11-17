// src/api/authGuard.js
import { useAuthStore } from 'src/stores/auth.js';

export function attachAuthGuard(router, pinia) {
  router.beforeEach((to, from, next) => {
    const auth = useAuthStore(pinia);
    const isAuth = !!auth.accessToken;

    // Debug khi cần
    // console.log('[Guard]', { to: to.fullPath, from: from.fullPath, isAuth });

    // Chặn route cần login
    if (to.matched.some((r) => r.meta?.requiresAuth) && !isAuth) {
      return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    // Nếu đã login mà vào trang guestOnly (login, register...) thì đẩy về dashboard
    if (to.matched.some((r) => r.meta?.guestOnly) && isAuth) {
      return next({ name: 'dashboard' });
    }

    next();
  });
}
