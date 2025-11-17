<template>
  <div class="login-page" :style="pageStyle">
    <div class="overlay"></div>

    <div class="content-wrapper column items-center">
      <!-- Logo + tên app -->
      <div class="logo-section column items-center">
        <img :src="logoSrc" alt="Health Tracking" class="logo-img" />
        <div class="app-title text-h5 text-weight-bold text-white q-mt-sm">
          Health <span class="text-primary">Tracking</span>
        </div>
        <div class="app-subtitle text-caption text-white q-mt-xs">
          Đồng hành cùng bé mỗi ngày
        </div>
      </div>

      <q-card class="login-card">
        <div class="login-card-bg" :style="cardBgStyle">
          <div class="login-card-content">
            <q-card-section class="text-center q-pb-none"> </q-card-section>

            <q-card-section class="q-gutter-md q-pt-md">
              <q-form @submit.prevent="onLogin" class="column q-gutter-md">
                <q-input
                  v-model="username"
                  label="Tên đăng nhập"
                  dense
                  outlined
                  clearable
                  :rules="[(val) => !!val || 'Vui lòng nhập tên đăng nhập']"
                >
                  <template #prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>

                <q-input
                  v-model="password"
                  label="Mật khẩu"
                  dense
                  outlined
                  :type="isPwd ? 'password' : 'text'"
                  :rules="[(val) => !!val || 'Vui lòng nhập mật khẩu']"
                >
                  <template #prepend>
                    <q-icon name="lock" />
                  </template>
                  <template #append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>

                <div class="row items-center justify-between q-mt-xs">
                  <q-checkbox v-model="remember" label="Lưu mật khẩu" />
                  <q-btn
                    flat
                    size="sm"
                    label="Quên mật khẩu?"
                    class="text-primary"
                    no-caps
                  />
                </div>

                <q-btn
                  label="Đăng nhập"
                  type="submit"
                  color="primary"
                  class="q-mt-sm"
                  unelevated
                  rounded
                  no-caps
                  :loading="loading"
                  :disable="loading"
                />
              </q-form>

              <div v-if="errorMsg" class="text-negative text-caption q-mt-sm text-center">
                {{ errorMsg }}
              </div>
            </q-card-section>

            <q-card-section
              class="text-center text-caption text-grey-6 q-pt-sm q-pb-none"
            >
              © {{ currentYear }} Health Tracking
            </q-card-section>
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "src/stores/auth";

// ảnh
import pageBg from "src/assets/bg.jpg";
import cardBg from "src/assets/bg.jpg";
import logoImg from "src/assets/logo-kids.png";

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const username = ref("");
const password = ref("");
const remember = ref(true);
const isPwd = ref(true);
const loading = ref(false);
const errorMsg = ref("");

const currentYear = new Date().getFullYear();

const pageStyle = {
  backgroundImage: `url(${pageBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

const cardBgStyle = {
  backgroundImage: `url(${cardBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const logoSrc = logoImg;

const onLogin = async () => {
  errorMsg.value = "";

  if (!username.value || !password.value) {
    errorMsg.value = "Vui lòng nhập tài khoản và mật khẩu";
    $q.notify({ type: "negative", message: errorMsg.value });
    return;
  }

  loading.value = true;
  try {
    await auth.login({
      username: username.value,
      password: password.value,
    });

    $q.notify({
      type: "positive",
      message: "Đăng nhập thành công",
    });

    const redirect =
      typeof route.query.redirect === "string" ? route.query.redirect : null;

    if (redirect) {
      await router.replace(redirect);
    } else {
      await router.replace({ name: "dashboard" });
    }
  } catch (err) {
    errorMsg.value =
      err?.response?.data?.message || "Đăng nhập thất bại, vui lòng kiểm tra lại.";
    $q.notify({ type: "negative", message: errorMsg.value });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* nền tổng thể */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 16px;
}

/* lớp phủ tối nhẹ */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.25));
}

/* container chính */
.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  gap: 12px;
}

/* logo + text */
.logo-section {
  text-align: center;
  margin-bottom: 8px;
}

.logo-img {
  height: 80px;
  width: auto;
  object-fit: contain;
}

.app-title {
  letter-spacing: 0.06em;
}

.app-subtitle {
  opacity: 0.9;
}

/* card login */
.login-card {
  width: 100%;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
  background: transparent;
  animation: slideUp 0.5s ease-out;
  margin-top: -10px;
}

.login-card-bg {
  position: relative;
}

/* lớp mờ trắng để form dễ đọc */
.login-card-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at top,
    rgba(255, 255, 255, 0.96),
    rgba(255, 255, 255, 0.85)
  );
}

/* nội dung form */
.login-card-content {
  position: relative;
  z-index: 1;
  padding: 18px 18px 16px;
}

/* avatar tròn nhỏ trong header */
.card-avatar {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: rgba(25, 118, 210, 0.1);
  margin: 0 auto;
}

/* animation xuất hiện card */
@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* responsive cho màn nhỏ */
@media (max-width: 400px) {
  .login-card {
    border-radius: 18px;
  }
  .logo-img {
    height: 68px;
  }
}
</style>
