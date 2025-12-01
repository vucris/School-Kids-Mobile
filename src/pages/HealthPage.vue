<template>
  <q-page class="health-page">
    <!-- HEADER GRADIENT -->
    <div class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="header-icon">
          <q-icon name="monitor_heart" size="28px" />
        </div>
        <div class="header-text">
          <h1>Hồ sơ sức khỏe</h1>
          <p v-if="childName">Theo dõi sức khỏe của bé {{ childName }}</p>
          <p v-else>Theo dõi sức khỏe của bé</p>
        </div>
      </div>
    </div>

    <div class="health-scroll q-pa-md">
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
                :key="s. id"
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

      <!-- TABS: Tổng quan / Biểu đồ / Lịch sử -->
      <section class="view-tabs-section q-mb-md">
        <div class="view-tabs">
          <button
            class="view-tab"
            :class="{ active: viewMode === 'overview' }"
            @click="viewMode = 'overview'"
          >
            <q-icon name="dashboard" size="18px" />
            <span>Tổng quan</span>
          </button>
          <button
            class="view-tab"
            :class="{ active: viewMode === 'chart' }"
            @click="viewMode = 'chart'"
          >
            <q-icon name="show_chart" size="18px" />
            <span>Biểu đồ</span>
          </button>
          <button
            class="view-tab"
            :class="{ active: viewMode === 'history' }"
            @click="viewMode = 'history'"
          >
            <q-icon name="history" size="18px" />
            <span>Lịch sử</span>
          </button>
        </div>
      </section>

      <!-- LOADING -->
      <q-card v-if="loading" flat class="loading-card q-pa-lg q-mb-md">
        <div class="loading-content">
          <q-spinner-dots size="48px" color="pink-4" />
          <p class="q-mt-md text-grey-6">Đang tải hồ sơ sức khỏe...</p>
        </div>
      </q-card>

      <!-- CHẾ ĐỘ TỔNG QUAN -->
      <template v-if="! loading && viewMode === 'overview'">
        <!-- Thông tin mới nhất -->
        <section class="latest-section q-mb-md">
          <div class="section-label">
            <q-icon name="update" size="16px" class="q-mr-xs" />
            <span>Thông tin mới nhất</span>
          </div>

          <q-card v-if="latestRecord" class="latest-card">
            <div class="latest-header">
              <div class="latest-month">
                <div class="month-number">{{ latestRecord.month }}</div>
                <div class="month-label">tháng tuổi</div>
              </div>
              <div class="latest-date">
                <q-icon name="event" size="14px" />
                <span>Tháng {{ latestRecord.recordMonth }}/{{ latestRecord.recordYear }}</span>
              </div>
            </div>

            <div class="latest-stats">
              <div class="stat-item stat-height">
                <div class="stat-icon">
                  <q-icon name="height" size="20px" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ formatNumber(latestRecord. height) }}</div>
                  <div class="stat-label">cm</div>
                </div>
              </div>

              <div class="stat-item stat-weight">
                <div class="stat-icon">
                  <q-icon name="fitness_center" size="20px" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ formatNumber(latestRecord.weight) }}</div>
                  <div class="stat-label">kg</div>
                </div>
              </div>

              <div class="stat-item stat-bmi">
                <div class="stat-icon">
                  <q-icon name="speed" size="20px" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ formatNumber(latestRecord.bmi) }}</div>
                  <div class="stat-label">BMI</div>
                </div>
              </div>
            </div>

            <div class="latest-status">
              <q-badge
                :color="statusColor(latestRecord.status)"
                text-color="white"
                class="status-badge"
              >
                <q-icon :name="statusIcon(latestRecord.status)" size="14px" class="q-mr-xs" />
                {{ latestRecord.status || 'Chưa đánh giá' }}
              </q-badge>
            </div>
          </q-card>

          <q-card v-else class="empty-latest-card">
            <div class="empty-content">
              <q-icon name="health_and_safety" size="48px" />
              <p>Chưa có dữ liệu sức khỏe</p>
            </div>
          </q-card>
        </section>

        <!-- Thông tin y tế -->
        <section class="medical-section q-mb-md">
          <div class="section-label">
            <q-icon name="medical_information" size="16px" class="q-mr-xs" />
            <span>Thông tin y tế</span>
          </div>

          <q-card class="medical-card">
            <div class="medical-grid">
              <div class="medical-item">
                <div class="medical-icon blood">
                  <q-icon name="bloodtype" size="20px" />
                </div>
                <div class="medical-info">
                  <div class="medical-label">Nhóm máu</div>
                  <div class="medical-value">{{ latestRecord?. bloodType || 'Chưa cập nhật' }}</div>
                </div>
              </div>

              <div class="medical-item">
                <div class="medical-icon swim">
                  <q-icon name="pool" size="20px" />
                </div>
                <div class="medical-info">
                  <div class="medical-label">Biết bơi</div>
                  <div class="medical-value">{{ swimmingLabel(latestRecord?.knowsSwimming) }}</div>
                </div>
              </div>

              <div class="medical-item">
                <div class="medical-icon eye">
                  <q-icon name="visibility" size="20px" />
                </div>
                <div class="medical-info">
                  <div class="medical-label">Thị lực</div>
                  <div class="medical-value">{{ latestRecord?.eyeIssue || 'Bình thường' }}</div>
                </div>
              </div>

              <div class="medical-item">
                <div class="medical-icon dental">
                  <q-icon name="sentiment_satisfied" size="20px" />
                </div>
                <div class="medical-info">
                  <div class="medical-label">Răng miệng</div>
                  <div class="medical-value">{{ latestRecord?.dentalIssue || 'Bình thường' }}</div>
                </div>
              </div>
            </div>

            <div v-if="latestRecord?. note" class="medical-note">
              <q-icon name="notes" size="16px" />
              <span>{{ latestRecord.note }}</span>
            </div>
          </q-card>
        </section>
      </template>

      <!-- CHẾ ĐỘ BIỂU ĐỒ -->
      <template v-if="!loading && viewMode === 'chart'">
        <!-- Tabs chọn loại biểu đồ -->
        <section class="chart-tabs-section q-mb-md">
          <div class="chart-tabs">
            <button
              class="chart-tab"
              :class="{ active: chartType === 'height' }"
              @click="chartType = 'height'"
            >
              <q-icon name="height" size="16px" />
              <span>Chiều cao</span>
            </button>
            <button
              class="chart-tab"
              :class="{ active: chartType === 'weight' }"
              @click="chartType = 'weight'"
            >
              <q-icon name="fitness_center" size="16px" />
              <span>Cân nặng</span>
            </button>
            <button
              class="chart-tab"
              :class="{ active: chartType === 'bmi' }"
              @click="chartType = 'bmi'"
            >
              <q-icon name="speed" size="16px" />
              <span>BMI</span>
            </button>
          </div>
        </section>

        <!-- Biểu đồ -->
        <q-card class="chart-card q-mb-md">
          <div class="chart-header">
            <div class="chart-title">{{ chartTitle }}</div>
            <div class="chart-unit">Đơn vị: {{ yUnit }}</div>
          </div>

          <div v-if="measurements.length" class="chart-container">
            <div class="chart-y-axis">
              <span v-for="mark in yMarks" :key="mark">{{ mark }}</span>
            </div>

            <div class="chart-bars">
              <div
                v-for="m in measurements"
                :key="m. id || m.month"
                class="chart-bar-item"
              >
                <div class="bar-value-label">{{ formatNumber(valueOf(m)) }}</div>
                <div
                  class="bar-fill"
                  :class="chartType"
                  :style="{ height: barHeight(valueOf(m)) + '%' }"
                ></div>
                <div class="bar-month">{{ m.month }}T</div>
              </div>
            </div>
          </div>

          <div v-else class="chart-empty">
            <q-icon name="bar_chart" size="48px" />
            <p>Chưa có dữ liệu để hiển thị biểu đồ</p>
          </div>
        </q-card>
      </template>

      <!-- CHẾ ĐỘ LỊCH SỬ -->
      <template v-if="! loading && viewMode === 'history'">
        <section class="history-section">
          <div class="section-label">
            <q-icon name="timeline" size="16px" class="q-mr-xs" />
            <span>Lịch sử đo ({{ measurements.length }} lần)</span>
          </div>

          <div v-if="measurements. length" class="history-list">
            <q-card
              v-for="m in measurements"
              :key="m. id || m.month"
              class="history-item"
            >
              <div class="history-header">
                <div class="history-month">
                  <div class="month-badge">
                    <span class="month-num">{{ m.month }}</span>
                    <span class="month-text">tháng</span>
                  </div>
                </div>
                <div class="history-time">
                  <q-icon name="event" size="12px" />
                  {{ m.recordMonth }}/{{ m.recordYear }}
                </div>
                <q-badge
                  :color="statusColor(m.status)"
                  text-color="white"
                  class="history-status"
                >
                  {{ m.status || 'Chưa đánh giá' }}
                </q-badge>
              </div>

              <div class="history-stats">
                <div class="history-stat">
                  <q-icon name="height" size="16px" class="stat-icon-sm height" />
                  <span class="stat-val">{{ formatNumber(m.height) }} cm</span>
                </div>
                <div class="history-stat">
                  <q-icon name="fitness_center" size="16px" class="stat-icon-sm weight" />
                  <span class="stat-val">{{ formatNumber(m.weight) }} kg</span>
                </div>
                <div class="history-stat">
                  <q-icon name="speed" size="16px" class="stat-icon-sm bmi" />
                  <span class="stat-val">BMI {{ formatNumber(m.bmi) }}</span>
                </div>
              </div>

              <div class="history-extra">
                <div class="extra-chips">
                  <q-chip
                    v-if="m.bloodType"
                    dense
                    size="sm"
                    color="red-1"
                    text-color="red-8"
                    icon="bloodtype"
                  >
                    {{ m.bloodType }}
                  </q-chip>
                  <q-chip
                    dense
                    size="sm"
                    :color="m.knowsSwimming ? 'teal-1' : 'grey-3'"
                    :text-color="m.knowsSwimming ? 'teal-8' : 'grey-7'"
                    icon="pool"
                  >
                    {{ swimmingLabel(m.knowsSwimming) }}
                  </q-chip>
                </div>

                <div v-if="m. eyeIssue || m.dentalIssue" class="extra-issues">
                  <div v-if="m. eyeIssue" class="issue-item">
                    <q-icon name="visibility" size="14px" />
                    <span>Mắt: {{ m.eyeIssue }}</span>
                  </div>
                  <div v-if="m.dentalIssue" class="issue-item">
                    <q-icon name="sentiment_satisfied" size="14px" />
                    <span>Răng: {{ m. dentalIssue }}</span>
                  </div>
                </div>

                <div v-if="m. note" class="extra-note">
                  <q-icon name="notes" size="14px" />
                  <span>{{ m.note }}</span>
                </div>
              </div>
            </q-card>
          </div>

          <q-card v-else class="empty-history-card">
            <div class="empty-content">
              <q-icon name="history" size="48px" />
              <p>Chưa có lịch sử đo nào</p>
            </div>
          </q-card>
        </section>
      </template>

      <!-- NÚT GỬI THÔNG TIN Y TẾ -->
      <section class="action-section q-mt-lg q-mb-xl">
        <q-btn
          class="action-btn"
          unelevated
          rounded
          no-caps
          @click="showHealthForm = true"
        >
          <div class="btn-content">
            <div class="btn-icon">
              <q-icon name="add_circle" size="24px" />
            </div>
            <div class="btn-text">
              <span class="btn-title">Gửi thông tin y tế</span>
              <span class="btn-desc">Cập nhật tình trạng sức khỏe của bé</span>
            </div>
          </div>
          <q-icon name="chevron_right" size="20px" class="btn-arrow" />
        </q-btn>
      </section>
    </div>

    <!-- DIALOG FORM GỬI THÔNG TIN Y TẾ -->
    <q-dialog v-model="showHealthForm" position="bottom" full-width>
      <q-card class="health-form-card">
        <q-card-section class="form-header">
          <div class="form-header-content">
            <div class="form-header-icon">
              <q-icon name="medical_services" size="24px" />
            </div>
            <div>
              <div class="form-title">Gửi thông tin y tế</div>
              <div class="form-subtitle">Cập nhật cho bé {{ childName }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="showHealthForm = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="form-body">
          <q-form ref="healthFormRef" @submit. prevent="submitHealthInfo">
            <!-- Thông tin cơ bản -->
            <div class="form-section">
              <div class="form-section-title">
                <q-icon name="straighten" size="18px" />
                <span>Chỉ số cơ thể</span>
              </div>

              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-input
                    v-model.number="healthForm.height"
                    type="number"
                    label="Chiều cao (cm)"
                    outlined
                    dense
                    :rules="[(v) => ! v || v > 0 || 'Giá trị không hợp lệ']"
                  >
                    <template #prepend>
                      <q-icon name="height" color="blue-5" />
                    </template>
                  </q-input>
                </div>
                <div class="col-6">
                  <q-input
                    v-model.number="healthForm.weight"
                    type="number"
                    label="Cân nặng (kg)"
                    outlined
                    dense
                    :rules="[(v) => !v || v > 0 || 'Giá trị không hợp lệ']"
                  >
                    <template #prepend>
                      <q-icon name="fitness_center" color="green-5" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Thông tin y tế -->
            <div class="form-section">
              <div class="form-section-title">
                <q-icon name="medical_information" size="18px" />
                <span>Thông tin y tế</span>
              </div>

              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-select
                    v-model="healthForm. bloodType"
                    :options="bloodTypeOptions"
                    label="Nhóm máu"
                    outlined
                    dense
                    emit-value
                    map-options
                  >
                    <template #prepend>
                      <q-icon name="bloodtype" color="red-5" />
                    </template>
                  </q-select>
                </div>
                <div class="col-6">
                  <q-select
                    v-model="healthForm.knowsSwimming"
                    :options="swimmingOptions"
                    label="Biết bơi"
                    outlined
                    dense
                    emit-value
                    map-options
                  >
                    <template #prepend>
                      <q-icon name="pool" color="cyan-5" />
                    </template>
                  </q-select>
                </div>
              </div>

              <q-input
                v-model="healthForm.eyeIssue"
                label="Vấn đề về mắt (nếu có)"
                outlined
                dense
                class="q-mt-sm"
              >
                <template #prepend>
                  <q-icon name="visibility" color="purple-5" />
                </template>
              </q-input>

              <q-input
                v-model="healthForm.dentalIssue"
                label="Vấn đề về răng miệng (nếu có)"
                outlined
                dense
                class="q-mt-sm"
              >
                <template #prepend>
                  <q-icon name="sentiment_satisfied" color="orange-5" />
                </template>
              </q-input>
            </div>

            <!-- Tình trạng & Ghi chú -->
            <div class="form-section">
              <div class="form-section-title">
                <q-icon name="note_add" size="18px" />
                <span>Ghi chú thêm</span>
              </div>

              <q-select
                v-model="healthForm.status"
                :options="statusOptions"
                label="Tình trạng dinh dưỡng"
                outlined
                dense
                emit-value
                map-options
              >
                <template #prepend>
                  <q-icon name="monitor_heart" color="pink-5" />
                </template>
              </q-select>

              <q-input
                v-model="healthForm.note"
                type="textarea"
                label="Ghi chú của phụ huynh"
                outlined
                dense
                autogrow
                class="q-mt-sm"
                placeholder="Nhập các thông tin bổ sung về sức khỏe của bé..."
              >
                <template #prepend>
                  <q-icon name="notes" color="grey-6" />
                </template>
              </q-input>
            </div>

            <!-- Thông tin dị ứng / bệnh lý -->
            <div class="form-section">
              <div class="form-section-title">
                <q-icon name="warning" size="18px" />
                <span>Dị ứng & Bệnh lý (nếu có)</span>
              </div>

              <q-input
                v-model="healthForm.allergies"
                type="textarea"
                label="Dị ứng"
                outlined
                dense
                autogrow
                placeholder="VD: Dị ứng hải sản, đậu phộng..."
              >
                <template #prepend>
                  <q-icon name="do_not_touch" color="amber-7" />
                </template>
              </q-input>

              <q-input
                v-model="healthForm.medicalConditions"
                type="textarea"
                label="Bệnh lý đặc biệt"
                outlined
                dense
                autogrow
                class="q-mt-sm"
                placeholder="VD: Hen suyễn, tim mạch..."
              >
                <template #prepend>
                  <q-icon name="local_hospital" color="red-6" />
                </template>
              </q-input>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions class="form-actions">
          <q-btn
            flat
            label="Hủy"
            color="grey-7"
            no-caps
            @click="showHealthForm = false"
          />
          <q-btn
            unelevated
            label="Gửi thông tin"
            color="pink-5"
            text-color="white"
            no-caps
            :loading="submitting"
            @click="submitHealthInfo"
          >
            <template #loading>
              <q-spinner-dots />
            </template>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth";

const $q = useQuasar();
const auth = useAuthStore();

const loading = ref(false);
const submitting = ref(false);

const viewMode = ref("overview"); // 'overview' | 'chart' | 'history'
const chartType = ref("height"); // 'height' | 'weight' | 'bmi'

const childName = ref("");
const selectedStudentId = ref(null);
const children = ref([]);
const measurements = ref([]);

const showHealthForm = ref(false);
const healthFormRef = ref(null);
const healthForm = ref({
  height: null,
  weight: null,
  bloodType: null,
  knowsSwimming: null,
  eyeIssue: "",
  dentalIssue: "",
  status: null,
  note: "",
  allergies: "",
  medicalConditions: "",
});

/* ======= OPTIONS ======= */

const bloodTypeOptions = [
  { label: "Chưa xác định", value: null },
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "AB", value: "AB" },
  { label: "O", value: "O" },
];

const swimmingOptions = [
  { label: "Chưa xác định", value: null },
  { label: "Biết bơi", value: true },
  { label: "Chưa biết bơi", value: false },
];

const statusOptions = [
  { label: "Chưa đánh giá", value: null },
  { label: "Bình thường", value: "Bình thường" },
  { label: "Thiếu cân", value: "Thiếu cân" },
  { label: "Thừa cân", value: "Thừa cân" },
  { label: "Béo phì", value: "Béo phì" },
];

/* ======= COMPUTED ======= */

const latestRecord = computed(() => {
  if (!measurements.value.length) return null;
  return measurements.value[measurements.value.length - 1];
});

const chartTitle = computed(() => {
  if (chartType.value === "height") return "Biểu đồ chiều cao theo tháng tuổi";
  if (chartType. value === "weight") return "Biểu đồ cân nặng theo tháng tuổi";
  return "Biểu đồ BMI theo tháng tuổi";
});

const yUnit = computed(() => {
  if (chartType.value === "height") return "cm";
  if (chartType.value === "weight") return "kg";
  return "BMI";
});

const maxValue = computed(() => {
  if (! measurements.value.length) return 0;
  return Math.max(...measurements.value. map((m) => valueOf(m)));
});

const yMarks = computed(() => {
  const step = chartType.value === "bmi" ? 5 : 30;
  const max = chartType.value === "height" ? 150 : chartType.value === "weight" ? 60 : 35;
  const arr = [];
  for (let v = 0; v <= max; v += step) arr.push(v);
  return arr. reverse();
});

/* ======= HELPERS ======= */

function valueOf(m) {
  if (chartType.value === "height") return m. height || 0;
  if (chartType.value === "weight") return m.weight || 0;
  return m.bmi || 0;
}

function barHeight(v) {
  if (! maxValue.value) return 0;
  return Math.max(8, (v / maxValue. value) * 100);
}

function formatNumber(val) {
  if (val == null || Number.isNaN(Number(val))) return "--";
  return Number(val).toFixed(1);
}

function swimmingLabel(val) {
  if (val === true) return "Biết bơi";
  if (val === false) return "Chưa biết bơi";
  return "Chưa xác định";
}

function statusColor(status) {
  if (! status) return "grey-6";
  const s = status.toLowerCase();
  if (s.includes("bình")) return "green-6";
  if (s.includes("thiếu")) return "blue-6";
  if (s.includes("thừa")) return "orange-6";
  if (s.includes("béo")) return "red-6";
  return "grey-6";
}

function statusIcon(status) {
  if (!status) return "help_outline";
  const s = status.toLowerCase();
  if (s.includes("bình")) return "check_circle";
  if (s.includes("thiếu")) return "trending_down";
  if (s.includes("thừa")) return "trending_up";
  if (s. includes("béo")) return "warning";
  return "help_outline";
}

/* ======= LOAD DATA ======= */

function getStudentIdFromLocal() {
  const raw = localStorage.getItem("currentStudentId");
  if (! raw) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

async function resolveStudentIdFromParent() {
  const username = auth.user?. username || localStorage.getItem("username");
  if (! username) return null;

  const resParents = await api.get("/parents/all");
  const parents = resParents.data?. data || [];
  const parent = parents.find((p) => p. username === username);
  if (! parent) return null;

  const resChildren = await api. get(`/parents/${parent.id}/children`);
  const list = resChildren.data?.data || [];

  children.value = list. map((s) => ({
    id: s.studentId,
    name: s.fullName,
    className: s.className,
    studentCode: s.studentCode,
  }));

  if (! list.length) return null;

  const first = list[0];
  childName.value = first.fullName || "";
  return first.studentId;
}

function mapHealthRecordsToMeasurements(records) {
  if (!Array.isArray(records)) return [];
  return records
    .map((r) => ({
      id: r.id,
      month: r. ageInMonths ??  r.recordMonth ?? 0,
      height: r.heightCm != null ? Number(r.heightCm) : null,
      weight: r.weightKg != null ? Number(r.weightKg) : null,
      bmi: r. bmi != null ?  Number(r.bmi) : null,
      status: r.nutritionStatus || null,
      bloodType: r.bloodType || null,
      knowsSwimming: r.knowsSwimming,
      eyeIssue: r. eyeIssue || "",
      dentalIssue: r. dentalIssue || "",
      note: r.note || "",
      recordYear: r.recordYear,
      recordMonth: r.recordMonth,
      studentName: r.studentName,
    }))
    .sort((a, b) => a.month - b. month);
}

async function loadHealthRecords() {
  if (! selectedStudentId.value) return;

  try {
    loading. value = true;

    const res = await api.get(`/health-records/student/${selectedStudentId.value}`);
    const list = res.data?. data || [];

    const mapped = mapHealthRecordsToMeasurements(list);
    measurements.value = mapped;

    if (! childName.value && mapped.length && mapped[0].studentName) {
      childName.value = mapped[0].studentName;
    }
  } catch (e) {
    console.error("[Health] loadHealthRecords error", e);
    $q.notify({
      type: "negative",
      message: e?.response?.data?. message || "Không tải được hồ sơ sức khỏe.",
    });
  } finally {
    loading.value = false;
  }
}

function selectChild(s) {
  if (selectedStudentId.value === s.id) return;
  selectedStudentId.value = s.id;
  childName.value = s.name;
  localStorage.setItem("currentStudentId", String(s.id));
  loadHealthRecords();
}

/* ======= SUBMIT FORM ======= */

function resetHealthForm() {
  healthForm.value = {
    height: null,
    weight: null,
    bloodType: null,
    knowsSwimming: null,
    eyeIssue: "",
    dentalIssue: "",
    status: null,
    note: "",
    allergies: "",
    medicalConditions: "",
  };
}

async function submitHealthInfo() {
  // Validate form
  if (healthFormRef.value) {
    const ok = await healthFormRef.value. validate();
    if (!ok) return;
  }

  // Kiểm tra có ít nhất 1 thông tin
  const f = healthForm.value;
  const hasData =
    f.height ||
    f.weight ||
    f. bloodType ||
    f.knowsSwimming !== null ||
    f. eyeIssue ||
    f. dentalIssue ||
    f. status ||
    f.note ||
    f.allergies ||
    f.medicalConditions;

  if (!hasData) {
    $q.notify({
      type: "warning",
      message: "Vui lòng nhập ít nhất một thông tin sức khỏe.",
    });
    return;
  }

  try {
    submitting.value = true;

    // TODO: Gọi API gửi thông tin y tế
    // const payload = {
    //   studentId: selectedStudentId.value,
    //   heightCm: f. height,
    //   weightKg: f.weight,
    //   bloodType: f.bloodType,
    //   knowsSwimming: f.knowsSwimming,
    //   eyeIssue: f.eyeIssue,
    //   dentalIssue: f. dentalIssue,
    //   nutritionStatus: f. status,
    //   note: f. note,
    //   allergies: f.allergies,
    //   medicalConditions: f. medicalConditions,
    // };
    // await api.post("/health-records/parent-submit", payload);

    // Demo: hiển thị thông báo thành công
    await new Promise((resolve) => setTimeout(resolve, 1000));

    $q.notify({
      type: "positive",
      message: "Đã gửi thông tin y tế thành công! ",
      icon: "check_circle",
    });

    showHealthForm. value = false;
    resetHealthForm();

    // Reload data
    await loadHealthRecords();
  } catch (e) {
    console.error("[Health] submitHealthInfo error", e);
    $q.notify({
      type: "negative",
      message: e?.response?.data?. message || "Gửi thông tin thất bại.",
    });
  } finally {
    submitting.value = false;
  }
}

/* ======= INIT ======= */

onMounted(async () => {
  if (! auth.accessToken) {
    $q.notify({
      type: "warning",
      message: "Bạn chưa đăng nhập.",
    });
    return;
  }

  let sid = getStudentIdFromLocal();
  if (! sid) {
    sid = await resolveStudentIdFromParent();
  }

  if (! sid) {
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
  background: linear-gradient(180deg, #fff5f8 0%, #f0fdf4 50%, #f8fafc 100%);
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
  background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%);
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
  color: rgba(255, 255, 255, 0.9);
}

/* ===== SCROLL CONTAINER ===== */
.health-scroll {
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
  color: #6b7280;
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
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.12);
}

.child-card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, #d1fae5 0%, transparent 50%);
  opacity: 0. 7;
}

. child-card-content {
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
  background: linear-gradient(135deg, #10b981, #34d399);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0. 3);
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
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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

/* ===== LATEST SECTION ===== */
.latest-card {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.latest-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, #d1fae5, #ecfdf5);
}

.latest-month {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 14px;
  color: #fff;
}

.month-number {
  font-size: 24px;
  font-weight: 700;
}

.month-label {
  font-size: 11px;
  opacity: 0.9;
}

.latest-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #059669;
}

.latest-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

. stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-height . stat-icon {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #2563eb;
}

.stat-weight . stat-icon {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
}

. stat-bmi . stat-icon {
  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
  color: #db2777;
}

.stat-info {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

. latest-status {
  padding: 0 16px 16px;
  text-align: center;
}

.status-badge {
  font-size: 12px;
  padding: 6px 16px;
  border-radius: 999px;
}

.empty-latest-card,
.empty-history-card {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

. empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-content p {
  margin: 12px 0 0;
  font-size: 14px;
}

/* ===== MEDICAL SECTION ===== */
.medical-card {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0. 06);
  padding: 16px;
}

.medical-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.medical-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  background: #f8fafc;
}

.medical-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.medical-icon. blood {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
}

.medical-icon.swim {
  background: linear-gradient(135deg, #cffafe, #a5f3fc);
  color: #0891b2;
}

.medical-icon.eye {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  color: #7c3aed;
}

.medical-icon.dental {
  background: linear-gradient(135deg, #ffedd5, #fed7aa);
  color: #ea580c;
}

.medical-label {
  font-size: 11px;
  color: #9ca3af;
}

.medical-value {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

. medical-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #fefce8;
  font-size: 13px;
  color: #854d0e;
}

/* ===== CHART SECTION ===== */
.chart-tabs {
  display: flex;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
}

.chart-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px;
  border-radius: 10px;
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-tab.active {
  background: #fff;
  color: #1e293b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

. chart-card {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

. chart-unit {
  font-size: 12px;
  color: #6b7280;
}

.chart-container {
  display: flex;
  padding: 16px;
  min-height: 200px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 8px;
  border-right: 1px dashed #e5e7eb;
  font-size: 10px;
  color: #9ca3af;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 8px;
  padding-left: 12px;
}

.chart-bar-item {
  flex: 1;
  max-width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar-value-label {
  font-size: 10px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

. bar-fill {
  width: 100%;
  border-radius: 8px 8px 4px 4px;
  min-height: 8px;
  transition: height 0.3s ease;
}

.bar-fill.height {
  background: linear-gradient(180deg, #3b82f6, #60a5fa);
}

.bar-fill.weight {
  background: linear-gradient(180deg, #10b981, #34d399);
}

.bar-fill.bmi {
  background: linear-gradient(180deg, #ec4899, #f472b6);
}

. bar-month {
  font-size: 10px;
  color: #6b7280;
  margin-top: 6px;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.chart-empty p {
  margin: 12px 0 0;
  font-size: 13px;
}

/* ===== HISTORY SECTION ===== */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
}

.month-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 12px;
  color: #fff;
}

.month-num {
  font-size: 18px;
  font-weight: 700;
}

.month-text {
  font-size: 9px;
  opacity: 0.9;
}

. history-time {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.history-status {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
}

.history-stats {
  display: flex;
  justify-content: space-around;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.history-stat {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-icon-sm {
  padding: 4px;
  border-radius: 6px;
}

.stat-icon-sm. height {
  background: #dbeafe;
  color: #2563eb;
}

.stat-icon-sm.weight {
  background: #d1fae5;
  color: #059669;
}

.stat-icon-sm.bmi {
  background: #fce7f3;
  color: #db2777;
}

.stat-val {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

. history-extra {
  padding: 12px 16px;
}

.extra-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.extra-issues {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.issue-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.extra-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px;
  border-radius: 10px;
  background: #fefce8;
  font-size: 12px;
  color: #854d0e;
}

/* ===== ACTION BUTTON ===== */
. action-btn {
  width: 100%;
  padding: 16px 20px;
  border-radius: 20px;
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0. 3);
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

/* ===== HEALTH FORM DIALOG ===== */
.health-form-card {
  border-radius: 24px 24px 0 0;
  max-height: 85vh;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, #d1fae5, #ecfdf5);
}

.form-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

. form-subtitle {
  font-size: 12px;
  color: #6b7280;
}

.form-body {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
}

. form-section {
  margin-bottom: 20px;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.form-section-title . q-icon {
  color: #10b981;
}

.form-actions {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 380px) {
  .latest-stats {
    flex-wrap: wrap;
    gap: 12px;
  }

  .stat-item {
    flex: 1 1 30%;
  }

  .medical-grid {
    grid-template-columns: 1fr;
  }
}
</style>
