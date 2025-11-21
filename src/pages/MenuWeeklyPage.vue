<template>
  <q-page class="menu-week-page">
    <div class="q-pa-md q-pt-sm menu-week-scroll">
      <!-- HEADER + BACK -->
      <div class="row items-center q-mb-sm">
        <div class="col-auto">
          <q-btn
            flat
            round
            dense
            icon="arrow_back"
            @click="goBack"
          />
        </div>
        <div class="col text-center q-pr-md">
          <div class="text-subtitle1 text-weight-semibold">
            Thực đơn tuần của bé {{ childName }}
          </div>
          <div class="text-caption text-grey-7">
            {{ weekRangeLabel }}
          </div>
        </div>
        <div class="col-auto">
          <q-avatar size="36px">
            <img :src="childAvatar" alt="child" />
          </q-avatar>
        </div>
      </div>

      <!-- CHỌN BÉ (nếu >1 con) -->
      <div
        v-if="children.length > 1"
        class="row items-center q-mb-md children-switch"
      >
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

      <!-- LOADING -->
      <q-card v-if="loading" flat class="q-pa-md q-mt-md">
        <q-inner-loading showing>
          <q-spinner-dots size="32px" color="primary" />
        </q-inner-loading>
      </q-card>

      <!-- KHÔNG CÓ DỮ LIỆU -->
      <q-banner
        v-else-if="!days.length"
        class="q-mt-md bg-blue-1 text-blue-8"
        rounded
      >
        <template #avatar>
          <q-icon name="restaurant_menu" />
        </template>
        Chưa có thực đơn cho tuần này.
      </q-banner>

      <!-- THỰC ĐƠN CẢ TUẦN -->
      <q-card
        v-else
        class="week-menu-card q-mt-md"
      >
        <q-card-section class="q-pb-xs">
          <div class="text-caption text-grey-7">
            Lớp {{ currentChild?.className }} • Mã HS: {{ currentChild?.studentCode }}
          </div>
          <div class="text-caption text-grey-6 q-mt-xs" v-if="menuUpdatedAt">
            {{ menuUpdatedAt }}
          </div>
        </q-card-section>

        <q-separator spaced />

        <q-card-section class="q-pt-xs">
          <div
            v-for="day in days"
            :key="day.key"
            class="day-block q-mb-md"
          >
            <!-- tiêu đề ngày -->
            <div class="row items-center justify-between q-mb-xs">
              <div class="text-body2 text-weight-medium">
                {{ day.longLabel }}
              </div>
              <div class="text-caption text-grey-6">
                {{ day.dateFull }}
              </div>
            </div>

            <q-separator class="q-mb-xs" />

            <div class="day-meals">
              <!-- Bữa sáng -->
              <div class="meal-row">
                <q-chip dense square class="meal-chip breakfast">
                  Bữa sáng
                </q-chip>
                <div class="meal-content">
                  <template v-if="getMenuForDay(day.key).breakfast.length">
                    <div
                      v-for="(item, idx) in getMenuForDay(day.key).breakfast"
                      :key="`b-${day.key}-${idx}`"
                      class="text-body2"
                    >
                      {{ item }}
                    </div>
                  </template>
                  <div v-else class="text-caption text-grey-5">
                    Chưa có thực đơn
                  </div>
                </div>
              </div>

              <!-- Bữa trưa -->
              <div class="meal-row">
                <q-chip dense square class="meal-chip lunch">
                  Bữa trưa
                </q-chip>
                <div class="meal-content">
                  <template v-if="getMenuForDay(day.key).lunch.length">
                    <div
                      v-for="(item, idx) in getMenuForDay(day.key).lunch"
                      :key="`l-${day.key}-${idx}`"
                      class="text-body2"
                    >
                      {{ item }}
                    </div>
                  </template>
                  <div v-else class="text-caption text-grey-5">
                    Chưa có thực đơn
                  </div>
                </div>
              </div>

              <!-- Bữa chiều -->
              <div class="meal-row q-mb-none">
                <q-chip dense square class="meal-chip snack">
                  Bữa chiều
                </q-chip>
                <div class="meal-content">
                  <template v-if="getMenuForDay(day.key).snack.length">
                    <div
                      v-for="(item, idx) in getMenuForDay(day.key).snack"
                      :key="`s-${day.key}-${idx}`"
                      class="text-body2"
                    >
                      {{ item }}
                    </div>
                  </template>
                  <div v-else class="text-caption text-grey-5">
                    Chưa có thực đơn
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- CARD GIỜ NGỦ DEMO -->
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
import { ref, computed, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import { useRoute, useRouter } from "vue-router";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);
const parentId = ref(null);
const children = ref([]);
const selectedChildId = ref(null);

const childAvatar = ref("https://i.postimg.cc/2jFv66sG/avatar-kid.png");

const weekStart = ref(null); // Date (thứ 2 tuần)
const days = ref([]); // [{ key, longLabel, dateFull }]

const menusMap = ref(new Map()); // Map<yyyy-MM-dd, { breakfast, lunch, snack }>
const menuUpdatedAt = ref("");

const sleep = ref({
  from: "11:30",
  to: "14:00",
});

const currentChild = computed(
  () => children.value.find((c) => c.id === selectedChildId.value) || null
);

const childName = computed(() => currentChild.value?.name || "Bé của bạn");

const weekRangeLabel = computed(() => {
  if (!weekStart.value) return "";
  const start = weekStart.value;
  const end = new Date(start);
  end.setDate(end.getDate() + 4);
  return `${formatDDMMYYYY(start)} - ${formatDDMMYYYY(end)}`;
});

// ====== HELPERS DATE ======
function formatDDMMYYYY(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function toDMY(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`; // dd-MM-yyyy cho BE
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=CN..6=Th7
  const diff = (day === 0 ? -6 : 1) - day; // về thứ 2
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekdayFullLabel(d) {
  const map = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  return map[d.getDay()];
}

function parseApiDate(str) {
  if (!str) return null;
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split("-").map(Number);
    return new Date(yyyy, mm - 1, dd);
  }
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function buildWeekFromParam(weekStartStr) {
  let base;
  if (typeof weekStartStr === "string") {
    const d = new Date(weekStartStr);
    if (!Number.isNaN(d.getTime())) {
      base = d;
    }
  }
  if (!base) {
    base = new Date();
  }

  const start = getWeekStart(base);
  weekStart.value = start;

  const arr = [];
  for (let i = 0; i < 5; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);

    arr.push({
      key,
      longLabel: weekdayFullLabel(d),
      dateFull: formatDDMMYYYY(d),
    });
  }
  days.value = arr;
}

// ====== LOAD PARENT + CHILDREN ======
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

    const resParents = await api.get("/parents/all");
    const parentsApi = resParents.data || {};
    const parents = parentsApi.data || [];
    const parent = parents.find((p) => p.username === username);

    if (!parent) {
      $q.notify({
        type: "warning",
        message: "Không tìm thấy thông tin phụ huynh.",
      });
      return;
    }

    parentId.value = parent.id;

    const resChildren = await api.get(`/parents/${parent.id}/children`);
    const childrenApi = resChildren.data || {};
    const list = childrenApi.data || [];

    children.value = list.map((s) => ({
      id: s.studentId,
      name: s.fullName,
      className: s.className,
      studentCode: s.studentCode,
    }));

    // ưu tiên childId trên route nếu có
    const routeChildId = route.query.childId
      ? Number(route.query.childId)
      : null;

    if (routeChildId) {
      const exist = children.value.find((c) => c.id === routeChildId);
      if (exist) {
        selectedChildId.value = routeChildId;
      } else if (children.value.length && !selectedChildId.value) {
        selectedChildId.value = children.value[0].id;
      }
    } else if (children.value.length && !selectedChildId.value) {
      selectedChildId.value = children.value[0].id;
    }
  } catch (e) {
    console.error("[MenuWeekly] loadParentAndChildren error", e);
    $q.notify({
      type: "negative",
      message: "Không lấy được thông tin phụ huynh / con.",
    });
  } finally {
    loading.value = false;
  }
}

// ====== LOAD MENU TUẦN ======
async function loadWeekMenu() {
  if (!parentId.value || !selectedChildId.value || !weekStart.value) return;

  try {
    loading.value = true;

    const start = new Date(weekStart.value);
    const end = new Date(weekStart.value);
    end.setDate(end.getDate() + 4);

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
      const dateStr = m.date || m.menuDate || m.day;
      const d = parseApiDate(dateStr);
      if (!d) return;

      const key = d.toISOString().slice(0, 10);

      const dayMenu = {
        breakfast: [],
        lunch: [],
        snack: [],
      };

      const meals = m.meals || m.menuItems || m.items || [];
      meals.forEach((meal) => {
        const type = (meal.mealType || meal.type || "").toUpperCase();
        const dishesRaw = meal.dishes || meal.dishList || [];

        const dishNames = dishesRaw
          .map((dish) =>
            typeof dish === "string"
              ? dish
              : dish.dishName || dish.name || ""
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
  } catch (e) {
    console.error("[MenuWeekly] loadWeekMenu error", e);
    $q.notify({
      type: "negative",
      message: "Không lấy được thực đơn tuần của bé.",
    });
    menusMap.value = new Map();
    menuUpdatedAt.value = "";
  } finally {
    loading.value = false;
  }
}

// trả menu cho 1 ngày
function getMenuForDay(dateKey) {
  const dayMenu = menusMap.value.get(dateKey);
  if (!dayMenu) {
    return {
      breakfast: [],
      lunch: [],
      snack: [],
    };
  }
  return dayMenu;
}

// ====== UI ACTIONS ======
function selectChild(s) {
  if (!s || s.id === selectedChildId.value) return;
  selectedChildId.value = s.id;
  // watcher sẽ gọi loadWeekMenu
}

function goBack() {
  router.back();
}

// ====== WATCHERS & MOUNT ======
watch(
  () => route.query.weekStart,
  (val) => {
    buildWeekFromParam(val);
  },
  { immediate: true }
);

watch(
  () => [parentId.value, selectedChildId.value, weekStart.value],
  ([pId, stuId, ws]) => {
    if (pId && stuId && ws) {
      loadWeekMenu();
    }
  }
);

onMounted(() => {
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
.menu-week-page {
  background: #f5f7fb;
  padding-bottom: 64px;
}

.menu-week-scroll {
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

/* card tuần */
.week-menu-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 6px 14px rgba(15, 40, 80, 0.12);
}

/* block từng ngày */
.day-block {
  border-radius: 16px;
  padding: 8px 8px 8px;
  background: #f9fafb;
}

/* các dòng bữa ăn */
.day-meals {
  margin-top: 4px;
}

.meal-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
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

@media (max-width: 380px) {
  .week-menu-card {
    border-radius: 18px;
  }
}
</style>
