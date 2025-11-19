// src/boot/auth-guard.js
import { boot } from 'quasar/wrappers';
import { useAuthStore } from 'src/stores/auth';

export default boot(({ router }) => {
  router.beforeEach((to, from, next) => {
    const auth = useAuthStore();

    // nếu state rỗng nhưng localStorage có token (F5 trang) thì init lại
    if (!auth.accessToken && localStorage.getItem('access_token')) {
      auth.initFromStorage();
    }

    const isAuth = !!auth.accessToken;

    // cần đăng nhập
    if (to.matched.some(r => r.meta?.requiresAuth) && !isAuth) {
      return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    // đã đăng nhập mà còn vào /login thì đá về feed
    if (to.matched.some(r => r.meta?.guestOnly) && isAuth) {
      return next({ name: 'feed' });
    }

    next();
  });
});
