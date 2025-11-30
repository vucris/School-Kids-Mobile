<template>
  <q-page class="health-page">
    <!-- Tabs Chiều cao / Cân nặng / BMI -->
    <div class="tabs-wrapper">
      <q-tabs
        v-model="tab"
        class="text-primary bg-white"
        indicator-color="primary"
        active-color="primary"
        align="justify"
        dense
      >
        <q-tab name="height" label="Chiều cao" />
        <q-tab name="weight" label="Cân nặng" />
        <q-tab name="bmi" label="BMI" />
      </q-tabs>
    </div>

    <div class="q-pa-md q-pt-sm">
      <!-- Biểu đồ -->
      <q-card class="chart-card">
        <q-card-section class="q-pb-sm row items-center justify-between">
          <div class="text-body2 text-weight-medium">
            {{ chartTitle }}
          </div>
          <div v-if="childName" class="text-caption text-grey-6">
            Bé: <span class="text-weight-medium">{{ childName }}</span>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-xs q-pb-sm">
          <!-- Có dữ liệu -->
          <div v-if="measurements.length" class="chart-box">
            <div class="chart-inner">
              <!-- trục Y -->
              <div class="y-axis">
                <span v-for="mark in yMarks" :key="mark">
                  {{ mark }}
                </span>
              </div>

              <!-- cột -->
              <div class="bars-wrapper">
                <div class="bars-row">
                  <div v-for="m in measurements" :key="m.id || m.month" class="bar-item">
                    <span class="bar-value">
                      {{ formatNumber(valueOf(m)) }}
                    </span>
                    <div
                      class="bar"
                      :style="{ height: barHeight(valueOf(m)) + '%' }"
                    ></div>
                    <span class="bar-label">
                      {{ m.month }}
                    </span>
                  </div>
                </div>

                <div class="x-axis-labels">
                  <span class="x-unit-left">{{ yUnit }}</span>
                  <span class="x-unit-right">Tháng tuổi</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Chưa có dữ liệu -->
          <div v-else class="chart-empty q-pa-md column items-center justify-center">
            <q-icon name="insights" size="28px" class="q-mb-xs text-grey-5" />
            <div class="text-caption text-grey-6">
              Chưa có dữ liệu để hiển thị biểu đồ.
            </div>
          </div>

          <q-inner-loading :showing="loading">
            <q-spinner-dots size="28px" color="primary" />
          </q-inner-loading>
        </q-card-section>
      </q-card>

      <!-- Lịch sử đo -->
      <div class="q-mt-lg">
        <div class="text-body2 text-weight-medium q-mb-sm">Lịch sử đo</div>

        <q-card class="history-card">
          <q-list v-if="measurements.length">
            <q-item
              v-for="m in measurements"
              :key="m.id || m.month"
              clickable
              v-ripple
              class="history-item q-py-md"
            >
              <!-- Tháng tuổi -->
              <q-item-section avatar>
                <div class="month-pill column items-center justify-center">
                  <span class="month-number">{{ m.month }}</span>
                  <span class="month-label">Tháng tuổi</span>
                </div>
              </q-item-section>

              <!-- Thông tin chi tiết theo hàng -->
              <q-item-section>
                <div class="history-main">
                  <!-- Hàng 1: Cân nặng / Chiều cao -->
                  <div class="info-row">
                    <span class="info-label">Cân nặng:</span>
                    <span class="info-value">{{ formatNumber(m.weight) }} kg</span>

                    <span class="info-dot">•</span>

                    <span class="info-label">BMI:</span>
                    <span class="info-value">{{ formatNumber(m.bmi) }}</span>
                  </div>

                  <!-- Hàng 2: Chiều cao + Tình trạng -->
                  <div class="info-row">
                    <span class="info-label">Chiều cao:</span>
                    <span class="info-value">{{ formatNumber(m.height) }} cm</span>

                    <span class="info-dot">•</span>

                    <span class="info-label">Tình trạng:</span>
                    <span class="info-value">
                      {{ m.status || "Chưa đánh giá" }}
                    </span>
                  </div>

                  <!-- Hàng 3: Nhóm máu + Biết bơi -->
                  <div class="info-row chips-row">
                    <q-chip
                      dense
                      outline
                      color="blue-5"
                      text-color="blue-9"
                      class="chip-small q-mr-xs"
                    >
                      {{ bloodLabel(m.bloodType) }}
                    </q-chip>

                    <q-chip
                      dense
                      outline
                      :color="m.knowsSwimming ? 'teal-5' : 'red-4'"
                      :text-color="m.knowsSwimming ? 'teal-9' : 'red-8'"
                      class="chip-small"
                    >
                      {{ swimmingLabel(m.knowsSwimming) }}
                    </q-chip>
                  </div>

                  <!-- Hàng 4: Mắt / Răng -->
                  <div class="info-row extra-row" v-if="m.eyeIssue || m.dentalIssue">
                    <div class="extra-line" v-if="m.eyeIssue">
                      <q-icon name="visibility" size="14px" class="q-mr-xs" />
                      <span class="info-label">Mắt:</span>
                      <span class="info-value">{{ m.eyeIssue }}</span>
                    </div>
                    <div class="extra-line" v-if="m.dentalIssue">
                      <q-icon name="emoji_emotions" size="14px" class="q-mr-xs" />
                      <span class="info-label">Răng:</span>
                      <span class="info-value">{{ m.dentalIssue }}</span>
                    </div>
                  </div>

                  <!-- Hàng 5: Ghi chú -->
                  <div class="info-row note-row" v-if="m.note">
                    <q-icon name="notes" size="14px" class="q-mr-xs" />
                    <span class="info-label">Ghi chú:</span>
                    <span class="info-value">{{ m.note }}</span>
                  </div>
                </div>
              </q-item-section>

              <!-- Chip trạng thái bên phải -->
              <q-item-section side>
                <div class="status-tag" :class="statusClass(m.status)">
                  {{ m.status || "Chưa đánh giá" }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="q-pa-md text-caption text-grey-6 text-center">
            Chưa có hồ sơ sức khỏe nào cho bé.
          </div>
        </q-card>
      </div>

      <!-- Nút thêm cân đo (giáo viên / admin sau này) -->
      <div class="q-mt-lg q-mb-md">
        <q-btn
          class="add-btn full-width"
          color="primary"
          outline
          rounded
          no-caps
          @click="addMeasurement"
        >
          <q-icon name="add" size="18px" class="q-mr-xs" />
          Thêm cân đo mới
        </q-btn>
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

const tab = ref("height");
const loading = ref(false);

// thông tin bé đang xem
const childName = ref("");
const selectedStudentId = ref(null);

// danh sách các lần đo (map từ HealthRecordResponse)
const measurements = ref([]);

// ====== LẤY DỮ LIỆU TỪ BACKEND ======

function getStudentIdFromLocal() {
  const raw = localStorage.getItem("currentStudentId");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

async function resolveStudentIdFromParent() {
  const username = auth.user?.username || localStorage.getItem("username");
  if (!username) return null;

  const resParents = await api.get("/parents/all");
  const parentsApi = resParents.data || {};
  const parents = parentsApi.data || [];
  const parent = parents.find((p) => p.username === username);
  if (!parent) return null;

  const resChildren = await api.get(`/parents/${parent.id}/children`);
  const childrenApi = resChildren.data || {};
  const list = childrenApi.data || [];

  if (!list.length) return null;

  const first = list[0];
  childName.value = first.fullName || "";
  return first.studentId;
}

function mapHealthRecordsToMeasurements(records) {
  if (!Array.isArray(records)) return [];
  return records
    .map((r) => ({
      id: r.id,
      month: r.ageInMonths ?? r.recordMonth ?? 0, // Tháng tuổi / tháng ghi nhận
      height: r.heightCm != null ? Number(r.heightCm) : null,
      weight: r.weightKg != null ? Number(r.weightKg) : null,
      bmi: r.bmi != null ? Number(r.bmi) : null,
      status: r.nutritionStatus || null, // Tình trạng dinh dưỡng
      bloodType: r.bloodType || null,
      knowsSwimming: r.knowsSwimming, // Boolean
      eyeIssue: r.eyeIssue || "",
      dentalIssue: r.dentalIssue || "",
      note: r.note || "",
      recordYear: r.recordYear,
      recordMonth: r.recordMonth,
      studentName: r.studentName,
    }))
    .sort((a, b) => a.month - b.month);
}

async function loadHealthRecords() {
  if (!selectedStudentId.value) return;

  try {
    loading.value = true;

    const res = await api.get(`/health-records/student/${selectedStudentId.value}`);
    const apiResp = res.data || {};
    const list = apiResp.data || [];

    const mapped = mapHealthRecordsToMeasurements(list);
    measurements.value = mapped;

    if (!childName.value && mapped.length && mapped[0].studentName) {
      childName.value = mapped[0].studentName;
    }
  } catch (e) {
    console.error("[Health] loadHealthRecords error", e);
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e.message ||
      "Không tải được hồ sơ sức khỏe.";
    $q.notify({
      type: "negative",
      message: msg,
    });
  } finally {
    loading.value = false;
  }
}

// ====== BIỂU ĐỒ & LỊCH SỬ ======
const chartTitle = computed(() => {
  if (tab.value === "height") return "Biểu đồ đo chiều cao theo tuổi cho bé";
  if (tab.value === "weight") return "Biểu đồ cân nặng theo tuổi cho bé";
  return "Biểu đồ BMI theo tuổi cho bé";
});

const yUnit = computed(() => {
  if (tab.value === "height") return "cm";
  if (tab.value === "weight") return "kg";
  return "BMI";
});

const valueOf = (m) => {
  if (tab.value === "height") return m.height || 0;
  if (tab.value === "weight") return m.weight || 0;
  return m.bmi || 0;
};

const maxValue = computed(() => {
  if (!measurements.value.length) return 0;
  return Math.max(...measurements.value.map((m) => valueOf(m)));
});

function barHeight(v) {
  if (!maxValue.value) return 0;
  return Math.max(5, (v / maxValue.value) * 100);
}

const yMarks = computed(() => {
  const step = tab.value === "bmi" ? 5 : 30;
  const max = tab.value === "height" ? 150 : tab.value === "weight" ? 60 : 35;
  const arr = [];
  for (let v = 0; v <= max; v += step) arr.push(v);
  return arr.reverse();
});

function statusClass(status) {
  if (!status) return "status-normal";
  const s = status.toLowerCase();
  if (s.includes("béo")) return "status-obese";
  if (s.includes("thiếu")) return "status-thin";
  if (s.includes("bình")) return "status-normal";
  return "status-normal";
}

function formatNumber(val) {
  if (val == null || Number.isNaN(Number(val))) return "--";
  return Number(val).toFixed(1);
}

function bloodLabel(bloodType) {
  return bloodType ? `Nhóm máu: ${bloodType}` : "Nhóm máu: Chưa cập nhật";
}

function swimmingLabel(val) {
  if (val === true) return "Biết bơi";
  if (val === false) return "Chưa biết bơi";
  return "Biết bơi: Chưa rõ";
}

function addMeasurement() {
  // Sau này mở dialog cho giáo viên/admin
  console.log("Thêm cân đo mới (FE demo)");
}

// ====== KHỞI TẠO ======
onMounted(async () => {
  if (!auth.accessToken) {
    $q.notify({
      type: "warning",
      message: "Bạn chưa đăng nhập.",
    });
    return;
  }

  let sid = getStudentIdFromLocal();
  if (!sid) {
    sid = await resolveStudentIdFromParent();
  }

  if (!sid) {
    $q.notify({
      type: "warning",
      message: "Không tìm thấy học sinh để hiển thị hồ sơ sức khỏe.",
    });
    return;
  }

  selectedStudentId.value = sid;
  await loadHealthRecords();
});
</script>

<style scoped>
.health-page {
  background: #f5f7fb;
  padding-bottom: 64px;
}

.tabs-wrapper {
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.08);
  z-index: 2;
}

/* card biểu đồ */
.chart-card {
  border-radius: 0 0 20px 20px;
  box-shadow: 0 4px 12px rgba(15, 40, 80, 0.15);
}

/* vùng biểu đồ */
.chart-box {
  border-radius: 14px;
  background: #f3f6fb;
  padding: 10px 12px 14px;
  position: relative;
  min-height: 180px;
}

.chart-empty {
  border-radius: 14px;
  background: #f9fafb;
}

/* khối bên trong biểu đồ */
.chart-inner {
  display: flex;
  flex-direction: row;
}

/* trục Y */
.y-axis {
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  justify-content: space-between;
  font-size: 9px;
  color: #9ca3af;
  padding-right: 4px;
  border-right: 1px dashed #d1d5db;
  margin-right: 8px;
}

.y-axis span {
  flex: 1;
}

/* vùng cột */
.bars-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bars-row {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 8px;
}

/* mỗi cột */
.bar-item {
  flex: 1;
  max-width: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar {
  width: 100%;
  border-radius: 8px 8px 2px 2px;
  background: linear-gradient(180deg, #38bdf8, #0284c7);
  box-shadow: 0 3px 6px rgba(3, 169, 244, 0.35);
}

.bar-value {
  font-size: 10px;
  color: #111827;
  margin-bottom: 2px;
}

.bar-label {
  margin-top: 4px;
  font-size: 9px;
  color: #6b7280;
}

/* nhãn đơn vị */
.x-axis-labels {
  margin-top: 6px;
  font-size: 10px;
  display: flex;
  justify-content: space-between;
  color: #9ca3af;
}

.x-unit-left {
  margin-left: 2px;
}
.x-unit-right {
  margin-right: 2px;
}

/* lịch sử đo */
.history-card {
  border-radius: 18px;
  box-shadow: 0 4px 12px rgba(15, 40, 80, 0.12);
  background: #ffffff;
}

.history-item {
  align-items: flex-start;
}

.history-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* pill tháng */
.month-pill {
  width: 60px;
  height: 60px;
  border-radius: 20px;
  background: #ffb300;
  color: white;
  text-align: center;
}

.month-number {
  font-size: 18px;
  font-weight: 700;
}

.month-label {
  font-size: 11px;
}

/* các dòng thông tin y tế */
.info-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 11px;
  color: #4b5563;
}

.info-label {
  font-weight: 600;
  margin-right: 3px;
}

.info-value {
  margin-right: 6px;
}

.info-dot {
  margin: 0 6px;
  color: #9ca3af;
}

/* chips nhỏ */
.chips-row {
  margin-top: 2px;
}

.chip-small {
  font-size: 10px;
  height: auto;
  padding: 2px 8px;
  border-radius: 999px;
}

/* extra info (mắt, răng) */
.extra-row {
  flex-direction: column;
}

.extra-line + .extra-line {
  margin-top: 2px;
}

/* ghi chú */
.note-row {
  margin-top: 2px;
}

/* trạng thái */
.status-tag {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  text-align: right;
  min-width: 80px;
}

.status-obese {
  background: #ffebee;
  color: #c62828;
}

.status-thin {
  background: #e3f2fd;
  color: #1565c0;
}

.status-normal {
  background: #e8f5e9;
  color: #2e7d32;
}

/* nút thêm */
.add-btn {
  border-style: dashed;
  border-width: 1.5px;
  background: #f9fafb;
}
</style>
