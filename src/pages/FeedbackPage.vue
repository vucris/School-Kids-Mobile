<template>
  <q-page class="feedback-page">
    <!-- HEADER GRADIENT -->
    <div class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          class="header-back-btn"
          @click="goBack"
        />
        <div class="header-info">
          <div class="header-icon">
            <q-icon name="mail_outline" size="28px" />
          </div>
          <div class="header-text">
            <h1>Hòm thư góp ý</h1>
            <p>Gửi phản hồi tới giáo viên & nhà trường</p>
          </div>
        </div>
        <q-avatar size="40px" class="header-avatar">
          <img :src="avatarUrl" alt="avatar" />
        </q-avatar>
      </div>
    </div>

    <div class="feedback-scroll q-pa-md">
      <!-- CHỌN BÉ -->
      <section v-if="children.length" class="child-section q-mb-md">
        <div class="section-label">
          <q-icon name="child_care" size="16px" class="q-mr-xs" />
          <span>Chọn bé cần gửi phản hồi</span>
        </div>

        <q-card class="child-card">
          <div class="child-card-bg"></div>
          <div class="child-card-content">
            <div class="children-list">
              <div
                v-for="s in children"
                :key="s.id"
                class="child-chip"
                :class="{ active: s.id === selectedChildId }"
                @click="selectChild(s)"
              >
                <div class="child-chip-avatar">
                  <q-icon name="face" size="18px" />
                </div>
                <span>{{ s.name }}</span>
              </div>
            </div>

            <div v-if="currentChild" class="child-info q-mt-sm">
              <div class="info-badge class-badge">
                <q-icon name="school" size="12px" />
                {{ currentChild.className || "---" }}
              </div>
              <div class="info-badge code-badge">
                <q-icon name="badge" size="12px" />
                {{ currentChild.studentCode || "---" }}
              </div>
            </div>
          </div>
        </q-card>
      </section>

      <!-- CHƯA CÓ CON -->
      <q-banner v-else class="empty-child-banner q-mb-md" rounded>
        <template #avatar>
          <div class="empty-icon">
            <q-icon name="child_care" size="28px" />
          </div>
        </template>
        <div class="empty-text">
          <strong>Chưa có thông tin</strong>
          <p>Chưa tìm thấy học sinh gắn với tài khoản phụ huynh.</p>
        </div>
      </q-banner>

      <!-- FORM GỬI PHẢN HỒI -->
      <section class="form-section q-mb-lg">
        <div class="section-label">
          <q-icon name="edit_note" size="16px" class="q-mr-xs" />
          <span>Viết góp ý</span>
        </div>

        <q-form ref="feedbackFormRef" @submit.prevent="submitFeedback">
          <q-card class="feedback-form-card">
            <!-- Thông tin người gửi -->
            <div class="sender-info">
              <div class="sender-avatar">
                <q-icon name="person" size="24px" />
              </div>
              <div class="sender-details">
                <div class="sender-name">{{ form.parentName || "Phụ huynh" }}</div>
                <div class="sender-time">
                  <q-icon name="schedule" size="12px" />
                  {{ dateLabel }} • {{ formTime }}
                </div>
              </div>
            </div>

            <!-- Nội dung góp ý -->
            <div class="form-content">
              <q-input
                v-model="form.content"
                type="textarea"
                placeholder="Nhập nội dung góp ý, phản hồi hoặc thắc mắc của bạn..."
                autogrow
                :counter="500"
                :maxlength="500"
                borderless
                class="content-input"
                lazy-rules="ondemand"
                :rules="[
                  (val) => (!!val && val.trim().length > 0) || 'Vui lòng nhập nội dung',
                  (val) => !val || val.length <= 500 || 'Tối đa 500 ký tự',
                ]"
              />
            </div>

            <!-- Gợi ý -->
            <div class="form-hints">
              <div class="hint-item">
                <q-icon name="lightbulb" size="14px" />
                <span>Chia sẻ góp ý về hoạt động học tập của bé</span>
              </div>
              <div class="hint-item">
                <q-icon name="help_outline" size="14px" />
                <span>Đặt câu hỏi cho giáo viên chủ nhiệm</span>
              </div>
              <div class="hint-item">
                <q-icon name="favorite" size="14px" />
                <span>Gửi lời cảm ơn đến nhà trường</span>
              </div>
            </div>

            <!-- Nút gửi -->
            <div class="form-actions">
              <q-btn
                type="submit"
                unelevated
                rounded
                no-caps
                class="submit-btn"
                :loading="submitting"
                :disable="!form.content?.trim()"
              >
                <q-icon name="send" size="18px" class="q-mr-sm" />
                Gửi phản hồi
              </q-btn>
            </div>
          </q-card>
        </q-form>
      </section>

      <!-- LỊCH SỬ GÓP Ý -->
      <section class="history-section">
        <div class="section-header">
          <div class="section-label">
            <q-icon name="history" size="16px" class="q-mr-xs" />
            <span>Lịch sử góp ý</span>
          </div>
          <q-btn
            flat
            dense
            round
            icon="refresh"
            size="sm"
            class="refresh-btn"
            @click="loadFeedbackHistory"
          />
        </div>

        <!-- Loading -->
        <q-card v-if="historyLoading" flat class="loading-card q-pa-lg">
          <div class="loading-content">
            <q-spinner-dots size="40px" color="pink-4" />
            <p class="q-mt-md text-grey-6">Đang tải lịch sử...</p>
          </div>
        </q-card>

        <!-- Empty -->
        <q-card v-else-if="!feedbackHistory.length" class="empty-history-card">
          <div class="empty-history-content">
            <div class="empty-history-icon">
              <q-icon name="inbox" size="48px" />
            </div>
            <div class="empty-history-text">
              <strong>Chưa có góp ý nào</strong>
              <p>Hãy gửi góp ý đầu tiên cho giáo viên nhé!</p>
            </div>
          </div>
        </q-card>

        <!-- Danh sách -->
        <div v-else class="history-list">
          <q-card v-for="fb in feedbackHistory" :key="fb.id" class="history-item">
            <div class="history-header">
              <div class="history-child">
                <q-avatar size="32px" class="history-avatar">
                  <q-icon name="face" size="20px" />
                </q-avatar>
                <div class="history-child-info">
                  <div class="history-child-name">{{ fb.studentName }}</div>
                  <div class="history-child-class">{{ fb.className }}</div>
                </div>
              </div>
              <q-badge
                :color="statusColor(fb.status)"
                text-color="white"
                class="status-badge"
              >
                <q-icon :name="statusIcon(fb.status)" size="12px" class="q-mr-xs" />
                {{ statusLabel(fb.status) }}
              </q-badge>
            </div>

            <div class="history-content">
              {{ fb.content }}
            </div>

            <div class="history-footer">
              <div class="history-time">
                <q-icon name="schedule" size="12px" />
                {{ formatHistoryDateTime(fb.messageDate, fb.messageTime) }}
              </div>
            </div>
          </q-card>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth";
import avatarDefault from "src/assets/avatar-default.jpg";

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();

const avatarUrl = avatarDefault;

const loading = ref(false);
const submitting = ref(false);

const feedbackFormRef = ref(null);

const parentId = ref(null);
const children = ref([]);
const selectedChildId = ref(null);

const form = ref({
  studentCode: "",
  parentName: "",
  content: "",
});

const formDate = ref("");
const formTime = ref("");
const dateLabel = ref("");

const historyLoading = ref(false);
const feedbackHistory = ref([]);
const allFeedbackHistory = ref([]);

const currentChild = computed(
  () => children.value.find((c) => c.id === selectedChildId.value) || null
);

/* ======= HELPERS ======= */

function formatDateLabel(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function initDefaultDateTime() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");

  formDate.value = `${yyyy}-${mm}-${dd}`;
  formTime.value = `${hh}:${mi}`;
  dateLabel.value = formatDateLabel(formDate.value);
}

function formatHistoryDateTime(dateStr, timeStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const time =
    timeStr ||
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${dd}/${mm}/${yyyy} lúc ${time}`;
}

function normalizeStatus(status) {
  return (status || "PENDING").toUpperCase();
}

function statusLabel(status) {
  const s = normalizeStatus(status);
  if (s === "PENDING") return "Chờ xử lý";
  if (s === "IN_PROGRESS" || s === "PROCESSING") return "Đang xử lý";
  if (s === "RESOLVED" || s === "DONE") return "Đã phản hồi";
  return status || "Khác";
}

function statusColor(status) {
  const s = normalizeStatus(status);
  if (s === "PENDING") return "amber-7";
  if (s === "IN_PROGRESS" || s === "PROCESSING") return "blue-6";
  if (s === "RESOLVED" || s === "DONE") return "green-6";
  return "grey-6";
}

function statusIcon(status) {
  const s = normalizeStatus(status);
  if (s === "PENDING") return "hourglass_empty";
  if (s === "IN_PROGRESS" || s === "PROCESSING") return "autorenew";
  if (s === "RESOLVED" || s === "DONE") return "check_circle";
  return "help_outline";
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
    form.value.parentName = parent.fullName || "";

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
      form.value.studentCode = children.value[0].studentCode;
    }
  } catch (e) {
    console.error("[Feedback] loadParentAndChildren error", e);
    $q.notify({
      type: "negative",
      message: "Không lấy được thông tin phụ huynh / con.",
    });
  } finally {
    loading.value = false;
  }
}

function selectChild(s) {
  if (!s) return;
  selectedChildId.value = s.id;
  form.value.studentCode = s.studentCode;

  feedbackHistory.value = allFeedbackHistory.value.filter((fb) => fb.studentId === s.id);
}

async function loadFeedbackHistory() {
  try {
    historyLoading.value = true;

    const res = await api.get("/feedbacks/my-feedbacks", {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });

    const apiResp = res.data || {};
    const list = apiResp.data || [];

    list.sort(
      (a, b) =>
        new Date(b.messageDate || b.createdAt) - new Date(a.messageDate || a.createdAt)
    );

    allFeedbackHistory.value = list;
    if (selectedChildId.value) {
      feedbackHistory.value = list.filter((fb) => fb.studentId === selectedChildId.value);
    } else {
      feedbackHistory.value = list;
    }
  } catch (e) {
    console.error("[Feedback] loadFeedbackHistory error", e);
    $q.notify({
      type: "negative",
      message: e?.response?.data?.message || "Không tải được lịch sử góp ý.",
    });
  } finally {
    historyLoading.value = false;
  }
}

async function submitFeedback() {
  if (!form.value.studentCode) {
    $q.notify({
      type: "warning",
      message: "Vui lòng chọn bé cần gửi phản hồi.",
    });
    return;
  }

  if (feedbackFormRef.value) {
    const ok = await feedbackFormRef.value.validate();
    if (!ok) return;
  }

  try {
    submitting.value = true;

    const messageDate = `${formDate.value}T${formTime.value}:00`;

    const payload = {
      studentCode: form.value.studentCode,
      parentName: form.value.parentName || null,
      messageDate,
      messageTime: formTime.value,
      content: form.value.content.trim(),
      status: "PENDING",
    };

    await api.post("/feedbacks/create", payload, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });

    $q.notify({
      type: "positive",
      message: "Gửi phản hồi thành công!  Cảm ơn bạn đã góp ý.",
      icon: "check_circle",
    });

    if (feedbackFormRef.value) {
      feedbackFormRef.value.resetValidation();
    }
    form.value.content = "";

    await loadFeedbackHistory();
  } catch (e) {
    console.error("[Feedback] submitFeedback error", e);
    $q.notify({
      type: "negative",
      message: e?.response?.data?.message || "Gửi phản hồi thất bại.",
    });
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.back();
}

onMounted(async () => {
  if (!auth.accessToken) {
    $q.notify({
      type: "warning",
      message: "Bạn chưa đăng nhập.",
    });
    return;
  }
  initDefaultDateTime();
  await loadParentAndChildren();
  await loadFeedbackHistory();
});
</script>

<style scoped>
.feedback-page {
  background: linear-gradient(180deg, #fff5f8 0%, #fef0f5 50%, #f8fafc 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}

/* ===== HEADER ===== */
.page-header {
  position: relative;
  padding: 16px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fb7185 100%);
  border-radius: 0 0 32px 32px;
}

.header-bg::before {
  content: "";
  position: absolute;
  top: -40%;
  right: -15%;
  width: 160px;
  height: 160px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 50%;
}

.header-bg::after {
  content: "";
  position: absolute;
  bottom: -20%;
  left: -8%;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-back-btn {
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
}

.header-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  backdrop-filter: blur(8px);
}

.header-text h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.header-text p {
  margin: 2px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}

. header-avatar {
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* ===== SCROLL CONTAINER ===== */
.feedback-scroll {
  max-width: 480px;
  margin: -8px auto 0;
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
}

.child-card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, #fce7f3 0%, transparent 50%),
    radial-gradient(circle at bottom right, #fdf2f8 0%, transparent 50%);
  opacity: 0 8;
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
  border-color: #f9a8d4;
  background: #fdf2f8;
}

.child-chip.active {
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

.child-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.info-badge {
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

.code-badge {
  background: linear-gradient(135deg, #e0e7ff, #ede9fe);
  color: #6366f1;
}

/* ===== EMPTY CHILD ===== */
. empty-child-banner {
  background: linear-gradient(135deg, #fef3c7, #fef9c3);
  border: 1px solid #fde68a;
}

.empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
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

/* ===== FEEDBACK FORM ===== */
.feedback-form-card {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #fdf2f8, #fce7f3);
}

.sender-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ec4899, #f472b6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.sender-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.sender-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.form-content {
  padding: 16px;
}

.content-input {
  font-size: 14px;
}

.content-input :deep(.q-field__control) {
  min-height: 120px;
}

.form-hints {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.hint-item . q-icon {
  color: #f9a8d4;
}

.form-actions {
  padding: 0 16px 16px;
}

.submit-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #ec4899, #f472b6);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0 3);
}

.submit-btn:disabled {
  opacity: 0.6;
}

/* ===== HISTORY SECTION ===== */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.refresh-btn {
  color: #ec4899;
}

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

.empty-history-card {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

. empty-history-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  text-align: center;
}

. empty-history-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fce7f3, #fdf2f8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f9a8d4;
  margin-bottom: 16px;
}

.empty-history-text strong {
  font-size: 15px;
  color: #374151;
}

.empty-history-text p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #9ca3af;
}

. history-list {
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
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fdf2f8, #fce7f3);
}

.history-child {
  display: flex;
  align-items: center;
  gap: 10px;
}

.history-avatar {
  background: linear-gradient(135deg, #ec4899, #f472b6);
  color: #fff;
}

.history-child-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.history-child-class {
  font-size: 11px;
  color: #64748b;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
}

. history-content {
  padding: 14px 16px;
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
}

. history-footer {
  padding: 0 16px 14px;
}

.history-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #9ca3af;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 380px) {
  .header-text h1 {
    font-size: 18px;
  }

  .header-icon {
    width: 42px;
    height: 42px;
  }
}
</style>
