<template>
  <q-page class="feedback-page">
    <div class="q-pa-md q-pt-sm feedback-scroll">
      <!-- HEADER -->
      <div class="row items-center q-mb-md">
        <div class="col-auto">
          <q-btn flat round dense icon="arrow_back" @click="goBack" />
        </div>
        <div class="col text-center q-pr-md">
          <div class="text-subtitle1 text-weight-semibold">Hòm thư góp ý</div>
          <div class="text-caption text-grey-7">
            Gửi phản hồi tới giáo viên / nhà trường
          </div>
        </div>
        <div class="col-auto">
          <q-avatar size="36px">
            <img :src="avatarUrl" alt="avatar" />
          </q-avatar>
        </div>
      </div>

      <!-- CHỌN BÉ -->
      <q-card flat bordered class="q-mb-md child-card" v-if="children.length">
        <q-card-section class="q-pb-sm">
          <div class="text-caption text-grey-7 q-mb-xs">Chọn bé cần gửi phản hồi</div>
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

          <div v-if="currentChild" class="text-caption text-grey-7 q-mt-xs">
            Lớp {{ currentChild.className }} • Mã HS:
            <span class="text-weight-medium">{{ currentChild.studentCode }}</span>
          </div>
        </q-card-section>
      </q-card>

      <!-- CHƯA CÓ CON -->
      <q-banner v-else rounded class="bg-blue-1 text-blue-8 q-mb-md">
        <template #avatar>
          <q-icon name="child_care" />
        </template>
        Chưa tìm thấy thông tin học sinh gắn với tài khoản phụ huynh.
      </q-banner>

      <!-- FORM GỬI PHẢN HỒI -->
      <q-form
        ref="feedbackFormRef"
        @submit.prevent="submitFeedback"
        class="feedback-form"
      >
        <q-card class="feedback-card">
          <q-card-section class="q-pt-sm">
            <!-- TÊN PHỤ HUYNH -->
            <q-input
              v-model="form.parentName"
              label="Tên phụ huynh"
              dense
              readonly
              standout="bg-grey-2 text-grey-8"
              class="q-mb-sm"
            >
              <template #prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <!-- NGÀY & GIỜ (ĐÓNG BĂNG) -->
            <div class="row q-col-gutter-sm q-mb-sm">
              <div class="col-6">
                <q-input v-model="dateLabel" label="Ngày phản hồi" dense readonly disable>
                  <template #prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input v-model="formTime" label="Giờ" dense readonly disable>
                  <template #prepend>
                    <q-icon name="schedule" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- NỘI DUNG -->
            <q-input
              v-model="form.content"
              type="textarea"
              label="Nội dung phản hồi"
              autogrow
              :counter="500"
              :maxlength="500"
              lazy-rules="ondemand"
              :rules="[
                (val) => (!!val && val.trim().length > 0) || 'Vui lòng nhập nội dung',
                (val) => !val || val.length <= 500 || 'Tối đa 500 ký tự',
              ]"
            >
              <template #prepend>
                <q-icon name="chat" />
              </template>
            </q-input>

            <div class="text-caption text-grey-6 q-mt-xs">
              Hệ thống tự ghi lại ngày &amp; giờ gửi phản hồi. Bạn hãy chia sẻ góp ý, thắc
              mắc, hoặc thông tin cần trao đổi với giáo viên.
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn type="submit" color="primary" unelevated no-caps :loading="submitting">
              Gửi phản hồi
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-form>

      <!-- LỊCH SỬ GÓP Ý -->
      <section class="q-mt-lg">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle2 text-weight-medium">Lịch sử góp ý</div>
          <q-btn flat dense size="sm" icon="refresh" @click="loadFeedbackHistory" />
        </div>

        <q-card v-if="historyLoading" flat class="q-pa-md">
          <q-inner-loading showing>
            <q-spinner-dots size="28px" color="primary" />
          </q-inner-loading>
        </q-card>

        <q-banner
          v-else-if="!feedbackHistory.length"
          class="bg-grey-2 text-grey-8"
          rounded
        >
          <template #avatar>
            <q-icon name="inbox" />
          </template>
          Bạn chưa có góp ý nào được ghi nhận.
        </q-banner>

        <div v-else class="column q-gutter-sm q-mb-md">
          <q-card
            v-for="fb in feedbackHistory"
            :key="fb.id"
            flat
            bordered
            class="feedback-history-card"
          >
            <q-card-section class="q-pb-xs">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-body2 text-weight-medium">
                  {{ fb.studentName }} • {{ fb.className }}
                </div>
                <q-chip
                  dense
                  square
                  :color="statusColor(fb.status)"
                  text-color="white"
                  class="text-caption"
                >
                  {{ statusLabel(fb.status) }}
                </q-chip>
              </div>

              <div class="text-caption text-grey-6 q-mb-xs">
                {{ formatHistoryDateTime(fb.messageDate, fb.messageTime) }}
              </div>

              <div class="text-body2">
                {{ fb.content }}
              </div>
            </q-card-section>
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

const feedbackFormRef = ref(null); // <-- ref cho QForm

const parentId = ref(null);
const children = ref([]);
const selectedChildId = ref(null);

const form = ref({
  studentCode: "",
  parentName: "",
  content: "",
});

const formDate = ref(""); // 'YYYY-MM-DD'
const formTime = ref(""); // 'HH:mm'
const dateLabel = ref("");

// Lịch sử feedback
const historyLoading = ref(false);
const feedbackHistory = ref([]); // list đang hiển thị
const allFeedbackHistory = ref([]); // list đầy đủ từ API

const currentChild = computed(
  () => children.value.find((c) => c.id === selectedChildId.value) || null
);

// ====== HELPERS NGÀY/GIỜ ======
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

// Định dạng ngày giờ hiển thị trong lịch sử
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
  return `${dd}/${mm}/${yyyy} • ${time}`;
}

// Chuẩn hóa status
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
  if (s === "PENDING") return "orange";
  if (s === "IN_PROGRESS" || s === "PROCESSING") return "primary";
  if (s === "RESOLVED" || s === "DONE") return "positive";
  return "grey-5";
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

// CHỌN BÉ
function selectChild(s) {
  if (!s) return;
  selectedChildId.value = s.id;
  form.value.studentCode = s.studentCode;

  // filter tạm theo bé (chỉ hiển thị góp ý của bé đó)
  feedbackHistory.value = allFeedbackHistory.value.filter((fb) => fb.studentId === s.id);
}

// ====== LỊCH SỬ GÓP Ý ======
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

    // lưu list đầy đủ + list hiển thị
    allFeedbackHistory.value = list;
    if (selectedChildId.value) {
      feedbackHistory.value = list.filter((fb) => fb.studentId === selectedChildId.value);
    } else {
      feedbackHistory.value = list;
    }
  } catch (e) {
    console.error("[Feedback] loadFeedbackHistory error", e);
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e.message ||
      "Không tải được lịch sử góp ý.";
    $q.notify({
      type: "negative",
      message: msg,
    });
  } finally {
    historyLoading.value = false;
  }
}

// ====== SUBMIT ======
async function submitFeedback() {
  // chưa chọn bé
  if (!form.value.studentCode) {
    $q.notify({
      type: "warning",
      message: "Vui lòng chọn bé cần gửi phản hồi.",
    });
    return;
  }

  // validate các field theo rules của QForm / QInput
  if (feedbackFormRef.value) {
    const ok = await feedbackFormRef.value.validate();
    if (!ok) {
      return; // có lỗi, QInput sẽ tự hiển thị "Vui lòng nhập nội dung"
    }
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
      message: "Gửi phản hồi thành công. Cảm ơn bạn đã góp ý!",
    });

    // reset validate + clear nội dung nhưng KHÔNG hiện lỗi
    if (feedbackFormRef.value) {
      feedbackFormRef.value.resetValidation();
    }
    form.value.content = "";

    await loadFeedbackHistory();
  } catch (e) {
    console.error("[Feedback] submitFeedback error", e);
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e.message ||
      "Gửi phản hồi thất bại.";
    $q.notify({
      type: "negative",
      message: msg,
    });
  } finally {
    submitting.value = false;
  }
}

// BACK
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
  background: #f5f7fb;
  padding-bottom: 64px;
}

.feedback-scroll {
  max-width: 520px;
  margin: 0 auto;
}

.child-card {
  border-radius: 18px;
  background: #ffffff;
}

.children-chip {
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.15);
}

.feedback-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 6px 14px rgba(15, 40, 80, 0.12);
}

.feedback-form {
  margin-bottom: 24px;
}

.feedback-history-card {
  border-radius: 16px;
  background: #ffffff;
}
</style>
