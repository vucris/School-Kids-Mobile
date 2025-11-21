<template>
  <q-page class="menu-page">
    <div class="q-pa-md q-pt-sm menu-scroll">
      <!-- TIÊU ĐỀ + THÔNG TIN BÉ -->
      <div class="row items-center justify-between q-mb-sm">
        <div>
          <div class="text-subtitle1 text-weight-semibold">Hoạt động hôm nay</div>
          <div class="text-caption text-grey-7">Hoạt động của bé {{ childName }}</div>
          <div v-if="currentChild" class="text-caption text-grey-6 q-mt-xs">
            Lớp {{ currentChild.className }} • Mã HS: {{ currentChild.studentCode }}
          </div>
        </div>

        <q-avatar size="40px">
          <img :src="childAvatar" alt="child" />
        </q-avatar>
      </div>

      <!-- CHỌN BÉ (nếu có nhiều con) -->
      <div v-if="children.length > 1" class="row items-center q-mb-md children-switch">
        <span class="text-caption text-grey-7 q-mr-sm">Chọn bé:</span>
        <div class="row no-wrap scroll-x">
          <q-chip
            v-for="s in children"
            :key="s.id"
            clickable
            @click="selectChild(s)"
            :color="s.id === selectedChildId ? 'primary' : 'white'"
            :text-color="s.id === selectedChildId ? 'white' : 'grey-8'"
            class="q-mr-xs q-mb-xs children-chip"
          >
            {{ s.name }}
          </q-chip>
        </div>
      </div>

      <!-- STRIP NGÀY TRONG TUẦN -->
      <div class="day-strip q-mt-sm">
        <div class="row no-wrap">
          <div
            v-for="day in days"
            :key="day.key"
            class="day-item"
            :class="{ active: day.key === selectedDay }"
            @click="onSelectDay(day.key)"
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

      <!-- RIBBON HÔM NAY -->
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

      <!-- LOADING -->
      <q-card v-if="loading" flat class="q-pa-md q-mt-md">
        <q-inner-loading showing>
          <q-spinner-dots size="32px" color="primary" />
        </q-inner-loading>
      </q-card>

      <!-- CARD THỰC ĐƠN -->
      <q-card v-else class="menu-card q-mt-md">
        <q-card-section class="row no-wrap items-center q-pb-xs">
          <q-avatar size="32px" class="q-mr-sm bg-pink-2">
            <q-icon name="restaurant_menu" class="text-pink-6" />
          </q-avatar>
          <div class="col">
            <div class="text-body2 text-weight-medium">
              Thực đơn của bé {{ childName }}
            </div>
            <div class="text-caption text-grey-6">
              {{ menuUpdatedAt || "Chưa có cập nhật" }}
            </div>
          </div>
        </q-card-section>

        <q-separator spaced />

        <q-card-section class="q-pt-xs">
          <!-- Bữa sáng -->
          <div class="meal-row">
            <q-chip dense square class="meal-chip breakfast"> Bữa sáng </q-chip>
            <div class="meal-content">
              <template v-if="menu.breakfast.length">
                <div
                  v-for="(item, idx) in menu.breakfast"
                  :key="'bfast-' + idx"
                  class="text-body2"
                >
                  {{ item }}
                </div>
              </template>
              <div v-else class="text-caption text-grey-5">Chưa có thực đơn</div>
            </div>
          </div>

          <!-- Bữa trưa -->
          <div class="meal-row">
            <q-chip dense square class="meal-chip lunch"> Bữa trưa </q-chip>
            <div class="meal-content">
              <template v-if="menu.lunch.length">
                <div
                  v-for="(item, idx) in menu.lunch"
                  :key="'lunch-' + idx"
                  class="text-body2"
                >
                  {{ item }}
                </div>
              </template>
              <div v-else class="text-caption text-grey-5">Chưa có thực đơn</div>
            </div>
          </div>

          <!-- Bữa chiều -->
          <div class="meal-row q-mb-none">
            <q-chip dense square class="meal-chip snack"> Bữa chiều </q-chip>
            <div class="meal-content">
              <template v-if="menu.snack.length">
                <div
                  v-for="(item, idx) in menu.snack"
                  :key="'snack-' + idx"
                  class="text-body2"
                >
                  {{ item }}
                </div>
              </template>
              <div v-else class="text-caption text-grey-5">Chưa có thực đơn</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- NÚT XEM THỰC ĐƠN TUẦN -->
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

      <!-- CARD THỜI GIAN NGỦ (demo) -->
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
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth";

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);

const parentId = ref(null);
const children = ref([]);
const selectedChildId = ref(null);

const childAvatar = ref("https://i.postimg.cc/2jFv66sG/avatar-kid.png");

const currentChild = computed(
  () => children.value.find((c) => c.id === selectedChildId.value) || null
);

const childName = computed(() => currentChild.value?.name || "Bé của bạn");

// ------- DATE / TUẦN -------
const days = ref([]); // strip hiển thị
const selectedDay = ref(""); // key: yyyy-MM-dd
const weekStart = ref(null);

const menusMap = ref(new Map()); // Map<yyyy-MM-dd, { breakfast, lunch, snack }>
const menu = ref({
  breakfast: [],
  lunch: [],
  snack: [],
});
const menuUpdatedAt = ref("");

// demo giờ ngủ
const sleep = ref({
  from: "11:30",
  to: "14:00",
});

// hôm nay label ở ribbon
const todayLabel = computed(() => formatDDMM(new Date()));

// ===== HELPER DATE =====
function formatDDMM(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatDDMMShort(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

function toDMY(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  // BE dùng pattern dd-MM-yyyy
  return `${dd}-${mm}-${yyyy}`;
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=CN..6=Th7
  const diff = (day === 0 ? -6 : 1) - day; // về thứ 2
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekdayShortLabel(d) {
  const w = d.getDay();
  const map = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return map[w];
}

function parseApiDate(str) {
  if (!str) return null;

  // dd-MM-yyyy
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split("-").map(Number);
    return new Date(yyyy, mm - 1, dd);
  }

  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function buildWeekDays(baseDate = new Date()) {
  const start = getWeekStart(baseDate);
  weekStart.value = start;

  const arr = [];
  const today = new Date();

  for (let i = 0; i < 5; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    arr.push({
      key,
      label: isSameDate(d, today) ? "Hôm nay" : weekdayShortLabel(d),
      date: formatDDMMShort(d),
    });
  }

  days.value = arr;
  const todayItem = arr.find((item) => item.label === "Hôm nay");
  selectedDay.value = todayItem ? todayItem.key : arr[0]?.key || "";
}

// ===== LOAD PARENT + CHILDREN =====
async function loadParentAndChildren() {
  try {
    loading.value = true;

    const username = auth.user?.username || localStorage.getItem("username");
    if (!username) {
      $q.notify({
        type: "warning",
        message: "Không tìm thấy tài khoản phụ huynh hiện tại.",
      });
      return;
    }

    // Lấy list phụ huynh
    const resParents = await api.get("/parents/all");
    const parentsApi = resParents.data || {};
    const parents = parentsApi.data || [];
    const parent = parents.find((p) => p.username === username);

    if (!parent) {
      $q.notify({
        type: "warning",
        message: "Không tìm thấy thông tin phụ huynh cho tài khoản này.",
      });
      return;
    }

    parentId.value = parent.id;

    // Lấy danh sách con
    const resChildren = await api.get(`/parents/${parent.id}/children`);
    const childrenApi = resChildren.data || {};
    const list = childrenApi.data || [];

    children.value = list.map((s) => ({
      id: s.studentId,
      name: s.fullName,
      className: s.className,
      studentCode: s.studentCode,
    }));

    if (children.value.length) {
      selectedChildId.value = children.value[0].id;
      await loadWeekMenu();
    }
  } catch (e) {
    console.error("[Menu] loadParentAndChildren error", e);
    $q.notify({
      type: "negative",
      message: "Không lấy được danh sách con.",
    });
  } finally {
    loading.value = false;
  }
}

// ===== LOAD WEEK MENU TỪ BE =====
async function loadWeekMenu() {
  if (!parentId.value || !selectedChildId.value || !weekStart.value) return;

  try {
    loading.value = true;

    const start = new Date(weekStart.value);
    const end = new Date(weekStart.value);
    end.setDate(end.getDate() + 4); // T2–T6

    const params = {
      startDate: toDMY(start),
      endDate: toDMY(end),
    };

    const res = await api.get(
      `/parents/${parentId.value}/children/${selectedChildId.value}/menus`,
      { params }
    );

    const apiResp = res.data || {};
    const list = apiResp.data || [];

    const map = new Map();
    let latestUpdated = null;

    list.forEach((m) => {
      // field ngày trong DTO
      const dateStr = m.date || m.menuDate || m.day;
      const d = parseApiDate(dateStr);
      if (!d) return;

      const key = d.toISOString().slice(0, 10);

      const dayMenu = {
        breakfast: [],
        lunch: [],
        snack: [],
      };

      // danh sách bữa ăn
      const meals = m.meals || m.menuItems || m.items || [];
      meals.forEach((meal) => {
        const type = (meal.mealType || meal.type || "").toUpperCase();
        const dishesRaw = meal.dishes || meal.dishList || [];

        const dishNames = dishesRaw
          .map((dish) =>
            typeof dish === "string" ? dish : dish.dishName || dish.name || ""
          )
          .filter(Boolean);

        if (type.includes("BREAKFAST") || type.includes("SANG")) {
          dayMenu.breakfast.push(...dishNames);
        } else if (type.includes("LUNCH") || type.includes("TRUA")) {
          dayMenu.lunch.push(...dishNames);
        } else if (type.includes("SNACK") || type.includes("CHIEU")) {
          dayMenu.snack.push(...dishNames);
        }
      });

      map.set(key, dayMenu);

      const updatedAtRaw = m.updatedAt || m.lastUpdatedAt;
      if (updatedAtRaw) {
        const t = new Date(updatedAtRaw);
        if (!Number.isNaN(t.getTime())) {
          if (!latestUpdated || t > latestUpdated) {
            latestUpdated = t;
          }
        }
      }
    });

    menusMap.value = map;

    if (latestUpdated) {
      const dd = String(latestUpdated.getDate()).padStart(2, "0");
      const mm = String(latestUpdated.getMonth() + 1).padStart(2, "0");
      const yyyy = latestUpdated.getFullYear();
      const hh = String(latestUpdated.getHours()).padStart(2, "0");
      const mi = String(latestUpdated.getMinutes()).padStart(2, "0");
      menuUpdatedAt.value = `Cập nhật lúc ${hh}:${mi} ${dd}/${mm}/${yyyy}`;
    } else {
      menuUpdatedAt.value = "";
    }

    updateMenuForSelectedDay();
  } catch (e) {
    console.error("[Menu] loadWeekMenu error", e);
    $q.notify({
      type: "negative",
      message: "Không lấy được thực đơn của bé.",
    });
    menusMap.value = new Map();
    menu.value = { breakfast: [], lunch: [], snack: [] };
    menuUpdatedAt.value = "";
  } finally {
    loading.value = false;
  }
}

// cập nhật menu đang hiển thị theo selectedDay
function updateMenuForSelectedDay() {
  if (!selectedDay.value) {
    menu.value = { breakfast: [], lunch: [], snack: [] };
    return;
  }
  const dayMenu = menusMap.value.get(selectedDay.value);
  if (dayMenu) {
    menu.value = {
      breakfast: dayMenu.breakfast || [],
      lunch: dayMenu.lunch || [],
      snack: dayMenu.snack || [],
    };
  } else {
    menu.value = { breakfast: [], lunch: [], snack: [] };
  }
}

// ===== UI ACTIONS =====
function onSelectDay(key) {
  selectedDay.value = key;
  updateMenuForSelectedDay();
}

function selectChild(s) {
  if (!s || s.id === selectedChildId.value) return;
  selectedChildId.value = s.id;
  loadWeekMenu();
}

// 👉 Gán nút “Xem thực đơn tuần” mở màn weekly menu
function viewWeeklyMenu() {
  if (!currentChild.value || !weekStart.value || !parentId.value) {
    $q.notify({
      type: "warning",
      message: "Chưa đủ thông tin để xem thực đơn tuần.",
    });
    return;
  }

  const start = new Date(weekStart.value);
  const end = new Date(weekStart.value);
  end.setDate(end.getDate() + 4); // T2–T6

  router.push({
    name: "parent-weekly-menu", // đặt trùng tên route bạn khai báo
    query: {
      parentId: String(parentId.value),
      studentId: String(currentChild.value.id),
      startDate: toDMY(start), // dd-MM-yyyy
      endDate: toDMY(end),
    },
  });
}

// INIT
onMounted(() => {
  buildWeekDays(new Date());

  if (!auth.accessToken) {
    $q.notify({
      type: "warning",
      message: "Bạn chưa đăng nhập.",
    });
    return;
  }

  loadParentAndChildren();
});
</script>

<style scoped>
.menu-page {
  background: #f5f7fb;
  padding-bottom: 64px;
}

.menu-scroll {
  max-width: 520px;
  margin: 0 auto;
}

/* chọn bé */
.children-switch .scroll-x {
  overflow-x: auto;
}

.children-chip {
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.15);
}

/* strip ngày */
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
