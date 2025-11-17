// src/boot/auth-guard.js
import { boot } from 'quasar/wrappers';
import { useAuthStore } from 'src/stores/auth';

export default boot(({ router }) => {
  router.beforeEach((to, from, next) => {
    const auth = useAuthStore();        // ✅ pinia đã được Quasar gắn sẵn
    const isAuth = !!auth.accessToken;

    // Route cần đăng nhập
    if (to.matched.some(r => r.meta?.requiresAuth) && !isAuth) {
      return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    // Đã đăng nhập mà vào trang guestOnly (login...) thì đá về dashboard
    if (to.matched.some(r => r.meta?.guestOnly) && isAuth) {
      return next({ name: 'dashboard' });
    }

    next();
  });
});
