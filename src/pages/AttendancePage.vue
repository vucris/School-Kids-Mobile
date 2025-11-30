<template>
  <q-page class="attendance-page">
    <div class="attendance-scroll q-pa-md q-pt-sm">
      <!-- KHU VỰC CHỌN BÉ -->
      <section class="child-section q-mb-md">
        <q-card class="child-card">
          <div class="row items-center justify-between q-pa-sm">
            <div>
              <div class="text-caption text-grey-7 q-mb-xs">Chọn bé:</div>
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

            <div v-if="currentChild" class="text-right">
              <div class="text-caption text-grey-7">
                Lớp {{ currentChild.className || "---" }}
              </div>
              <div class="text-caption text-grey-7">
                Mã HS: {{ currentChild.studentCode || "---" }}
              </div>
            </div>
          </div>
        </q-card>
      </section>

      <!-- TABS (điểm danh / đơn nghỉ) -->
      <div class="tabs-wrapper">
        <q-tabs
          v-model="tab"
          class="bg-white text-primary"
          indicator-color="primary"
          active-color="primary"
          align="justify"
          dense
        >
          <q-tab name="attendance" label="Điểm danh" />
        
        </q-tabs>
      </div>

      <div class="q-pa-xs q-pt-md">
        <!-- chọn tháng -->
        <div class="row items-center justify-between month-picker q-mb-md">
          <q-btn flat round dense icon="chevron_left" @click="prevMonth" />
          <div class="month-label row items-center">
            <q-icon name="event" size="18px" class="q-mr-xs text-primary" />
            <span>{{ monthLabel }}</span>
          </div>
          <q-btn flat round dense icon="chevron_right" @click="nextMonth" />
        </div>

        <!-- LOADING -->
        <q-card v-if="loading" flat class="q-pa-md q-mb-md">
          <q-inner-loading showing>
            <q-spinner-dots size="32px" color="primary" />
          </q-inner-loading>
        </q-card>

        <!-- THỐNG KÊ -->
        <div v-if="!loading" class="row q-col-gutter-sm q-mb-md">
          <div v-for="box in summaryBoxes" :key="box.key" class="col-3">
            <q-card class="summary-card" :class="box.class">
              <div class="summary-number">{{ box.value }}</div>
              <div class="summary-label">{{ box.label }}</div>
            </q-card>
          </div>
        </div>

        <!-- DANH SÁCH THEO TUẦN -->
        <div v-if="!loading" class="q-gutter-md">
          <q-banner v-if="!weeks.length" class="bg-blue-1 text-blue-8" rounded>
            <template #avatar>
              <q-icon name="event_busy" />
            </template>
            Tháng này chưa có dữ liệu điểm danh của bé.
          </q-banner>

          <q-card v-for="week in weeks" :key="week.range" class="week-card">
            <q-card-section class="q-pb-xs">
              <div class="text-caption text-grey-7 text-center">
                {{ week.range }}
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pt-xs q-pb-xs">
              <div
                v-for="day in week.days"
                :key="week.range + day.date"
                class="day-row row items-center justify-between"
              >
                <div class="text-caption text-grey-7">
                  <span class="text-weight-medium">{{ day.weekday }}</span>
                  <span class="q-ml-xs">{{ day.date }}</span>
                </div>

                <!-- màu theo type: present / excused / unexcused / undefined -->
                <div class="day-status" :class="day.type">
                  {{ day.label }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- NÚT VIẾT ĐƠN -->
        <div class="q-mt-lg q-mb-md">
          <q-btn
            class="write-leave-btn full-width"
            outline
            rounded
            no-caps
            color="primary"
            @click="writeLeave"
          >
            <q-icon name="edit_note" size="18px" class="q-mr-xs" />
            Viết đơn xin nghỉ phép
          </q-btn>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth";

const $q = useQuasar();
const auth = useAuthStore();

const tab = ref("attendance");

const children = ref([]); // danh sách con
const selectedChildId = ref(null); // bé đang chọn
const parentId = ref(null);

const loading = ref(false);

// tháng / năm hiện tại
const today = new Date();
const monthIndex = ref(today.getMonth()); // 0-11
const year = ref(today.getFullYear());

// dữ liệu cho UI
const weeks = ref([]);
const summary = ref({
  present: 0,
  excused: 0,
  unexcused: 0,
  undefined: 0,
});

// ------- COMPUTED -------
const monthLabel = computed(() => {
  const month = monthIndex.value + 1;
  return `Tháng ${month}/${year.value}`;
});

// 4 box: Đi học / Nghỉ có phép / Nghỉ không phép / Chưa điểm danh
const summaryBoxes = computed(() => [
  { key: "present", label: "Đi học", value: summary.value.present, class: "box-present" },
  {
    key: "excused",
    label: "Nghỉ có phép",
    value: summary.value.excused,
    class: "box-excused",
  },
  {
    key: "unexcused",
    label: "Nghỉ không phép",
    value: summary.value.unexcused,
    class: "box-unexcused",
  },
  {
    key: "undefined",
    label: "Chưa điểm danh",
    value: summary.value.undefined,
    class: "box-undefined",
  },
]);

const currentChild = computed(
  () => children.value.find((c) => c.id === selectedChildId.value) || null
);

// ------- HELPER DATE -------
function toDMY(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`; // -> BE dd-MM-yyyy
}

function labelDMY(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function getMonthRange(y, mIndex) {
  const start = new Date(y, mIndex, 1);
  const end = new Date(y, mIndex + 1, 0);
  return { start, end };
}

function weekdayLabel(d) {
  const w = d.getDay(); // 0=CN
  const map = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return map[w];
}

// parse chuỗi ngày BE trả về
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

/**
 * Map enum status từ BE -> label & type cho UI
 * - type = 'present' | 'excused' | 'unexcused' | 'undefined'
 * - 'LATE', 'EARLY_LEAVE' gộp chung với PRESENT thành Đi học (màu xanh)
 * - Các status dạng ABSENT_EXCUSED / EXCUSED → Nghỉ có phép
 * - ABSENT_UNEXCUSED / UNEXCUSED / ABSENT → Nghỉ không phép
 */
function mapStatus(status) {
  const s = (status || "UNDEFINED").toUpperCase();

  if (["PRESENT", "LATE", "EARLY_LEAVE"].includes(s)) {
    return { label: "Đi học", type: "present" };
  }

  if (["ABSENT_EXCUSED", "EXCUSED"].includes(s)) {
    return { label: "Nghỉ có phép", type: "excused" };
  }

  if (["ABSENT_UNEXCUSED", "UNEXCUSED", "ABSENT"].includes(s)) {
    return { label: "Nghỉ không phép", type: "unexcused" };
  }

  return { label: "Chưa điểm danh", type: "undefined" };
}

// ------- LOAD PARENT + CHILDREN -------
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

    // lấy list phụ huynh
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

    // lấy danh sách con
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
      await loadAttendanceForCurrentMonth();
    }
  } catch (e) {
    console.error("[Attendance] loadParentAndChildren error", e);
    $q.notify({
      type: "negative",
      message: "Không lấy được danh sách con.",
    });
  } finally {
    loading.value = false;
  }
}

// ------- LOAD ATTENDANCE -------
async function loadAttendanceForCurrentMonth() {
  if (!parentId.value || !selectedChildId.value) return;

  try {
    loading.value = true;

    const { start, end } = getMonthRange(year.value, monthIndex.value);

    const params = {
      startDate: toDMY(start),
      endDate: toDMY(end),
    };

    const res = await api.get(
      `/parents/${parentId.value}/children/${selectedChildId.value}/attendance`,
      { params }
    );

    const apiResp = res.data || {};
    const records = apiResp.data || [];

    const byDate = new Map();

    records.forEach((r) => {
      const dateStr = r.date || r.attendanceDate || r.attendance_date;
      const d = parseApiDate(dateStr);
      if (!d) return;

      const key = d.toISOString().slice(0, 10);
      const status = r.status || r.attendanceStatus || r.checkStatus;
      byDate.set(key, status);
    });

    buildCalendarData(start, end, byDate);
  } catch (e) {
    console.error("[Attendance] loadAttendanceForCurrentMonth error", e);
    $q.notify({
      type: "negative",
      message: "Không lấy được dữ liệu điểm danh của bé.",
    });
    weeks.value = [];
    summary.value = { present: 0, excused: 0, unexcused: 0, undefined: 0 };
  } finally {
    loading.value = false;
  }
}

// build weeks + summary
function buildCalendarData(start, end, byDate) {
  const daysArr = [];
  let cur = new Date(start);

  let totalWorkDays = 0;
  let present = 0;
  let excused = 0;
  let unexcused = 0;

  while (cur <= end) {
    const jsDay = cur.getDay();
    // chỉ tính Thứ 2 - Thứ 6
    if (jsDay >= 1 && jsDay <= 5) {
      totalWorkDays++;

      const key = cur.toISOString().slice(0, 10);
      const statusEnum = byDate.get(key) || "UNDEFINED";
      const { label, type } = mapStatus(statusEnum);

      if (type === "present") present++;
      else if (type === "excused") excused++;
      else if (type === "unexcused") unexcused++;

      daysArr.push({
        dateObj: new Date(cur),
        weekday: weekdayLabel(cur),
        date: labelDMY(cur),
        label,
        type, // present / excused / unexcused / undefined
      });
    }

    cur.setDate(cur.getDate() + 1);
  }

  const undef = totalWorkDays - present - excused - unexcused;

  summary.value = {
    present,
    excused,
    unexcused,
    undefined: undef < 0 ? 0 : undef,
  };

  // group thành tuần (5 ngày)
  const weekList = [];
  let currentWeek = [];

  daysArr.forEach((d, idx) => {
    currentWeek.push(d);
    const isLast = idx === daysArr.length - 1;

    if (currentWeek.length === 5 || isLast) {
      const first = currentWeek[0];
      const last = currentWeek[currentWeek.length - 1];
      weekList.push({
        range: `${first.date} - ${last.date}`,
        days: currentWeek,
      });
      currentWeek = [];
    }
  });

  weeks.value = weekList;
}

// ------- UI ACTIONS -------
function prevMonth() {
  if (monthIndex.value === 0) {
    monthIndex.value = 11;
    year.value -= 1;
  } else {
    monthIndex.value -= 1;
  }
  loadAttendanceForCurrentMonth();
}

function nextMonth() {
  if (monthIndex.value === 11) {
    monthIndex.value = 0;
    year.value += 1;
  } else {
    monthIndex.value += 1;
  }
  loadAttendanceForCurrentMonth();
}

function selectChild(s) {
  if (selectedChildId.value === s.id) return;
  selectedChildId.value = s.id;
  loadAttendanceForCurrentMonth(); // đổi bé → load lại
}

function writeLeave() {
  $q.notify({
    type: "info",
    message: "Màn viết đơn xin nghỉ sẽ được bổ sung sau.",
  });
}

// INIT
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
.attendance-page {
  background: #f5f7fb;
  padding-bottom: 64px;
}

.attendance-scroll {
  max-width: 520px;
  margin: 0 auto;
}

/* chọn bé */
.child-card {
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 3px 10px rgba(15, 40, 80, 0.08);
}

.child-card .scroll-x {
  overflow-x: auto;
}

.children-chip {
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.15);
}

/* tabs */
.tabs-wrapper {
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

/* chọn tháng */
.month-picker {
  background: #ffffff;
  border-radius: 14px;
  padding: 6px 8px;
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.08);
}

.month-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

/* thống kê */
.summary-card {
  border-radius: 16px;
  text-align: center;
  padding: 6px 4px;
  font-size: 11px;
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.06);
  background: #ffffff;
}

.summary-number {
  font-size: 15px;
  font-weight: 700;
}

.summary-label {
  margin-top: 2px;
  color: #6b7280;
}

/* màu box */
.box-present .summary-number {
  color: #16a34a;
}
.box-excused .summary-number {
  color: #f59e0b;
}
.box-unexcused .summary-number {
  color: #dc2626;
}
.box-undefined .summary-number {
  color: #4b5563;
}

/* card theo tuần */
.week-card {
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 3px 10px rgba(15, 40, 80, 0.08);
}

/* từng dòng ngày */
.day-row {
  padding: 6px 4px;
  border-radius: 10px;
  margin-bottom: 4px;
}

.day-row:last-child {
  margin-bottom: 0;
}

.day-status {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}

/* màu trạng thái: Đi học xanh, nghỉ phép vàng, nghỉ không phép đỏ */
.day-status.present {
  background: #e3f9e5;
  color: #15803d;
}

.day-status.excused {
  background: #fff7e6;
  color: #b45309;
}

.day-status.unexcused {
  background: #fee2e2;
  color: #b91c1c;
}

.day-status.undefined {
  background: #e5e7eb;
  color: #4b5563;
}

/* nút viết đơn */
.write-leave-btn {
  border-style: dashed;
  border-width: 1.5px;
  background: #f9fafb;
}
</style>
