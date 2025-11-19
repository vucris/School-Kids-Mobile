<template>
  <q-page class="menu-page">
    <div class="q-pa-md q-pt-sm">
      <!-- Tiêu đề + bé -->
      <div class="row items-center justify-between q-mb-sm">
        <div>
          <div class="text-subtitle1 text-weight-semibold">
            Hoạt động hôm nay
          </div>
          <div class="text-caption text-grey-7">
            Hoạt động của bé {{ childName }}
          </div>
        </div>
        <q-avatar size="40px">
          <img :src="childAvatar" alt="child" />
        </q-avatar>
      </div>

      <!-- Strip ngày trong tuần -->
      <div class="day-strip q-mt-sm">
        <div class="row no-wrap">
          <div
            v-for="day in days"
            :key="day.key"
            class="day-item"
            :class="{ active: day.key === selectedDay }"
            @click="selectedDay = day.key"
          >
            <div class="day-label-top">
              {{ day.label }}
            </div>
            <div class="day-date">
              {{ day.date }}
            </div>
          </div>
        </div>
      </div>

      <!-- Ribbon hôm nay -->
      <q-card class="today-ribbon q-mt-md">
        <q-card-section class="q-pa-xs">
          <div class="row items-center justify-center">
            <q-icon name="celebration" size="18px" class="q-mr-xs" />
            <span class="text-caption text-weight-medium">
              Hôm nay, {{ todayLabel }}
            </span>
            <q-icon name="celebration" size="18px" class="q-ml-xs" />
          </div>
        </q-card-section>
      </q-card>

      <!-- Card thực đơn -->
      <q-card class="menu-card q-mt-md">
        <q-card-section class="row no-wrap items-center q-pb-xs">
          <q-avatar size="32px" class="q-mr-sm bg-pink-2">
            <q-icon name="restaurant_menu" class="text-pink-6" />
          </q-avatar>
          <div class="col">
            <div class="text-body2 text-weight-medium">
              Thực đơn của bé {{ childName }}
            </div>
            <div class="text-caption text-grey-6">
              {{ menuUpdatedAt }}
            </div>
          </div>
        </q-card-section>

        <q-separator spaced />

        <q-card-section class="q-pt-xs">
          <!-- Bữa sáng -->
          <div class="meal-row">
            <q-chip dense square class="meal-chip breakfast">
              Bữa sáng
            </q-chip>
            <div class="meal-content">
              <div
                v-for="(item, idx) in menu.breakfast"
                :key="'bfast-' + idx"
                class="text-body2"
              >
                {{ item }}
              </div>
            </div>
          </div>

          <!-- Bữa trưa -->
          <div class="meal-row">
            <q-chip dense square class="meal-chip lunch">
              Bữa trưa
            </q-chip>
            <div class="meal-content">
              <div
                v-for="(item, idx) in menu.lunch"
                :key="'lunch-' + idx"
                class="text-body2"
              >
                {{ item }}
              </div>
            </div>
          </div>

          <!-- Bữa chiều -->
          <div class="meal-row q-mb-none">
            <q-chip dense square class="meal-chip snack">
              Bữa chiều
            </q-chip>
            <div class="meal-content">
              <div
                v-for="(item, idx) in menu.snack"
                :key="'snack-' + idx"
                class="text-body2"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Nút xem thực đơn tuần -->
      <div class="q-mt-md">
        <q-btn
          class="week-btn full-width"
          color="primary"
          rounded
          unelevated
          no-caps
          @click="viewWeeklyMenu"
        >
          Xem thực đơn tuần
        </q-btn>
      </div>

      <!-- Card thời gian ngủ -->
      <q-card class="sleep-card q-mt-md q-mb-lg">
        <q-card-section class="row items-center">
          <q-avatar size="30px" class="bg-amber-100 q-mr-sm">
            <q-icon name="hotel" class="text-amber-7" />
          </q-avatar>
          <div class="col">
            <div class="text-caption text-grey-7">
              Con ngủ từ
              <span class="sleep-time">{{ sleep.from }}</span>
              đến
              <span class="sleep-time">{{ sleep.to }}</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from "vue";

const childName = "Pam";
const childAvatar = "https://i.postimg.cc/2jFv66sG/avatar-kid.png";

// demo ngày trong tuần
const days = [
  { key: "today", label: "Hôm nay", date: "20/2" },
  { key: "t3", label: "T3", date: "21/2" },
  { key: "t4", label: "T4", date: "22/2" },
  { key: "t5", label: "T5", date: "23/2" },
  { key: "t6", label: "T6", date: "24/2" },
  { key: "t7", label: "T7", date: "25/2" }
];

const selectedDay = ref("today");

const todayLabel = computed(() => {
  // demo, sau này có thể format theo ngày thật
  return "01/02/2024";
});

// thực đơn demo – sau này thay bằng API
const menu = ref({
  breakfast: ["Bún bò", "Sữa tươi"],
  lunch: ["Cơm trắng", "Gà kho gừng", "Thịt heo chiên mắm"],
  snack: ["Mỳ hải sản", "Sữa chua"]
});

const menuUpdatedAt = "Cập nhật 12 giờ trước";

const sleep = ref({
  from: "11:30",
  to: "14:00"
});

function viewWeeklyMenu() {
  // sau này chuyển sang màn thực đơn tuần / dialog
  console.log("Xem thực đơn tuần");
}
</script>

<style scoped>
.menu-page {
  background: #f5f7fb;
  padding-bottom: 64px;
}

.day-strip {
  background: #ffffff;
  border-radius: 16px;
  padding: 6px 4px;
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.08);
}

.day-item {
  min-width: 64px;
  border-radius: 12px;
  padding: 6px 4px;
  margin: 0 2px;
  text-align: center;
  font-size: 11px;
  color: #6b7280;
  cursor: pointer;
}

.day-item.active {
  background: #4f46e5;
  color: #ffffff;
}

.day-label-top {
  font-weight: 600;
}

.day-date {
  font-size: 10px;
  margin-top: 2px;
}

/* ribbon hôm nay */
.today-ribbon {
  border-radius: 18px;
  background: linear-gradient(90deg, #ffecd2, #fcb69f);
  color: #374151;
  box-shadow: 0 4px 10px rgba(252, 182, 159, 0.45);
}

/* card thực đơn */
.menu-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 6px 14px rgba(15, 40, 80, 0.12);
}

/* các dòng bữa ăn */
.meal-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.meal-row:last-child {
  margin-bottom: 0;
}

.meal-chip {
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  border-radius: 10px;
  padding: 4px 8px;
  min-width: 68px;
  text-align: center;
}

.meal-chip.breakfast {
  background: #22c55e;
}
.meal-chip.lunch {
  background: #f59e0b;
}
.meal-chip.snack {
  background: #ef4444;
}

.meal-content {
  margin-left: 10px;
}

.meal-content .text-body2 {
  font-size: 13px;
}

/* nút xem tuần */
.week-btn {
  height: 40px;
  font-size: 14px;
}

/* card ngủ */
.sleep-card {
  border-radius: 16px;
  background: #fff7ed;
  box-shadow: 0 2px 8px rgba(248, 171, 108, 0.3);
}

.sleep-time {
  color: #2563eb;
  font-weight: 600;
}

/* nhỏ hơn */
@media (max-width: 380px) {
  .menu-card {
    border-radius: 18px;
  }
}
</style>
