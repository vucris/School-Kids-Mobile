<template>
  <q-page class="account-page">
    <div class="account-scroll q-pa-md q-pt-sm">
      <!-- HEADER TÀI KHOẢN -->
      <q-card class="account-header-card">
        <div class="header-bg"></div>

        <div class="header-content row no-wrap items-center">
          <div class="col-auto q-pr-sm">
            <q-avatar size="70px" class="parent-avatar">
              <img :src="profile.avatarUrl" alt="parent" />
            </q-avatar>
          </div>

          <div class="col">
            <div class="text-subtitle1 text-weight-semibold text-dark">
              {{ profile.fullName }}
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              {{ roleLabel }} • {{ profile.relationship }}
            </div>

            <div class="row items-center q-mt-xs">
              <q-chip
                dense
                square
                color="primary"
                text-color="white"
                class="q-mr-xs text-caption"
              >
                {{ child.className }}
              </q-chip>
              <q-chip
                dense
                outline
                color="white"
                text-color="primary"
                class="text-caption"
              >
                Mã HS: {{ child.studentCode }}
              </q-chip>
            </div>
          </div>

          <div class="col-auto text-right">
            <div class="text-caption text-grey-6 q-mb-xs">
              {{ child.name }}
            </div>
            <q-badge color="pink-4" class="text-caption text-white q-px-sm q-py-xs">
              Bé đang đi học tốt 💕
            </q-badge>
          </div>
        </div>
      </q-card>

      <!-- THÔNG TIN PHỤ HUYNH -->
      <section class="q-mt-lg">
        <div class="section-title row items-center q-mb-xs">
          <q-icon name="person" size="18px" class="q-mr-xs text-primary" />
          <span>Thông tin phụ huynh</span>
        </div>

        <q-card class="info-card">
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon name="badge" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Họ và tên</q-item-label>
                <q-item-label caption>{{ profile.fullName }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Tên đăng nhập</q-item-label>
                <q-item-label caption>{{ profile.username }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="phone" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Số điện thoại</q-item-label>
                <q-item-label caption>{{
                  profile.phone || "Chưa cập nhật"
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="email" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Email</q-item-label>
                <q-item-label caption>{{
                  profile.email || "Chưa cập nhật"
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="family_restroom" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Quan hệ với bé</q-item-label>
                <q-item-label caption>{{ profile.relationship }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="work" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Nghề nghiệp</q-item-label>
                <q-item-label caption>{{
                  profile.occupation || "Chưa cập nhật"
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </section>

      <!-- THÔNG TIN BÉ -->
      <section class="q-mt-lg">
        <div class="section-title row items-center q-mb-xs">
          <q-icon name="child_care" size="18px" class="q-mr-xs text-pink-5" />
          <span>Thông tin bé</span>
        </div>

        <!-- 🔹 Nếu có từ 2 bé trở lên thì cho chọn bé -->
        <div
          v-if="children.length > 1"
          class="children-switch row items-center q-mt-sm q-mb-xs"
        >
          <span class="text-caption text-grey-7 q-mr-sm">Chọn bé:</span>
          <div class="row no-wrap scroll-x">
            <q-chip
              v-for="s in children"
              :key="s.id"
              clickable
              @click="selectChild(s)"
              :color="s.studentCode === child.studentCode ? 'primary' : 'white'"
              :text-color="s.studentCode === child.studentCode ? 'white' : 'grey-8'"
              class="q-mr-xs q-mb-xs children-chip"
            >
              {{ s.name }}
            </q-chip>
          </div>
        </div>

        <q-card class="info-card">
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon name="face" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Họ tên bé</q-item-label>
                <q-item-label caption>{{ child.name }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="school" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Lớp</q-item-label>
                <q-item-label caption>{{ child.className }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="confirmation_number" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Mã học sinh</q-item-label>
                <q-item-label caption>{{ child.studentCode }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </section>

      <!-- CÀI ĐẶT & HÀNH ĐỘNG -->
      <section class="q-mt-lg q-mb-lg">
        <div class="section-title row items-center q-mb-xs">
          <q-icon name="settings" size="18px" class="q-mr-xs text-indigo-5" />
          <span>Thiết lập</span>
        </div>

        <q-card class="info-card">
          <q-list>
            <q-item clickable v-ripple @click="changePassword">
              <q-item-section avatar>
                <q-icon name="vpn_key" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Đổi mật khẩu</q-item-label>
                <q-item-label caption> Tăng độ an toàn cho tài khoản </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="openNotificationSettings">
              <q-item-section avatar>
                <q-icon name="notifications" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Thông báo</q-item-label>
                <q-item-label caption> Bật tắt thông báo từ trường </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-separator spaced inset />

            <q-item clickable v-ripple @click="onLogout">
              <q-item-section avatar>
                <q-icon name="logout" class="text-negative" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-negative"> Đăng xuất </q-item-label>
                <q-item-label caption>
                  Thoát khỏi ứng dụng trên thiết bị này
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { api } from "boot/axios";

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();

const loadingProfile = ref(false);

// thông tin phụ huynh
const profile = ref({
  fullName: "Phụ huynh",
  username: "parent_account",
  email: "",
  phone: "",
  relationship: "Phụ huynh",
  occupation: "",
  avatarUrl: "https://i.postimg.cc/2jFv66sG/avatar-kid.png",
});

// danh sách tất cả con
const children = ref([]);

// bé đang được chọn để hiển thị
const child = ref({
  name: "Bé yêu",
  className: "Lớp của bé",
  studentCode: "Mã HS",
});

// role hiển thị
const roleLabel = computed(() => {
  const role = auth.user?.role || localStorage.getItem("role") || "PARENT";

  if (String(role).toUpperCase().includes("TEACH")) return "Giáo viên";
  if (String(role).toUpperCase().includes("ADMIN")) return "Quản trị viên";
  return "Phụ huynh";
});

// chọn bé khi click chip
function selectChild(s) {
  child.value = { ...s };
}

// LẤY DỮ LIỆU TỪ BE
async function fetchProfile() {
  try {
    loadingProfile.value = true;

    // 1. Lấy username hiện tại
    const username = auth.user?.username || localStorage.getItem("username");

    if (!username) {
      console.warn("[Account] Không tìm thấy username hiện tại");
      return;
    }

    // 2. /parents/all → tìm phụ huynh theo username
    const resParents = await api.get("/parents/all");
    const apiResp = resParents.data || {};
    const parents = apiResp.data || [];

    const parent = parents.find((p) => p.username === username);

    if (!parent) {
      $q.notify({
        type: "warning",
        message: "Không tìm thấy thông tin phụ huynh cho tài khoản hiện tại.",
      });
      return;
    }

    // cập nhật thông tin phụ huynh
    profile.value = {
      ...profile.value,
      fullName: parent.fullName || profile.value.fullName,
      username: parent.username || username,
      phone: parent.phone || "",
      email: parent.email || "",
    };

    // 3. /parents/{parentId}/children → lấy danh sách con
    const parentId = parent.id;
    if (!parentId) return;

    const resChildren = await api.get(`/parents/${parentId}/children`);
    const childResp = resChildren.data || {};
    const list = childResp.data || [];

    // map về dạng gọn cho FE
    children.value = list.map((s) => ({
      id: s.studentId,
      name: s.fullName,
      className: s.className,
      studentCode: s.studentCode,
    }));

    // nếu có ít nhất 1 bé, set bé đầu tiên là mặc định
    if (children.value.length > 0) {
      child.value = { ...children.value[0] };
    }
  } catch (e) {
    console.error("[Account] fetchProfile error", e);
    $q.notify({
      type: "negative",
      message: "Không lấy được thông tin tài khoản. Vui lòng thử lại.",
    });
  } finally {
    loadingProfile.value = false;
  }
}

onMounted(() => {
  if (auth.accessToken) {
    fetchProfile();
  }
});

// ---- action trong phần Thiết lập ----
function changePassword() {
  $q.notify({
    type: "info",
    message: "Tính năng đổi mật khẩu sẽ được bổ sung sau.",
  });
}

function openNotificationSettings() {
  $q.notify({
    type: "info",
    message: "Tính năng cài đặt thông báo sẽ được bổ sung sau.",
  });
}

function onLogout() {
  $q.dialog({
    title: "Đăng xuất",
    message: "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?",
    cancel: true,
    persistent: true,
    ok: {
      label: "Đồng ý",
      unelevated: true,
      color: "negative",
      noCaps: true,
    },
    cancelLabel: "Huỷ",
  }).onOk(async () => {
    await auth.logout();
    router.replace({ name: "login" });
  });
}
</script>

<style scoped>
.account-page {
  background: linear-gradient(180deg, #fef6ff, #f5f7fb);
  padding-bottom: 64px; /* chừa chỗ cho bottom tabs */
}

.account-scroll {
  max-width: 540px;
  margin: 0 auto;
}

/* header */
.account-header-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 40, 80, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.95);
}

.header-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, #ffe4f1 0, transparent 55%),
    radial-gradient(circle at bottom right, #dbeafe 0, transparent 60%);
  opacity: 0.85;
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 14px 16px 14px;
}

.parent-avatar {
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
}

/* section chung */
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
}

.info-card {
  margin-top: 4px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(15, 40, 80, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.95);
}

/* chip chọn bé */
.children-switch .scroll-x {
  overflow-x: auto;
}

.children-chip {
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.15);
}

/* nút, item */
.q-item__label.caption {
  font-size: 11px;
}

/* responsive nhỏ */
@media (max-width: 380px) {
  .account-header-card {
    border-radius: 18px;
  }
  .info-card {
    border-radius: 16px;
  }
}
</style>
