<template>
  <q-page class="feature-page">
    <!-- header nhỏ dễ thương trong thân trang -->
    <div class="feature-header q-pt-md q-px-md q-pb-sm">
      <div class="feature-chip row items-center justify-center q-mb-xs">
        <q-icon name="favorite" size="16px" class="q-mr-xs" />
        <span>Cùng bé khám phá</span>
      </div>

      <div class="text-h6 text-center text-dark text-weight-medium">
        Tính năng dành cho phụ huynh
      </div>
      <div class="text-caption text-center text-grey-7 q-mt-xs">
        Chạm vào icon để mở chức năng bạn cần
      </div>
    </div>

    <div class="q-pa-md q-pt-sm">
      <div class="row q-col-gutter-md">
        <div v-for="item in features" :key="item.key" class="col-4">
          <q-card
            flat
            class="feature-card column items-center q-pa-sm cursor-pointer"
            @click="go(item)"
          >
            <div class="feature-icon-wrapper">
              <div class="feature-icon-ring" :class="item.ringClass">
                <q-avatar size="46px" class="feature-avatar">
                  <q-icon :name="item.icon" size="26px" />
                </q-avatar>
              </div>
            </div>

            <div class="feature-text text-center">
              <div class="feature-label">
                {{ item.label }}
              </div>
              <div v-if="item.desc" class="feature-desc">
                {{ item.desc }}
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const features = [
  // {
  //   key: "album",
  //   label: "Album ảnh",
  //   desc: "Khoảnh khắc mỗi ngày",
  //   icon: "image",
  //   ringClass: "ring-teal",
  //   route: "/features/album",
  // },

  {
    key: "leave",
    label: "Đơn xin nghỉ học",
    desc: "Gửi đơn thật dễ",
    icon: "assignment",
    ringClass: "ring-pink",
    route: "/features/leave",
  },
  {
    key: "attendance",
    label: "Điểm danh",
    desc: "Ra vào an toàn",
    icon: "fingerprint",
    ringClass: "ring-cyan",
    route: "/attendance",
  },
  {
    key: "health",
    label: "Sức khỏe",
    desc: "Theo dõi chỉ số",
    icon: "favorite",
    ringClass: "ring-red",
    route: "/health", // 👈 đổi từ /features/health thành /health
  },
  {
    key: "menu",
    label: "Thực đơn",
    desc: "Bữa ăn hàng ngày",
    icon: "restaurant_menu",
    ringClass: "ring-indigo",
    route: "/menu",
  },
  {
    key: "fee",
    label: "Học phí",
    desc: "Thanh toán nhanh",
    icon: "paid",
    ringClass: "ring-amber",
    route: "/features/fee",
  },
  {
    key: "activity",
    label: "Feedback",
    desc: "Viết phản hồi cho giáo viên",
    icon: "celebration",
    ringClass: "ring-purple",
    route: "/feedback", // mở page phản hồi
  },
];

function go(item) {
  console.log("Clicked feature:", item.key);
  if (item.route) {
    router.push(item.route); // dùng thật router nên ESLint không báo nữa
  }
}
</script>

<style scoped>
.feature-page {
  position: relative;
  min-height: 100vh;
  padding-bottom: 64px; /* chừa chỗ cho bottom tabs */
  background: linear-gradient(180deg, #fef6ff, #f3f9ff);
}

/* vài đốm màu trang trí nền */
.feature-page::before,
.feature-page::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.4;
  z-index: 0;
}
.feature-page::before {
  width: 120px;
  height: 120px;
  background: #ffe0f2;
  top: -20px;
  left: -30px;
}
.feature-page::after {
  width: 140px;
  height: 140px;
  background: #d0f4ff;
  top: 40px;
  right: -40px;
}

.feature-header {
  position: relative;
  z-index: 1;
}

.feature-chip {
  display: inline-flex;
  margin: 0 auto;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  color: #ff6d8a;
  box-shadow: 0 2px 6px rgba(255, 105, 135, 0.25);
}

/* card ô chức năng */
.feature-card {
  position: relative;
  z-index: 1;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 4px 10px rgba(15, 40, 80, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.feature-card:active {
  transform: scale(0.96);
  box-shadow: 0 2px 4px rgba(15, 40, 80, 0.06);
}

/* vòng tròn icon */
.feature-icon-wrapper {
  margin-bottom: 4px;
}

.feature-icon-ring {
  width: 60px;
  height: 60px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
}

.feature-avatar {
  background: white;
}

/* màu pastel cho từng tính năng */
.ring-teal {
  background: linear-gradient(145deg, #b2f5ea, #e6fffa);
  color: #00897b;
}
.ring-indigo {
  background: linear-gradient(145deg, #c7d2fe, #e0e7ff);
  color: #3949ab;
}
.ring-pink {
  background: linear-gradient(145deg, #fecdd3, #ffe4e6);
  color: #d81b60;
}
.ring-cyan {
  background: linear-gradient(145deg, #bae6fd, #e0f2fe);
  color: #0284c7;
}
.ring-red {
  background: linear-gradient(145deg, #fecaca, #fee2e2);
  color: #c62828;
}
.ring-amber {
  background: linear-gradient(145deg, #fde68a, #fef3c7);
  color: #f59e0b;
}
.ring-purple {
  background: linear-gradient(145deg, #e9d5ff, #f3e8ff);
  color: #6d28d9;
}

/* text */
.feature-text {
  line-height: 1.2;
}

.feature-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.feature-desc {
  font-size: 10px;
  margin-top: 2px;
  color: #9ca3af;
}

/* màn nhỏ */
@media (max-width: 380px) {
  .feature-card {
    border-radius: 16px;
  }
  .feature-label {
    font-size: 11px;
  }
  .feature-desc {
    font-size: 9px;
  }
}
</style>
