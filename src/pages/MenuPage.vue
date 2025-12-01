<template>
  <q-page class="menu-page">
    <!-- HEADER GRADIENT -->
    <div class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="header-icon">
          <q-icon name="restaurant_menu" size="28px" />
        </div>
        <div class="header-text">
          <h1>Thực đơn của bé</h1>
          <p>Xem thực đơn hàng ngày tại trường</p>
        </div>
      </div>
    </div>

    <div class="menu-scroll q-pa-md">
      <!-- CHỌN BÉ (nếu có nhiều con) -->
      <section v-if="children.length > 1" class="child-section q-mb-md">
        <div class="section-label">
          <q-icon name="child_care" size="16px" class="q-mr-xs" />
          <span>Chọn bé</span>
        </div>

        <q-card class="child-card">
          <div class="child-card-bg"></div>
          <div class="child-card-content">
            <div class="children-list">
              <div
                v-for="s in children"
                :key="s.id"
                class="child-chip"
                :class="{ active: s.id === selectedStudentId }"
                @click="selectChild(s)"
              >
                <div class="child-chip-avatar">
                  <q-icon name="face" size="18px" />
                </div>
                <span>{{ s.name }}</span>
              </div>
            </div>
          </div>
        </q-card>
      </section>

      <!-- THÔNG TIN BÉ ĐANG CHỌN -->
      <section v-if="childName" class="current-child-section q-mb-md">
        <q-card class="current-child-card">
          <div class="row items-center q-pa-sm">
            <q-avatar size="48px" class="child-avatar q-mr-sm">
              <q-icon name="child_care" size="28px" color="pink-5" />
            </q-avatar>
            <div class="col">
              <div class="text-subtitle2 text-weight-semibold text-grey-9">
                {{ childName }}
              </div>
              <div class="text-caption text-grey-6">
                {{ currentChild?.className || "---" }}
              </div>
            </div>
            <q-badge color="pink-4" text-color="white" class="q-px-sm q-py-xs">
              <q-icon name="restaurant" size="12px" class="q-mr-xs" />
              Thực đơn
            </q-badge>
          </div>
        </q-card>
      </section>

      <!-- TABS: NGÀY / TUẦN -->
      <section class="view-tabs-section q-mb-md">
        <div class="view-tabs">
          <button
            class="view-tab"
            :class="{ active: viewMode === 'day' }"
            @click="viewMode = 'day'"
          >
            <q-icon name="today" size="18px" />
            <span>Theo ngày</span>
          </button>
          <button
            class="view-tab"
            :class="{ active: viewMode === 'week' }"
            @click="viewMode = 'week'"
          >
            <q-icon name="date_range" size="18px" />
            <span>Theo tuần</span>
          </button>
        </div>
      </section>

      <!-- CHẾ ĐỘ NGÀY -->
      <template v-if="viewMode === 'day'">
        <!-- CHỌN NGÀY -->
        <section class="date-picker-section q-mb-md">
          <q-card class="date-picker-card">
            <div class="date-picker-inner">
              <q-btn
                flat
                round
                dense
                icon="chevron_left"
                class="date-nav-btn"
                @click="changeDay(-1)"
              />

              <div class="date-display" @click="showDatePicker = true">
                <div class="date-icon">
                  <q-icon name="event" size="22px" />
                </div>
                <div class="date-info">
                  <div class="date-weekday">{{ selectedDayOfWeek }}</div>
                  <div class="date-full">{{ formatDisplayDate(selectedDate) }}</div>
                </div>
                <q-icon name="expand_more" size="18px" class="date-expand" />
              </div>

              <q-btn
                flat
                round
                dense
                icon="chevron_right"
                class="date-nav-btn"
                @click="changeDay(1)"
              />
            </div>

            <!-- Quick date buttons -->
            <div class="quick-dates">
              <button
                class="quick-date-btn"
                :class="{ active: isToday }"
                @click="goToToday"
              >
                Hôm nay
              </button>
              <button
                class="quick-date-btn"
                :class="{ active: isTomorrow }"
                @click="goToTomorrow"
              >
                Ngày mai
              </button>
              <button
                class="quick-date-btn"
                :class="{ active: isYesterday }"
                @click="goToYesterday"
              >
                Hôm qua
              </button>
            </div>
          </q-card>
        </section>

        <!-- LOADING -->
        <q-card v-if="loading" flat class="loading-card q-pa-lg q-mb-md">
          <div class="loading-content">
            <q-spinner-dots size="48px" color="pink-4" />
            <p class="q-mt-md text-grey-6">Đang tải thực đơn...</p>
          </div>
        </q-card>

        <!-- KHÔNG CÓ DỮ LIỆU -->
        <q-banner v-else-if="!selectedDayMenu" class="empty-banner q-mb-md" rounded>
          <template #avatar>
            <div class="empty-icon">
              <q-icon name="no_meals" size="32px" />
            </div>
          </template>
          <div class="empty-text">
            <strong>Chưa có thực đơn</strong>
            <p>Ngày {{ formatDisplayDate(selectedDate) }} chưa có thực đơn.</p>
          </div>
        </q-banner>

        <!-- HIỂN THỊ THỰC ĐƠN NGÀY -->
        <q-card v-else class="day-menu-card q-mb-md">
          <div class="day-menu-header">
            <div class="menu-header-icon">
              <q-icon name="restaurant_menu" size="24px" />
            </div>
            <div class="menu-header-info">
              <div class="menu-title">
                Thực đơn ngày {{ formatDisplayDate(selectedDate) }}
              </div>
              <div class="menu-subtitle">{{ selectedDayOfWeek }}</div>
            </div>
          </div>

          <div class="meals-container">
            <div
              v-for="(type, idx) in mealTypes"
              :key="type"
              class="meal-section"
              :class="{ 'with-divider': idx < mealTypes.length - 1 }"
            >
              <div class="meal-header">
                <div class="meal-badge" :class="badgeClass(type)">
                  <q-icon :name="getMealIcon(type)" size="14px" />
                  <span>{{ badgeLabel(type) }}</span>
                </div>
                <div class="meal-time">{{ getMealTime(type) }}</div>
              </div>

              <div class="meal-dishes">
                <template v-if="selectedDayMenu.mealsByType[type]?.length">
                  <div
                    v-for="(dish, i) in selectedDayMenu.mealsByType[type]"
                    :key="i"
                    class="dish-item"
                  >
                    <div class="dish-bullet"></div>
                    <span>{{ dish }}</span>
                  </div>
                </template>
                <div v-else class="dish-empty">
                  <q-icon name="info_outline" size="14px" />
                  <span>Chưa cập nhật</span>
                </div>
              </div>
            </div>
          </div>
        </q-card>
      </template>

      <!-- CHẾ ĐỘ TUẦN -->
      <template v-else>
        <!-- CHỌN TUẦN -->
        <section class="week-picker-section q-mb-md">
          <q-card class="week-picker-card">
            <div class="week-picker-inner">
              <q-btn
                flat
                round
                dense
                icon="chevron_left"
                class="week-nav-btn"
                @click="changeWeek(-1)"
              />

              <div class="week-display">
                <div class="week-icon">
                  <q-icon name="date_range" size="24px" />
                </div>
                <div class="week-info">
                  <div class="week-label">Tuần</div>
                  <div class="week-range">
                    {{ formatDisplayDate(weekStart) }} - {{ formatDisplayDate(weekEnd) }}
                  </div>
                </div>
              </div>

              <q-btn
                flat
                round
                dense
                icon="chevron_right"
                class="week-nav-btn"
                @click="changeWeek(1)"
              />
            </div>

            <div class="quick-weeks">
              <button
                class="quick-week-btn"
                :class="{ active: isCurrentWeek }"
                @click="goToCurrentWeek"
              >
                Tuần này
              </button>
              <button
                class="quick-week-btn"
                :class="{ active: isNextWeek }"
                @click="goToNextWeek"
              >
                Tuần sau
              </button>
            </div>
          </q-card>
        </section>

        <!-- LOADING -->
        <q-card v-if="loading" flat class="loading-card q-pa-lg q-mb-md">
          <div class="loading-content">
            <q-spinner-dots size="48px" color="pink-4" />
            <p class="q-mt-md text-grey-6">Đang tải thực đơn tuần...</p>
          </div>
        </q-card>

        <!-- KHÔNG CÓ DỮ LIỆU -->
        <q-banner v-else-if="!days.length" class="empty-banner q-mb-md" rounded>
          <template #avatar>
            <div class="empty-icon">
              <q-icon name="no_meals" size="32px" />
            </div>
          </template>
          <div class="empty-text">
            <strong>Chưa có thực đơn</strong>
            <p>Tuần này chưa có thực đơn.</p>
          </div>
        </q-banner>

        <!-- DANH SÁCH NGÀY TRONG TUẦN -->
        <div v-else class="week-days-list">
          <q-card
            v-for="day in days"
            :key="day.menuDate"
            class="week-day-card q-mb-md"
            @click="selectDayFromWeek(day)"
          >
            <div class="week-day-header">
              <div class="week-day-date">
                <div class="day-number">{{ getDayNumber(day.menuDate) }}</div>
                <div class="day-name">{{ day.dayOfWeek }}</div>
              </div>
              <q-icon name="chevron_right" size="20px" class="week-day-arrow" />
            </div>

            <div class="week-day-meals">
              <div v-for="type in mealTypes" :key="type" class="week-meal-preview">
                <span class="meal-type-label" :class="badgeClass(type)">
                  {{ getShortMealLabel(type) }}
                </span>
                <span class="meal-preview-text">
                  {{ getMealPreview(day.mealsByType[type]) }}
                </span>
              </div>
            </div>
          </q-card>
        </div>
      </template>

      <!-- NÚT XEM CHI TIẾT -->
      <section class="action-section q-mt-lg q-mb-xl">
        <q-btn class="action-btn" unelevated rounded no-caps @click="goToWeeklyMenu">
          <div class="btn-content">
            <div class="btn-icon">
              <q-icon name="calendar_month" size="24px" />
            </div>
            <div class="btn-text">
              <span class="btn-title">Xem lịch thực đơn</span>
              <span class="btn-desc">Xem thực đơn theo lịch tháng</span>
            </div>
          </div>
          <q-icon name="chevron_right" size="20px" class="btn-arrow" />
        </q-btn>
      </section>
    </div>

    <!-- DATE PICKER DIALOG -->
    <q-dialog v-model="showDatePicker" position="bottom">
      <q-card class="date-dialog-card">
        <q-card-section class="date-dialog-header">
          <div class="text-subtitle1 text-weight-semibold">Chọn ngày</div>
          <q-btn flat round dense icon="close" @click="showDatePicker = false" />
        </q-card-section>

        <q-card-section class="date-dialog-body">
          <q-date
            v-model="tempDate"
            mask="YYYY-MM-DD"
            color="pink-5"
            today-btn
            flat
            class="full-width"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Hủy" color="grey-7" @click="showDatePicker = false" />
          <q-btn
            unelevated
            label="Chọn"
            color="pink-5"
            text-color="white"
            @click="confirmDatePicker"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "src/stores/auth";

const $q = useQuasar();
const auth = useAuthStore();
const router = useRouter();

const loading = ref(false);
const days = ref([]);
const children = ref([]);
const childName = ref("");
const selectedStudentId = ref(null);
const selectedParentId = ref(null);

const viewMode = ref("day"); // 'day' | 'week'
const showDatePicker = ref(false);
const tempDate = ref("");

const today = new Date();
const selectedDate = ref(new Date(today));
const weekStart = ref(getMonday(today));
const weekEnd = ref(addDays(weekStart.value, 6));

const mealTypes = ["Sáng", "Trưa", "Chiều"];

/* ======= COMPUTED ======= */

const currentChild = computed(
  () => children.value.find((c) => c.id === selectedStudentId.value) || null
);

const selectedDayOfWeek = computed(() => {
  const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return dayNames[selectedDate.value.getDay()];
});

const selectedDayMenu = computed(() => {
  const dateStr = formatParamDate(selectedDate.value);
  return days.value.find((d) => {
    const menuDateStr = formatParamDate(new Date(d.menuDate));
    return menuDateStr === dateStr;
  });
});

const isToday = computed(() => {
  return isSameDay(selectedDate.value, new Date());
});

const isTomorrow = computed(() => {
  const tomorrow = addDays(new Date(), 1);
  return isSameDay(selectedDate.value, tomorrow);
});

const isYesterday = computed(() => {
  const yesterday = addDays(new Date(), -1);
  return isSameDay(selectedDate.value, yesterday);
});

const isCurrentWeek = computed(() => {
  const currentMonday = getMonday(new Date());
  return isSameDay(weekStart.value, currentMonday);
});

const isNextWeek = computed(() => {
  const nextMonday = addDays(getMonday(new Date()), 7);
  return isSameDay(weekStart.value, nextMonday);
});

/* ======= HELPERS ======= */

function isSameDay(d1, d2) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function addDays(d, n) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function formatParamDate(d) {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function formatDisplayDate(d) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "--/--/----";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function getDayNumber(dateStr) {
  const d = new Date(dateStr);
  return d.getDate();
}

function badgeLabel(type) {
  const t = type.toLowerCase();
  if (t.includes("sáng")) return "Bữa sáng";
  if (t.includes("trưa")) return "Bữa trưa";
  if (t.includes("chiều")) return "Bữa chiều";
  return type;
}

function getShortMealLabel(type) {
  const t = type.toLowerCase();
  if (t.includes("sáng")) return "Sáng";
  if (t.includes("trưa")) return "Trưa";
  if (t.includes("chiều")) return "Chiều";
  return type;
}

function badgeClass(type) {
  const t = type.toLowerCase();
  if (t.includes("sáng")) return "badge-morning";
  if (t.includes("trưa")) return "badge-noon";
  if (t.includes("chiều")) return "badge-evening";
  return "badge-default";
}

function getMealIcon(type) {
  const t = type.toLowerCase();
  if (t.includes("sáng")) return "wb_sunny";
  if (t.includes("trưa")) return "wb_twilight";
  if (t.includes("chiều")) return "nightlight";
  return "restaurant";
}

function getMealTime(type) {
  const t = type.toLowerCase();
  if (t.includes("sáng")) return "7:00 - 8:00";
  if (t.includes("trưa")) return "11:00 - 12:00";
  if (t.includes("chiều")) return "15:00 - 16:00";
  return "";
}

function getMealPreview(dishes) {
  if (!dishes || !dishes.length) return "Chưa cập nhật";
  if (dishes.length === 1) return dishes[0];
  return `${dishes[0]} +${dishes.length - 1}`;
}

/* ======= LOAD DATA ======= */

async function resolveParentAndStudent() {
  const username = auth.user?.username || localStorage.getItem("username");
  if (!username) return null;

  const resParents = await api.get("/parents/all");
  const parents = resParents.data?.data || [];
  const parent = parents.find((p) => p.username === username);
  if (!parent) return null;

  selectedParentId.value = parent.id;

  const resChildren = await api.get(`/parents/${parent.id}/children`);
  const list = resChildren.data?.data || [];

  children.value = list.map((s) => ({
    id: s.studentId,
    name: s.fullName,
    className: s.className,
    studentCode: s.studentCode,
  }));

  if (!list.length) return null;

  const first = list[0];
  selectedStudentId.value = first.studentId;
  childName.value = first.fullName;

  return { parentId: parent.id, studentId: first.studentId };
}

function normalizeDailyMenu(raw) {
  const mealsByType = {};
  (raw.meals || []).forEach((m) => {
    const type = m.mealType || "Khác";
    if (!mealsByType[type]) mealsByType[type] = [];
    if (m.mealName) mealsByType[type].push(m.mealName);
  });

  return {
    menuDate: raw.menuDate,
    dayOfWeek: raw.dayOfWeek || "",
    mealsByType,
  };
}

async function loadMenu() {
  if (!selectedParentId.value || !selectedStudentId.value) return;

  try {
    loading.value = true;

    let startParam, endParam;

    if (viewMode.value === "day") {
      // Load 1 tuần xung quanh ngày đang chọn để có dữ liệu
      const monday = getMonday(selectedDate.value);
      const sunday = addDays(monday, 6);
      startParam = formatParamDate(monday);
      endParam = formatParamDate(sunday);
    } else {
      startParam = formatParamDate(weekStart.value);
      endParam = formatParamDate(weekEnd.value);
    }

    const { data } = await api.get(
      `/parents/${selectedParentId.value}/children/${selectedStudentId.value}/menus`,
      {
        params: {
          startDate: startParam,
          endDate: endParam,
        },
      }
    );

    const list = data?.data || [];
    days.value = list
      .map(normalizeDailyMenu)
      .sort((a, b) => new Date(a.menuDate) - new Date(b.menuDate));
  } catch (e) {
    console.error("[Menu] loadMenu error", e);
    $q.notify({
      type: "negative",
      message: e?.response?.data?.message || "Không tải được thực đơn.",
    });
  } finally {
    loading.value = false;
  }
}

/* ======= UI ACTIONS ======= */

function changeDay(offset) {
  selectedDate.value = addDays(selectedDate.value, offset);
  loadMenu();
}

function goToToday() {
  selectedDate.value = new Date();
  loadMenu();
}

function goToTomorrow() {
  selectedDate.value = addDays(new Date(), 1);
  loadMenu();
}

function goToYesterday() {
  selectedDate.value = addDays(new Date(), -1);
  loadMenu();
}

function changeWeek(offset) {
  weekStart.value = addDays(weekStart.value, offset * 7);
  weekEnd.value = addDays(weekStart.value, 6);
  loadMenu();
}

function goToCurrentWeek() {
  weekStart.value = getMonday(new Date());
  weekEnd.value = addDays(weekStart.value, 6);
  loadMenu();
}

function goToNextWeek() {
  weekStart.value = addDays(getMonday(new Date()), 7);
  weekEnd.value = addDays(weekStart.value, 6);
  loadMenu();
}

function selectChild(s) {
  if (selectedStudentId.value === s.id) return;
  selectedStudentId.value = s.id;
  childName.value = s.name;
  loadMenu();
}

function selectDayFromWeek(day) {
  selectedDate.value = new Date(day.menuDate);
  viewMode.value = "day";
  loadMenu();
}

function confirmDatePicker() {
  if (tempDate.value) {
    selectedDate.value = new Date(tempDate.value);
    loadMenu();
  }
  showDatePicker.value = false;
}

function goToWeeklyMenu() {
  if (!selectedStudentId.value) return;

  router.push({
    name: "parent-weekly-menu",
    query: {
      childId: selectedStudentId.value,
      weekStart: weekStart.value.toISOString(),
      weekEnd: weekEnd.value.toISOString(),
    },
  });
}

/* ======= WATCHERS ======= */

watch(viewMode, () => {
  loadMenu();
});

/* ======= INIT ======= */

onMounted(async () => {
  if (!auth.accessToken) {
    $q.notify({ type: "warning", message: "Bạn chưa đăng nhập." });
    return;
  }

  const ok = await resolveParentAndStudent();
  if (!ok) {
    $q.notify({
      type: "warning",
      message: "Không tìm thấy thông tin bé gắn với tài khoản.",
    });
    return;
  }

  tempDate.value = selectedDate.value.toISOString().slice(0, 10);
  await loadMenu();
});
</script>

<style scoped>
. menu-page {
  background: linear-gradient(180deg, #fff5f8 0%, #fef0f5 50%, #f8fafc 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}

/* ===== HEADER ===== */
.page-header {
  position: relative;
  padding: 20px 16px 28px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%);
  border-radius: 0 0 36px 36px;
}

.header-bg::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -20%;
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
}

.header-bg::after {
  content: "";
  position: absolute;
  bottom: -20%;
  left: -10%;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  backdrop-filter: blur(8px);
}

.header-text h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.header-text p {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

/* ===== SCROLL CONTAINER ===== */
.menu-scroll {
  max-width: 480px;
  margin: -16px auto 0;
  position: relative;
  z-index: 2;
}

/* ===== SECTION LABEL ===== */
.section-label {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

/* ===== CHILD SECTION ===== */
.child-card {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.12);
}

.child-card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, #fce7f3 0%, transparent 50%);
  opacity: 0.7;
}

.child-card-content {
  position: relative;
  z-index: 1;
  padding: 12px;
}

.children-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.child-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.child-chip. active {
  background: linear-gradient(135deg, #ec4899, #f472b6);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0 3);
}

. child-chip-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== CURRENT CHILD ===== */
.current-child-card {
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.child-avatar {
  background: linear-gradient(135deg, #fce7f3, #fdf2f8);
}

/* ===== VIEW TABS ===== */
.view-tabs {
  display: flex;
  gap: 8px;
  background: #fff;
  padding: 6px;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

. view-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border-radius: 12px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-tab.active {
  background: linear-gradient(135deg, #ec4899, #f472b6);
  color: #fff;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
}

/* ===== DATE PICKER ===== */
.date-picker-card {
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0 08);
  overflow: hidden;
}

.date-picker-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
}

.date-nav-btn {
  width: 40px;
  height: 40px;
  color: #ec4899;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 12px;
  background: #fdf2f8;
  transition: background 0.2s ease;
}

.date-display:hover {
  background: #fce7f3;
}

.date-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ec4899, #f472b6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.date-info {
  text-align: left;
}

.date-weekday {
  font-size: 12px;
  color: #9ca3af;
}

.date-full {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.date-expand {
  color: #9ca3af;
}

. quick-dates {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;
}

.quick-date-btn {
  flex: 1;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

. quick-date-btn. active {
  background: linear-gradient(135deg, #fce7f3, #fdf2f8);
  border-color: #f9a8d4;
  color: #db2777;
}

/* ===== WEEK PICKER ===== */
.week-picker-card {
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.week-picker-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
}

. week-nav-btn {
  width: 40px;
  height: 40px;
  color: #ec4899;
}

. week-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.week-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fce7f3, #fdf2f8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ec4899;
}

.week-info {
  text-align: left;
}

.week-label {
  font-size: 12px;
  color: #9ca3af;
}

.week-range {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

. quick-weeks {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;
}

.quick-week-btn {
  flex: 1;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-week-btn.active {
  background: linear-gradient(135deg, #fce7f3, #fdf2f8);
  border-color: #f9a8d4;
  color: #db2777;
}

/* ===== LOADING ===== */
. loading-card {
  border-radius: 20px;
  background: #fff;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

/* ===== EMPTY BANNER ===== */
.empty-banner {
  background: linear-gradient(135deg, #fef3c7, #fef9c3);
  border: 1px solid #fde68a;
}

.empty-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #fef08a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ca8a04;
}

. empty-text strong {
  color: #92400e;
  font-size: 14px;
}

. empty-text p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #a16207;
}

/* ===== DAY MENU CARD ===== */
.day-menu-card {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.day-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #fdf2f8, #fce7f3);
}

.menu-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ec4899, #f472b6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.menu-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

. menu-subtitle {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.meals-container {
  padding: 12px 16px;
}

.meal-section {
  padding: 14px 0;
}

.meal-section. with-divider {
  border-bottom: 1px dashed #e5e7eb;
}

.meal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.meal-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge-morning {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #b45309;
}

.badge-noon {
  background: linear-gradient(135deg, #fed7aa, #fdba74);
  color: #c2410c;
}

. badge-evening {
  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
  color: #be185d;
}

.badge-default {
  background: #f1f5f9;
  color: #64748b;
}

. meal-time {
  font-size: 11px;
  color: #9ca3af;
}

.meal-dishes {
  padding-left: 8px;
}

.dish-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  font-size: 13px;
  color: #374151;
}

.dish-bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f472b6, #ec4899);
  flex-shrink: 0;
}

.dish-empty {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
  padding: 6px 0;
}

/* ===== WEEK DAYS LIST ===== */
.week-day-card {
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.week-day-card:active {
  transform: scale(0.98);
}

.week-day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fdf2f8, #fce7f3);
}

.week-day-date {
  display: flex;
  align-items: center;
  gap: 10px;
}

.day-number {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ec4899, #f472b6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

. day-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.week-day-arrow {
  color: #9ca3af;
}

.week-day-meals {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.week-meal-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meal-type-label {
  min-width: 50px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
}

.meal-preview-text {
  flex: 1;
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== ACTION BUTTON ===== */
.action-btn {
  width: 100%;
  padding: 16px 20px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ec4899, #f472b6);
  color: #fff;
  box-shadow: 0 8px 24px rgba(236, 72, 153, 0 3);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.btn-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.btn-title {
  font-size: 14px;
  font-weight: 600;
}

.btn-desc {
  font-size: 11px;
  opacity: 0.85;
}

. btn-arrow {
  opacity: 0.7;
}

/* ===== DATE DIALOG ===== */
.date-dialog-card {
  width: 100%;
  max-width: 360px;
  border-radius: 24px 24px 0 0;
}

.date-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
}

.date-dialog-body {
  padding: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 380px) {
  .quick-dates,
  .quick-weeks {
    flex-wrap: wrap;
  }

  .quick-date-btn,
  .quick-week-btn {
    flex: none;
    width: calc(50% - 4px);
  }
}
</style>
