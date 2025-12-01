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

      <!-- Login Card -->
      <div class="login-card">
        <form @submit.prevent="onLogin" class="login-form">
          <!-- Username -->
          <div class="input-field">
            <q-icon name="person_outline" size="22px" class="field-icon" />
            <input
              v-model="username"
              type="text"
              placeholder="Tên đăng nhập"
              class="field-input"
            />
          </div>

          <!-- Password -->
          <div class="input-field">
            <q-icon name="lock_outline" size="22px" class="field-icon" />
            <input
              v-model="password"
              :type="isPwd ? 'password' : 'text'"
              placeholder="Mật khẩu"
              class="field-input"
            />
            <q-icon
              :name="isPwd ?  'visibility_off' : 'visibility'"
              size="22px"
              class="field-icon-right cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </div>

          <!-- Remember & Forgot -->
          <div class="form-options">
            <label class="remember-label">
              <input type="checkbox" v-model="remember" class="checkbox-input" />
          
              <span class="checkbox-text">Lưu mật khẩu</span>
            </label>
            <a href="#" class="forgot-link" @click.prevent>Quên mật khẩu?</a>
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="error-box">
            {{ errorMsg }}
          </div>

          <!-- Submit -->
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="! loading">Đăng nhập</span>
            <q-spinner-dots v-else color="white" size="24px" />
          </button>
        </form>

        <!-- Footer -->
        <div class="card-footer">
          © {{ currentYear }} Health Tracking
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "src/stores/auth";

import pageBg from "src/assets/bg.jpg";
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

const currentYear = new Date(). getFullYear();

const pageStyle = {
  backgroundImage: `url(${pageBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

const logoSrc = logoImg;

const onLogin = async () => {
  errorMsg.value = "";

  if (! username.value || ! password.value) {
    errorMsg. value = "Vui lòng nhập tài khoản và mật khẩu";
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
      typeof route.query.redirect === "string" ?  route.query.redirect : null;

    if (redirect) {
      await router.replace(redirect);
    } else {
      await router.replace({ name: "dashboard" });
    }
  } catch (err) {
    errorMsg.value =
      err?. response?.data?.message || "Đăng nhập thất bại, vui lòng kiểm tra lại. ";
  } finally {
    loading. value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 16px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 360px;
}

/* Logo */
.logo-section {
  text-align: center;
  margin-bottom: 20px;
}

.logo-img {
  height: 80px;
  width: auto;
  object-fit: contain;
}

.app-title {
  letter-spacing: 0.04em;
}

.app-subtitle {
  opacity: 0.9;
}

/* Card */
.login-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px 20px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.4s ease-out;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Input */
.input-field {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 2px solid #e5e5e5;
  border-radius: 10px;
  padding: 12px 14px;
  transition: border-color 0. 2s ease;
}

. input-field:focus-within {
  border-color: #2196f3;
}

.field-icon {
  color: #9e9e9e;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  background: transparent;
}

. field-input::placeholder {
  color: #bdbdbd;
}

. field-icon-right {
  color: #9e9e9e;
  flex-shrink: 0;
}

.field-icon-right:hover {
  color: #666;
}

/* Form options */
. form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}

. checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #2196f3;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0. 2s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: #2196f3;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: "✓";
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}

. checkbox-text {
  user-select: none;
}

.forgot-link {
  font-size: 14px;
  color: #2196f3;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* Error */
.error-box {
  background: #ffebee;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #d32f2f;
  text-align: center;
}

/* Submit */
.submit-btn {
  width: 100%;
  padding: 14px;
  background: #2196f3;
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
}

.submit-btn:hover:not(:disabled) {
  background: #1976d2;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Footer */
.card-footer {
  text-align: center;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #999;
}

/* Animation */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 380px) {
  .login-card {
    padding: 20px 16px 14px;
    border-radius: 14px;
  }

  .logo-img {
    height: 70px;
  }

  .input-field {
    padding: 10px 12px;
  }
}
</style>
