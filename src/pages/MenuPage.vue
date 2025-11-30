<template>
  <q-page class="menu-page">
    <!-- HEADER TUẦN + BÉ -->
    <div class="q-pa-md q-pt-sm">
      <div class="row items-center justify-between q-mb-sm">
        <div>
          <div class="text-subtitle1 text-weight-semibold">Thực đơn của bé</div>
          <div class="text-caption text-grey-7">
            Tuần từ {{ formatDisplayDate(weekStart) }} đến
            {{ formatDisplayDate(weekEnd) }}
          </div>
        </div>

        <div v-if="childName" class="text-right">
          <div class="text-caption text-grey-6">Bé</div>
          <div class="text-body2 text-weight-medium">
            {{ childName }}
          </div>
        </div>
      </div>

      <!-- NÚT ĐỔI TUẦN -->
      <div class="row items-center justify-between q-mb-md">
        <q-btn flat round dense icon="chevron_left" @click="changeWeek(-1)" />
        <div class="text-caption text-grey-7">Tuần {{ weekLabel }}</div>
        <q-btn flat round dense icon="chevron_right" @click="changeWeek(1)" />
      </div>

      <!-- LOADING -->
      <q-inner-loading :showing="loading">
        <q-spinner-dots size="32px" color="primary" />
      </q-inner-loading>

      <!-- KHÔNG CÓ DỮ LIỆU -->
      <q-banner
        v-if="!loading && !days.length"
        rounded
        class="bg-grey-1 text-grey-8 q-mb-md"
      >
        <template #avatar>
          <q-icon name="restaurant_menu" />
        </template>
        Chưa có thực đơn cho tuần này.
      </q-banner>

      <!-- DANH SÁCH NGÀY -->
      <div v-else class="column q-gutter-md q-mb-lg">
        <q-card v-for="day in days" :key="day.menuDate" flat bordered class="day-card">
          <!-- HEADER THẺ (giống hình mẫu) -->
          <q-card-section class="day-header row no-wrap items-center">
            <q-avatar rounded size="32px" class="q-mr-sm">
              <q-icon name="restaurant_menu" size="20px" color="pink-5" />
            </q-avatar>

            <div class="col">
              <div class="text-body2 text-weight-semibold">
                Thực đơn của bé {{ childName || " " }}
              </div>
              <div class="text-caption text-grey-6">
                {{ day.dayOfWeek }}, {{ formatDisplayDate(day.menuDate) }}
              </div>
            </div>
          </q-card-section>

          <!-- KHUNG BỮA ĂN GIỐNG HÌNH -->
          <q-card-section class="q-pt-xs q-pb-sm">
            <div class="menu-panel">
              <div
                v-for="(type, idx) in mealTypes"
                :key="type"
                class="meal-row-panel"
                :class="{ 'with-divider': idx < mealTypes.length - 1 }"
              >
                <!-- nhãn màu Bữa sáng / trưa / chiều -->
                <div class="meal-badge" :class="badgeClass(type)">
                  {{ badgeLabel(type) }}
                </div>

                <!-- món ăn -->
                <div class="meal-dishes-list">
                  <div v-if="day.mealsByType[type] && day.mealsByType[type].length">
                    <div
                      v-for="(dish, i) in day.mealsByType[type]"
                      :key="i"
                      class="dish-line"
                    >
                      {{ dish }}
                    </div>
                  </div>
                  <div v-else class="dish-empty">Chưa cập nhật</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <!-- NÚT XEM THỰC ĐƠN TUẦN -->
<q-btn
  class="q-mt-lg full-width"
  color="pink-5"
  text-color="white"
  rounded
  no-caps
  @click="goToWeeklyMenu"
>
  Xem thực đơn tuần
  <q-icon name="chevron_right" class="q-ml-xs" />
</q-btn>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import { useRouter } from 'vue-router';
import { useAuthStore } from "src/stores/auth";

const $q = useQuasar();
const auth = useAuthStore();

const loading = ref(false);
const days = ref([]);
const childName = ref("");
const selectedStudentId = ref(null);
const selectedParentId = ref(null);
const router = useRouter();

// --- xử lý tuần hiện tại ---
const today = new Date();

const weekStart = ref(getMonday(today));
const weekEnd = ref(addDays(weekStart.value, 6));

const weekLabel = computed(() => {
  const ws = formatDisplayDate(weekStart.value);
  const we = formatDisplayDate(weekEnd.value);
  return `${ws} - ${we}`;
});

const mealTypes = ["Sáng", "Trưa", "Chiều"];

// helper tính thứ 2 của tuần
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0-6
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
}
function goToWeeklyMenu() {
  if (!selectedStudentId.value) return;

  const wsStr = weekStart.value.toISOString(); // tuần đang hiển thị
  const weStr = weekEnd.value.toISOString();   // tuần đang hiển thị

  router.push({
    name: 'parent-weekly-menu',
    query: {
      childId: selectedStudentId.value,
      weekStart: wsStr,
      weekEnd: weStr,
    },
  });
}


function addDays(d, n) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

// format cho query ?startDate=dd-MM-yyyy
function formatParamDate(d) {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// format hiển thị dd/MM/yyyy
function formatDisplayDate(d) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "--/--/----";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// --- lấy parentId & studentId ---
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
  if (!list.length) return null;

  const first = list[0];
  selectedStudentId.value = first.studentId;
  childName.value = first.fullName;

  return { parentId: parent.id, studentId: first.studentId };
}

// map JSON của BE -> FE
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

// gọi API
async function loadMenu() {
  if (!selectedParentId.value || !selectedStudentId.value) return;

  try {
    loading.value = true;
    const startParam = formatParamDate(weekStart.value);
    const endParam = formatParamDate(weekEnd.value);

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
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e.message ||
      "Không tải được thực đơn.";
    $q.notify({ type: "negative", message: msg });
  } finally {
    loading.value = false;
  }
}

// đổi tuần
async function changeWeek(offset) {
  weekStart.value = addDays(weekStart.value, offset * 7);
  weekEnd.value = addDays(weekStart.value, 6);
  await loadMenu();
}

// label & màu badge
function badgeLabel(type) {
  const t = type.toLowerCase();
  if (t.includes("sáng")) return "Bữa sáng";
  if (t.includes("trưa")) return "Bữa trưa";
  if (t.includes("chiều")) return "Bữa chiều";
  return type;
}

function badgeClass(type) {
  const t = type.toLowerCase();
  if (t.includes("sáng")) return "badge-morning";
  if (t.includes("trưa")) return "badge-noon";
  if (t.includes("chiều")) return "badge-evening";
  return "badge-default";
}

// --- khởi tạo ---
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

  await loadMenu();
});
</script>

<style scoped>
.menu-page {
  background: #f5f7fb;
  padding-bottom: 64px;
}

/* card lớn */
.day-card {
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(15, 40, 80, 0.12);
}

/* header trong thẻ */
.day-header {
  padding-bottom: 4px;
}

/* khung trắng bên trong chứa 3 bữa */
.menu-panel {
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 4px 10px;
}

/* từng dòng bữa ăn */
.meal-row-panel {
  display: flex;
  align-items: flex-start;
  padding: 6px 0;
}

.meal-row-panel.with-divider {
  border-bottom: 1px dashed #e5e7eb;
}

/* badge Bữa sáng / trưa / chiều */
.meal-badge {
  min-width: 80px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
  padding: 4px 8px;
  text-align: center;
  margin-right: 8px;
}

.badge-morning {
  background: #e8f5e9;
  color: #1b5e20;
}

.badge-noon {
  background: #fff3e0;
  color: #e65100;
}

.badge-evening {
  background: #fce4ec;
  color: #ad1457;
}

.badge-default {
  background: #e5e7eb;
  color: #374151;
}

/* danh sách món ăn */
.meal-dishes-list {
  flex: 1;
  font-size: 12px;
  color: #111827;
}

.dish-line + .dish-line {
  margin-top: 2px;
}

.dish-empty {
  font-size: 11px;
  color: #9ca3af;
  font-style: italic;
}

/* loading overlay */
.q-inner-loading {
  position: fixed;
}
.see-week-btn {
  width: 100%;
  max-width: 280px;
  font-weight: 600;
  letter-spacing: 0.2px;
  box-shadow: 0 6px 14px rgba(255, 64, 129, 0.35);
}

</style>
