<template>
  <q-page class="attendance-page">
    <!-- Header gradient đẹp -->
    <div class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="header-icon">
          <q-icon name="fact_check" size="28px" />
        </div>
        <div class="header-text">
          <h1>Điểm danh</h1>
          <p>Theo dõi tình hình đi học của bé</p>
        </div>
      </div>
    </div>

    <div class="attendance-scroll q-pa-md">
      <!-- KHU VỰC CHỌN BÉ -->
      <section class="child-section q-mb-md">
        <div class="section-label">
          <q-icon name="child_care" size="16px" class="q-mr-xs" />
          <span>Chọn bé của bạn</span>
        </div>

        <q-card class="child-card">
          <div class="child-card-bg"></div>
          <div class="child-card-content">
            <div class="row items-center justify-between">
              <div class="col">
                <div class="row no-wrap scroll-x children-list">
                  <div
                    v-for="s in children"
                    :key="s.id"
                    class="child-chip"
                    :class="{ active: s.id === selectedChildId }"
                    @click="selectChild(s)"
                  >
                    <div class="child-chip-avatar">
                      <q-icon name="face" size="20px" />
                    </div>
                    <span>{{ s.name }}</span>
                  </div>
                </div>
              </div>

              <div v-if="currentChild" class="child-info text-right">
                <div class="info-badge class-badge">
                  <q-icon name="school" size="12px" />
                  {{ currentChild.className || "---" }}
                </div>
                <div class="info-badge code-badge q-mt-xs">
                  <q-icon name="badge" size="12px" />
                  {{ currentChild.studentCode || "---" }}
                </div>
              </div>
            </div>
          </div>
        </q-card>
      </section>

      <!-- CHỌN THÁNG -->
      <section class="month-section q-mb-md">
        <q-card class="month-card">
          <div class="month-card-inner">
            <q-btn
              flat
              round
              dense
              icon="chevron_left"
              class="month-nav-btn"
              @click="prevMonth"
            />

            <div class="month-display">
              <div class="month-icon">
                <q-icon name="calendar_month" size="24px" />
              </div>
              <div class="month-text">
                <span class="month-number">Tháng {{ monthIndex + 1 }}</span>
                <span class="month-year">{{ year }}</span>
              </div>
            </div>

            <q-btn
              flat
              round
              dense
              icon="chevron_right"
              class="month-nav-btn"
              @click="nextMonth"
            />
          </div>
        </q-card>
      </section>

      <!-- LOADING -->
      <q-card v-if="loading" flat class="loading-card q-pa-lg q-mb-md">
        <div class="loading-content">
          <q-spinner-dots size="48px" color="pink-4" />
          <p class="q-mt-md text-grey-6">Đang tải dữ liệu điểm danh...</p>
        </div>
      </q-card>

      <!-- THỐNG KÊ TỔNG QUAN -->
      <section v-if="!loading" class="summary-section q-mb-md">
        <div class="section-label">
          <q-icon name="insights" size="16px" class="q-mr-xs" />
          <span>Tổng quan tháng này</span>
        </div>

        <div class="summary-grid">
          <div
            v-for="box in summaryBoxes"
            :key="box.key"
            class="summary-item"
            :class="box.class"
          >
            <div class="summary-icon">
              <q-icon :name="box.icon" size="20px" />
            </div>
            <div class="summary-value">{{ box.value }}</div>
            <div class="summary-label">{{ box.label }}</div>
          </div>
        </div>
      </section>

      <!-- DANH SÁCH THEO TUẦN -->
      <section v-if="!loading" class="weeks-section">
        <div class="section-label">
          <q-icon name="date_range" size="16px" class="q-mr-xs" />
          <span>Chi tiết từng tuần</span>
        </div>

        <q-banner v-if="!weeks.length" class="empty-banner q-mb-md" rounded>
          <template #avatar>
            <div class="empty-icon">
              <q-icon name="event_busy" size="32px" />
            </div>
          </template>
          <div class="empty-text">
            <strong>Chưa có dữ liệu</strong>
            <p>Tháng này chưa có dữ liệu điểm danh của bé.</p>
          </div>
        </q-banner>

        <div v-else class="weeks-list">
          <q-card
            v-for="(week, weekIdx) in weeks"
            :key="week.range"
            class="week-card q-mb-md"
          >
            <div class="week-header">
              <div class="week-number">Tuần {{ weekIdx + 1 }}</div>
              <div class="week-range">{{ week.range }}</div>
            </div>

            <div class="week-days">
              <div v-for="day in week.days" :key="week.range + day.date" class="day-item">
                <div class="day-left">
                  <div class="day-weekday">{{ day.weekday }}</div>
                  <div class="day-date">{{ day.date }}</div>
                </div>

                <div class="day-status" :class="day.type">
                  <q-icon :name="getStatusIcon(day.type)" size="14px" />
                  <span>{{ day.label }}</span>
                </div>
              </div>
            </div>
          </q-card>
        </div>
      </section>

      <!-- NÚT VIẾT ĐƠN -->
      <section class="action-section q-mt-lg q-mb-xl">
        <q-btn class="write-leave-btn" unelevated rounded no-caps @click="writeLeave">
          <div class="btn-content">
            <div class="btn-icon">
              <q-icon name="edit_note" size="24px" />
            </div>
            <div class="btn-text">
              <span class="btn-title">Viết đơn xin nghỉ phép</span>
              <span class="btn-desc">Gửi đơn xin nghỉ cho giáo viên</span>
            </div>
          </div>
          <q-icon name="chevron_right" size="20px" class="btn-arrow" />
        </q-btn>
      </section>
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

const children = ref([]);
const selectedChildId = ref(null);
const parentId = ref(null);

const loading = ref(false);

const today = new Date();
const monthIndex = ref(today.getMonth());
const year = ref(today.getFullYear());

const weeks = ref([]);
const summary = ref({
  present: 0,
  excused: 0,
  unexcused: 0,
  undefined: 0,
});

/* ======= COMPUTED ======= */

const summaryBoxes = computed(() => [
  {
    key: "present",
    label: "Đi học",
    value: summary.value.present,
    class: "box-present",
    icon: "check_circle",
  },
  {
    key: "excused",
    label: "Nghỉ phép",
    value: summary.value.excused,
    class: "box-excused",
    icon: "event_available",
  },
  {
    key: "unexcused",
    label: "Nghỉ không phép",
    value: summary.value.unexcused,
    class: "box-unexcused",
    icon: "cancel",
  },
  {
    key: "undefined",
    label: "Chưa điểm danh",
    value: summary.value.undefined,
    class: "box-undefined",
    icon: "help_outline",
  },
]);

const currentChild = computed(
  () => children.value.find((c) => c.id === selectedChildId.value) || null
);

/* ======= HELPERS ======= */

function getStatusIcon(type) {
  const icons = {
    present: "check_circle",
    excused: "event_available",
    unexcused: "cancel",
    undefined: "help_outline",
  };
  return icons[type] || "help_outline";
}

function toDMY(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function labelDMY(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

function getMonthRange(y, mIndex) {
  const start = new Date(y, mIndex, 1);
  const end = new Date(y, mIndex + 1, 0);
  return { start, end };
}

function weekdayLabel(d) {
  const w = d.getDay();
  const map = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return map[w];
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

function mapStatus(status) {
  const s = (status || "UNDEFINED").toUpperCase();

  if (["PRESENT", "LATE", "EARLY_LEAVE"].includes(s)) {
    return { label: "Đi học", type: "present" };
  }

  if (["ABSENT_EXCUSED", "EXCUSED"].includes(s)) {
    return { label: "Nghỉ phép", type: "excused" };
  }

  if (["ABSENT_UNEXCUSED", "UNEXCUSED", "ABSENT"].includes(s)) {
    return { label: "Nghỉ không phép", type: "unexcused" };
  }

  return { label: "Chưa điểm danh", type: "undefined" };
}

/* ======= LOAD DATA ======= */

async function loadParentAndChildren() {
  try {
    loading.value = true;

    const username = auth.user?.username || localStorage.getItem("username");
    if (!username) {
      $q.notify({
        type: "warning",
        message: "Không tìm thấy tài khoản phụ huynh.",
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
      message: "Không lấy được dữ liệu điểm danh.",
    });
    weeks.value = [];
    summary.value = { present: 0, excused: 0, unexcused: 0, undefined: 0 };
  } finally {
    loading.value = false;
  }
}

function buildCalendarData(start, end, byDate) {
  const daysArr = [];
  let cur = new Date(start);

  let totalWorkDays = 0;
  let present = 0;
  let excused = 0;
  let unexcused = 0;

  while (cur <= end) {
    const jsDay = cur.getDay();
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
        type,
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

/* ======= UI ACTIONS ======= */

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
  loadAttendanceForCurrentMonth();
}

function writeLeave() {
  $q.notify({
    type: "info",
    message: "Màn viết đơn xin nghỉ sẽ được bổ sung sau.",
  });
}

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
. attendance-page {
  background: linear-gradient(180deg, #fff5f8 0%, #f0f4ff 50%, #fef9ff 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}

/* ===== HEADER ===== */
.page-header {
  position: relative;
  padding: 20px 16px 24px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44ce0 50%, #7b68ee 100%);
  border-radius: 0 0 32px 32px;
}

.header-bg::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header-bg::after {
  content: "";
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.08);
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
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

. header-text p {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

/* ===== SCROLL CONTAINER ===== */
.attendance-scroll {
  max-width: 480px;
  margin: -12px auto 0;
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
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 8px 24px rgba(236, 72, 153, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.child-card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, #ffe4ec 0%, transparent 50%),
    radial-gradient(circle at bottom right, #e0e7ff 0%, transparent 50%);
  opacity: 0.7;
}

.child-card-content {
  position: relative;
  z-index: 1;
  padding: 14px;
}

.children-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
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

.child-chip:hover {
  border-color: #f472b6;
  background: #fdf2f8;
}

. child-chip.active {
  background: linear-gradient(135deg, #ec4899, #a855f7);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0 3);
}

. child-chip-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.child-chip. active .child-chip-avatar {
  background: rgba(255, 255, 255, 0.25);
}

. child-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

. info-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.class-badge {
  background: linear-gradient(135deg, #fce7f3, #fdf4ff);
  color: #be185d;
}

. code-badge {
  background: linear-gradient(135deg, #e0e7ff, #ede9fe);
  color: #6366f1;
}

/* ===== MONTH SECTION ===== */
.month-card {
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0 1);
  overflow: hidden;
}

.month-card-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px;
}

.month-nav-btn {
  width: 40px;
  height: 40px;
  color: #a855f7;
}

.month-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.month-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fce7f3, #e0e7ff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a855f7;
}

.month-text {
  display: flex;
  flex-direction: column;
}

.month-number {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.month-year {
  font-size: 12px;
  color: #94a3b8;
}

/* ===== LOADING ===== */
.loading-card {
  border-radius: 20px;
  background: #fff;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

/* ===== SUMMARY SECTION ===== */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.summary-item {
  background: #fff;
  border-radius: 16px;
  padding: 14px 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.summary-item:active {
  transform: scale(0.97);
}

. summary-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
}

.summary-label {
  font-size: 10px;
  color: #6b7280;
  margin-top: 4px;
}

/* màu box */
.box-present . summary-icon {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
}
.box-present .summary-value {
  color: #059669;
}

.box-excused .summary-icon {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
}
.box-excused .summary-value {
  color: #d97706;
}

.box-unexcused .summary-icon {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
}
. box-unexcused .summary-value {
  color: #dc2626;
}

. box-undefined .summary-icon {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #64748b;
}
.box-undefined .summary-value {
  color: #64748b;
}

/* ===== WEEKS SECTION ===== */
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

.empty-text strong {
  color: #92400e;
  font-size: 14px;
}

. empty-text p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #a16207;
}

. week-card {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fdf4ff, #ede9fe);
}

.week-number {
  font-size: 13px;
  font-weight: 700;
  color: #7c3aed;
}

.week-range {
  font-size: 12px;
  color: #8b5cf6;
}

.week-days {
  padding: 8px 12px;
}

.day-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  border-radius: 12px;
  margin-bottom: 4px;
  transition: background 0.2s ease;
}

.day-item:hover {
  background: #f8fafc;
}

.day-item:last-child {
  margin-bottom: 0;
}

.day-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.day-weekday {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
}

.day-date {
  font-size: 13px;
  color: #475569;
}

.day-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.day-status.present {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #047857;
}

.day-status. excused {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #b45309;
}

.day-status. unexcused {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #b91c1c;
}

.day-status.undefined {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #64748b;
}

/* ===== ACTION BUTTON ===== */
.write-leave-btn {
  width: 100%;
  padding: 16px 20px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ec4899, #a855f7);
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

. btn-title {
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

/* ===== RESPONSIVE ===== */
@media (max-width: 380px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-item {
    padding: 12px 6px;
  }

  .summary-value {
    font-size: 18px;
  }
}
</style>
