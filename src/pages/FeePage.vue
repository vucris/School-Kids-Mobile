<template>
  <q-page class="fee-page">
    <!-- HEADER GRADIENT -->
    <div class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="header-icon">
          <q-icon name="account_balance_wallet" size="28px" />
        </div>
        <div class="header-text">
          <h1>Học phí</h1>
          <p>Xem thông tin và nộp minh chứng thanh toán</p>
        </div>
      </div>
    </div>

    <div class="fee-scroll q-pa-md">
      <!-- CHỌN BÉ -->
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
                v-for="c in children"
                :key="c.id"
                class="child-chip"
                :class="{ active: c.id === selectedStudentId }"
                @click="selectedStudentId = c.id"
              >
                <div class="child-chip-avatar">
                  <q-icon name="face" size="18px" />
                </div>
                <span>{{ c.name }}</span>
              </div>
            </div>
          </div>
        </q-card>
      </section>

      <!-- THÔNG TIN BÉ ĐANG CHỌN -->
      <section v-if="currentChild" class="current-child q-mb-md">
        <q-card class="info-card">
          <div class="row items-center q-pa-sm">
            <q-avatar size="44px" class="child-avatar q-mr-sm">
              <q-icon name="school" size="24px" color="amber-7" />
            </q-avatar>
            <div class="col">
              <div class="text-subtitle2 text-weight-semibold">
                {{ currentChild.name }}
              </div>
              <div class="text-caption text-grey-6">
                {{ currentChild.className }} • {{ currentChild.studentCode }}
              </div>
            </div>
          </div>
        </q-card>
      </section>

      <!-- LỌC THEO TRẠNG THÁI -->
      <section class="filter-section q-mb-md">
        <div class="filter-scroll">
          <div
            v-for="opt in statusOptions"
            :key="opt.value"
            class="filter-chip"
            :class="{ active: statusFilter === opt.value }"
            @click="statusFilter = opt.value"
          >
            <q-icon v-if="opt.icon" :name="opt.icon" size="14px" />
            <span>{{ opt.label }}</span>
            <span v-if="getStatusCount(opt.value) > 0" class="filter-count">
              {{ getStatusCount(opt.value) }}
            </span>
          </div>
        </div>
      </section>

      <!-- TỔNG QUAN -->
      <section v-if="!loading && filteredFees.length" class="summary-section q-mb-md">
        <div class="summary-grid">
          <div class="summary-item total">
            <div class="summary-icon">
              <q-icon name="receipt_long" size="20px" />
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ formatCurrency(totalAmount) }}đ</div>
              <div class="summary-label">Tổng học phí</div>
            </div>
          </div>
          <div class="summary-item paid">
            <div class="summary-icon">
              <q-icon name="check_circle" size="20px" />
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ formatCurrency(paidAmount) }}đ</div>
              <div class="summary-label">Đã thanh toán</div>
            </div>
          </div>
          <div class="summary-item remaining">
            <div class="summary-icon">
              <q-icon name="pending" size="20px" />
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ formatCurrency(remainingAmount) }}đ</div>
              <div class="summary-label">Còn lại</div>
            </div>
          </div>
        </div>
      </section>

      <!-- LOADING -->
      <q-card v-if="loading" flat class="loading-card q-pa-lg q-mb-md">
        <div class="loading-content">
          <q-spinner-dots size="48px" color="amber-6" />
          <p class="q-mt-md text-grey-6">Đang tải thông tin học phí...</p>
        </div>
      </q-card>

      <!-- KHÔNG DỮ LIỆU -->
      <q-card v-else-if="!filteredFees.length" class="empty-card q-mb-md">
        <div class="empty-content">
          <div class="empty-icon">
            <q-icon name="account_balance_wallet" size="48px" />
          </div>
          <div class="empty-text">
            <strong>Chưa có học phí</strong>
            <p>Không tìm thấy thông tin học phí phù hợp.</p>
          </div>
        </div>
      </q-card>

      <!-- DANH SÁCH HỌC PHÍ -->
      <section v-else class="fees-list">
        <q-card v-for="fee in filteredFees" :key="fee.id" class="fee-card q-mb-md">
          <!-- Header -->
          <div class="fee-header">
            <div class="fee-period">
              <q-icon name="calendar_month" size="18px" />
              <span>{{ fee.semester }} - {{ fee.feeYear }}</span>
            </div>
            <div class="fee-status" :class="getStatusClass(fee.status)">
              <q-icon :name="getStatusIcon(fee.status)" size="14px" />
              <span>{{ statusText(fee.status) }}</span>
            </div>
          </div>

          <!-- Body -->
          <div class="fee-body">
            <!-- Amounts -->
            <div class="amount-grid">
              <div class="amount-item">
                <div class="amount-label">Tổng học phí</div>
                <div class="amount-value total">
                  {{ formatCurrency(fee.totalAmount) }}đ
                </div>
              </div>
              <div class="amount-item">
                <div class="amount-label">Đã đóng</div>
                <div class="amount-value paid">{{ formatCurrency(fee.paidAmount) }}đ</div>
              </div>
              <div class="amount-item">
                <div class="amount-label">Còn lại</div>
                <div class="amount-value remaining">
                  {{ formatCurrency(fee.remainingAmount) }}đ
                </div>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="payment-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: getProgressPercent(fee) + '%' }"
                ></div>
              </div>
              <div class="progress-text">
                {{ getProgressPercent(fee) }}% đã thanh toán
              </div>
            </div>

            <!-- Dates -->
            <div class="fee-dates">
              <div class="date-item">
                <q-icon name="event" size="14px" />
                <span
                  >Hạn đóng: <strong>{{ formatDate(fee.dueDate) }}</strong></span
                >
              </div>
              <div v-if="fee.paidDate" class="date-item paid">
                <q-icon name="check_circle" size="14px" />
                <span>Đã thanh toán: {{ formatDate(fee.paidDate) }}</span>
              </div>
            </div>

            <!-- Status messages -->
            <div
              v-if="fee.status === 'WAITING_VERIFICATION'"
              class="status-message waiting"
            >
              <q-icon name="hourglass_empty" size="16px" />
              <span
                >Đã gửi minh chứng lúc {{ formatDateTime(fee.submittedAt) }} - đang chờ
                xác nhận</span
              >
            </div>
            <div v-else-if="fee.status === 'REJECTED'" class="status-message rejected">
              <q-icon name="error" size="16px" />
              <span
                >Minh chứng bị từ chối:
                {{ fee.verificationNote || "Không có ghi chú" }}</span
              >
            </div>
            <div v-else-if="fee.status === 'OVERDUE'" class="status-message overdue">
              <q-icon name="warning" size="16px" />
              <span>Đã quá hạn thanh toán! </span>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="canSubmitProof(fee)" class="fee-actions">
            <button class="action-btn primary" @click="openProofDialog(fee)">
              <q-icon name="upload_file" size="18px" />
              <span>Nộp minh chứng</span>
            </button>
          </div>
        </q-card>
      </section>
    </div>

    <!-- DIALOG NỘP MINH CHỨNG -->
    <q-dialog v-model="proofDialog.show" position="bottom">
      <q-card class="proof-dialog-card">
        <div class="dialog-header">
          <div class="dialog-icon">
            <q-icon name="upload_file" size="24px" />
          </div>
          <div class="dialog-title">
            <h3>Nộp minh chứng</h3>
            <p>{{ proofDialog.feeTitle }}</p>
          </div>
          <q-btn flat round dense icon="close" @click="closeProofDialog" />
        </div>

        <q-separator />

        <div class="dialog-body">
          <!-- File upload -->
          <div class="upload-area" @click="triggerFileInput">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden-input"
              @change="onFileSelect"
            />
            <div v-if="!proofDialog.file" class="upload-placeholder">
              <q-icon name="cloud_upload" size="48px" />
              <p>Chạm để chọn ảnh hóa đơn / chuyển khoản</p>
              <span>JPG, PNG - Tối đa 5MB</span>
            </div>
            <div v-else class="upload-preview">
              <img :src="previewUrl" alt="preview" />
              <button class="remove-btn" @click.stop="removeFile">
                <q-icon name="close" size="16px" />
              </button>
            </div>
          </div>

          <!-- Note -->
          <div class="note-field">
            <label>Ghi chú (không bắt buộc)</label>
            <textarea
              v-model="proofDialog.note"
              placeholder="Nhập ghi chú nếu cần..."
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="dialog-actions">
          <button class="action-btn secondary" @click="closeProofDialog">Hủy</button>
          <button
            class="action-btn primary"
            :disabled="!proofDialog.file || proofDialog.sending"
            @click="submitProof"
          >
            <q-spinner-dots v-if="proofDialog.sending" size="20px" color="white" />
            <template v-else>
              <q-icon name="send" size="18px" />
              <span>Gửi minh chứng</span>
            </template>
          </button>
        </div>
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
const fees = ref([]);
const fileInput = ref(null);

// ====== CHỌN BÉ ======
const selectedStudentId = ref(null);

const children = computed(() => {
  const map = new Map();
  fees.value.forEach((f) => {
    if (! map.has(f.studentId)) {
      map.set(f.studentId, {
        id: f.studentId,
        name: f.studentName,
        className: f.className,
        studentCode: f.studentCode,
      });
    }
  });
  return Array.from(map. values());
});

const currentChild = computed(() =>
  children.value.find((c) => c. id === selectedStudentId.value) || null
);

// ====== LỌC THEO TRẠNG THÁI ======
const statusFilter = ref("ALL");

const statusOptions = [
  { label: "Tất cả", value: "ALL", icon: "list" },
  { label: "Chưa đóng", value: "PENDING", icon: "schedule" },
  { label: "Một phần", value: "PARTIAL", icon: "pie_chart" },
  { label: "Quá hạn", value: "OVERDUE", icon: "warning" },
  { label: "Chờ xác nhận", value: "WAITING_VERIFICATION", icon: "hourglass_empty" },
  { label: "Đã đóng", value: "PAID", icon: "check_circle" },
];

const filteredFees = computed(() =>
  fees.value.filter((f) => {
    if (selectedStudentId.value && f.studentId !== selectedStudentId. value) return false;
    if (statusFilter.value !== "ALL" && f.status !== statusFilter.value) return false;
    return true;
  })
);

function getStatusCount(status) {
  if (status === "ALL") return fees.value.filter((f) =>
    ! selectedStudentId.value || f.studentId === selectedStudentId.value
  ). length;
  return fees.value.filter((f) =>
    f.status === status && (! selectedStudentId. value || f.studentId === selectedStudentId.value)
  ).length;
}

// ====== TỔNG QUAN ======
const totalAmount = computed(() =>
  filteredFees.value.reduce((sum, f) => sum + (f.totalAmount || 0), 0)
);

const paidAmount = computed(() =>
  filteredFees.value. reduce((sum, f) => sum + (f.paidAmount || 0), 0)
);

const remainingAmount = computed(() =>
  filteredFees. value.reduce((sum, f) => sum + (f.remainingAmount || 0), 0)
);

function getProgressPercent(fee) {
  if (! fee.totalAmount) return 0;
  return Math.round((fee. paidAmount / fee.totalAmount) * 100);
}

// ====== DIALOG ======
const proofDialog = ref({
  show: false,
  feeId: null,
  feeTitle: "",
  file: null,
  note: "",
  sending: false,
});

const previewUrl = computed(() => {
  if (!proofDialog. value.file) return null;
  return URL.createObjectURL(proofDialog.value.file);
});

function openProofDialog(fee) {
  proofDialog.value = {
    show: true,
    feeId: fee. id,
    feeTitle: `${fee.semester} - ${fee. feeYear}`,
    file: null,
    note: "",
    sending: false,
  };
}

function closeProofDialog() {
  proofDialog.value. show = false;
}

function triggerFileInput() {
  fileInput.value?. click();
}

function onFileSelect(e) {
  const file = e.target.files?.[0];
  if (file) {
    proofDialog.value. file = file;
  }
}

function removeFile() {
  proofDialog. value.file = null;
  if (fileInput.value) fileInput.value.value = "";
}

// ====== HELPERS ======
function statusText(status) {
  const map = {
    PENDING: "Chưa thanh toán",
    PAID: "Đã thanh toán",
    PARTIAL: "Thanh toán một phần",
    OVERDUE: "Quá hạn",
    WAITING_VERIFICATION: "Chờ xác nhận",
    REJECTED: "Bị từ chối",
  };
  return map[status] || status;
}

function getStatusClass(status) {
  const map = {
    PENDING: "status-pending",
    PAID: "status-paid",
    PARTIAL: "status-partial",
    OVERDUE: "status-overdue",
    WAITING_VERIFICATION: "status-waiting",
    REJECTED: "status-rejected",
  };
  return map[status] || "";
}

function getStatusIcon(status) {
  const map = {
    PENDING: "schedule",
    PAID: "check_circle",
    PARTIAL: "pie_chart",
    OVERDUE: "warning",
    WAITING_VERIFICATION: "hourglass_empty",
    REJECTED: "cancel",
  };
  return map[status] || "help";
}

function formatCurrency(v) {
  if (v == null) return "0";
  return Number(v).toLocaleString("vi-VN");
}

function formatDate(dateStr) {
  if (!dateStr) return "--/--/----";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${dd}/${mm}/${yyyy}`;
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("vi-VN");
}

function formatDateTime(str) {
  if (!str) return "";
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  return d.toLocaleString("vi-VN");
}

function canSubmitProof(fee) {
  return ["PENDING", "OVERDUE", "REJECTED"].includes(fee. status);
}

// ====== API ======
async function loadMyFees() {
  try {
    loading. value = true;
    const res = await api.get("/fees/my-fees");
    const list = res.data?. data || [];
    fees.value = list;

    if (list.length && !selectedStudentId.value) {
      selectedStudentId.value = list[0].studentId;
    }
  } catch (e) {
    console.error("[Fees] loadMyFees error", e);
    $q.notify({
      type: "negative",
      message: e?.response?.data?. message || "Không lấy được thông tin học phí.",
    });
  } finally {
    loading.value = false;
  }
}

async function submitProof() {
  if (! proofDialog.value.feeId || !proofDialog.value. file) return;

  try {
    proofDialog.value.sending = true;

    const formData = new FormData();
    formData. append("feeId", proofDialog. value.feeId);
    formData.append("proofImage", proofDialog.value.file);
    if (proofDialog.value. note) {
      formData.append("note", proofDialog.value.note);
    }

    await api.post("/fees/proof", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    $q.notify({
      type: "positive",
      message: "Đã gửi minh chứng thành công! ",
      icon: "check_circle",
    });

    closeProofDialog();
    await loadMyFees();
  } catch (e) {
    console.error("[Fees] submitProof error", e);
    $q.notify({
      type: "negative",
      message: e?.response?.data?.message || "Không gửi được minh chứng.",
    });
  } finally {
    proofDialog.value.sending = false;
  }
}

onMounted(() => {
  if (!auth.accessToken) {
    $q. notify({ type: "warning", message: "Bạn chưa đăng nhập." });
    return;
  }
  loadMyFees();
});
</script>

<style scoped>
. fee-page {
  background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 30%, #f8fafc 100%);
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
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%);
  border-radius: 0 0 32px 32px;
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
}

.header-text h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

. header-text p {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

/* ===== SCROLL ===== */
. fee-scroll {
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
  color: #92400e;
  margin-bottom: 10px;
}

/* ===== CHILD SECTION ===== */
.child-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);
}

.child-card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, #fef3c7 0%, transparent 50%);
}

.child-card-content {
  position: relative;
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
  border: 2px solid #e5e7eb;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
  transition: all 0 2s;
}

.child-chip. active {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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

/* ===== INFO CARD ===== */
.info-card {
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.child-avatar {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

/* ===== FILTER ===== */
. filter-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-chip. active {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  border-color: transparent;
  color: #fff;
}

. filter-count {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 10px;
}

/* ===== SUMMARY ===== */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.summary-item {
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

. summary-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
}

.summary-item. total . summary-icon {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #2563eb;
}

.summary-item.paid .summary-icon {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
}

.summary-item. remaining .summary-icon {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
}

.summary-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.summary-label {
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
}

/* ===== LOADING & EMPTY ===== */
.loading-card,
.empty-card {
  border-radius: 20px;
  background: #fff;
}

.loading-content,
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  margin-bottom: 16px;
}

.empty-text {
  text-align: center;
}

. empty-text strong {
  font-size: 15px;
  color: #374151;
}

. empty-text p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #9ca3af;
}

/* ===== FEE CARD ===== */
.fee-card {
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0 06);
  overflow: hidden;
}

.fee-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
}

.fee-period {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
}

.fee-status {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}
.status-paid {
  background: #d1fae5;
  color: #059669;
}
.status-partial {
  background: #fef3c7;
  color: #b45309;
}
. status-overdue {
  background: #fee2e2;
  color: #dc2626;
}
.status-waiting {
  background: #dbeafe;
  color: #2563eb;
}
.status-rejected {
  background: #f3f4f6;
  color: #6b7280;
}

.fee-body {
  padding: 16px;
}

/* Amount grid */
.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}

.amount-item {
  text-align: center;
}

.amount-label {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.amount-value {
  font-size: 14px;
  font-weight: 700;
}

.amount-value.total {
  color: #1e293b;
}
.amount-value. paid {
  color: #059669;
}
.amount-value. remaining {
  color: #dc2626;
}

/* Progress */
.payment-progress {
  margin-bottom: 14px;
}

.progress-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 999px;
  transition: width 0 3s ease;
}

.progress-text {
  font-size: 11px;
  color: #64748b;
  text-align: right;
  margin-top: 4px;
}

/* Dates */
.fee-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.date-item.paid {
  color: #059669;
}

/* Status messages */
.status-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  margin-top: 10px;
}

.status-message.waiting {
  background: #eff6ff;
  color: #1d4ed8;
}

.status-message.rejected {
  background: #fef2f2;
  color: #dc2626;
}

. status-message.overdue {
  background: #fef2f2;
  color: #dc2626;
}

/* Actions */
.fee-actions {
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.action-btn. primary {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #fff;
}

.action-btn.primary:hover {
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0 3);
}

.action-btn. secondary {
  background: #f1f5f9;
  color: #64748b;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== PROOF DIALOG ===== */
.proof-dialog-card {
  width: 100%;
  max-width: 400px;
  border-radius: 24px 24px 0 0;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.dialog-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
}

.dialog-title {
  flex: 1;
}

.dialog-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.dialog-title p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #64748b;
}

. dialog-body {
  padding: 16px;
}

/* Upload area */
.upload-area {
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.upload-area:hover {
  border-color: #f59e0b;
  background: #fffbeb;
}

.hidden-input {
  display: none;
}

. upload-placeholder {
  color: #9ca3af;
}

. upload-placeholder p {
  margin: 12px 0 4px;
  font-size: 14px;
  color: #64748b;
}

. upload-placeholder span {
  font-size: 12px;
}

. upload-preview {
  position: relative;
}

.upload-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 12px;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0 6);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Note field */
.note-field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.note-field textarea {
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  resize: none;
  transition: border-color 0 2s;
}

.note-field textarea:focus {
  outline: none;
  border-color: #f59e0b;
}

. dialog-actions {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #f1f5f9;
}

. dialog-actions . action-btn {
  flex: 1;
  justify-content: center;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 380px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .amount-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .amount-item {
    display: flex;
    justify-content: space-between;
    text-align: left;
  }
}
</style>
