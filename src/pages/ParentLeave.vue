<template>
  <q-page class="leave-page">
    <!-- Header Banner -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon-wrapper">
          <q-icon name="event_busy" size="28px" />
        </div>
        <div class="header-text">
          <h1 class="header-title">Đơn xin nghỉ học</h1>
          <p class="header-subtitle">
            Gửi đơn xin nghỉ cho bé, giáo viên sẽ duyệt trên hệ thống
          </p>
        </div>
      </div>
      <div class="header-decoration"></div>
      <div class="header-decoration-2"></div>
    </div>

    <div class="page-content">
      <!-- FORM GỬI ĐƠN -->
      <q-card class="form-card">
        <q-card-section class="card-header-section">
          <div class="section-header">
            <div class="section-icon">
              <q-icon name="edit_note" size="18px" />
            </div>
            <span class="section-title">Tạo đơn mới</span>
          </div>
        </q-card-section>

        <q-card-section class="form-section">
          <!-- Chọn bé -->
          <div class="form-field">
            <label class="field-label">
              <q-icon name="child_care" size="14px" class="label-icon" />
              Chọn bé
            </label>
            <q-select
              v-model="form.studentId"
              :options="childrenOptions"
              outlined
              dense
              emit-value
              map-options
              :loading="loadingChildren"
              option-label="label"
              option-value="value"
              placeholder="Chọn bé cần xin nghỉ"
              :disable="!childrenOptions.length"
              popup-content-class="select-popup"
              class="custom-select"
            >
              <template #prepend>
                <q-avatar size="22px" color="indigo-1" text-color="primary">
                  <q-icon name="face" size="14px" />
                </q-avatar>
              </template>
              <template #option="{ itemProps, opt }">
                <q-item v-bind="itemProps" class="select-option">
                  <q-item-section avatar>
                    <q-avatar size="32px" color="indigo-1" text-color="primary">
                      {{ opt.label.charAt(0) }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <div
              v-if="!childrenOptions.length && !loadingChildren"
              class="field-error"
            >
              <q-icon name="warning" size="14px" />
              <span>Không tìm thấy bé nào gắn với tài khoản phụ huynh.</span>
            </div>
          </div>

          <!-- Ngày nghỉ (chọn nhiều ngày) -->
          <div class="form-field">
            <label class="field-label">
              <q-icon name="calendar_today" size="14px" class="label-icon" />
              Ngày xin nghỉ
            </label>

            <q-input
              v-model="leaveRangeLabel"
              outlined
              dense
              readonly
              class="custom-input"
              placeholder="Chọn khoảng ngày xin nghỉ"
            >
              <template #prepend>
                <q-icon name="event" color="primary" size="18px" />
              </template>

              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="form.leaveRange"
                  mask="YYYY-MM-DD"
                  range
                  :options="allowFromToday"
                >
                  <div class="row items-center justify-end q-pa-sm">
                    <q-btn label="Đóng" flat v-close-popup no-caps />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-input>

            <div class="field-hint">
              <q-icon name="info_outline" size="12px" />
              <span>
                Chỉ có thể xin nghỉ từ hôm nay trở đi, tối đa {{ MAX_LEAVE_DAYS }}
                ngày liên tiếp
              </span>
            </div>
          </div>

          <!-- Lý do -->
          <div class="form-field">
            <label class="field-label">
              <q-icon name="description" size="14px" class="label-icon" />
              Lý do xin nghỉ
            </label>
            <q-input
              v-model="form.reason"
              type="textarea"
              outlined
              autogrow
              dense
              maxlength="500"
              lazy-rules
              :rules="[
                (val) =>
                  (!!val && val.trim().length >= 5) ||
                  'Tối thiểu 5 ký tự'
              ]"
              placeholder="Ví dụ: Bé bị sốt, cần nghỉ 1 ngày để theo dõi sức khỏe..."
              class="custom-textarea"
            >
              <template #prepend>
                <q-icon name="notes" color="primary" size="18px" />
              </template>
            </q-input>
            <div class="character-count">
              {{ form.reason?.length || 0 }}/500
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="form-actions">
          <q-btn
            unelevated
            no-caps
            class="submit-btn"
            :loading="submitting"
            @click="submitLeaveRequest"
          >
            <q-icon name="send" size="18px" class="btn-icon" />
            <span>Gửi đơn xin nghỉ</span>
          </q-btn>
        </q-card-actions>
      </q-card>

      <!-- LỊCH SỬ ĐƠN -->
      <div class="history-section">
        <div class="section-header-row">
          <div class="section-header">
            <div class="section-icon">
              <q-icon name="history" size="18px" />
            </div>
            <span class="section-title">Lịch sử đơn xin nghỉ</span>
          </div>
          <q-btn
            flat
            dense
            round
            icon="refresh"
            color="primary"
            size="sm"
            :loading="listLoading"
            @click="loadRequests"
          >
            <q-tooltip>Làm mới</q-tooltip>
          </q-btn>
        </div>

        <!-- Stats Cards -->
        <div v-if="requests.length" class="stats-row">
          <div class="stat-card stat-pending">
            <div class="stat-icon">
              <q-icon name="hourglass_empty" size="16px" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ countByStatus('PENDING') }}</div>
              <div class="stat-label">Chờ duyệt</div>
            </div>
          </div>
          <div class="stat-card stat-approved">
            <div class="stat-icon">
              <q-icon name="check_circle" size="16px" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ countByStatus('APPROVED') }}</div>
              <div class="stat-label">Đã duyệt</div>
            </div>
          </div>
          <div class="stat-card stat-rejected">
            <div class="stat-icon">
              <q-icon name="cancel" size="16px" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ countByStatus('REJECTED') }}</div>
              <div class="stat-label">Từ chối</div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="listLoading" class="loading-state">
          <q-spinner-dots size="40px" color="primary" />
          <p>Đang tải dữ liệu...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!groupedRequests.length" class="empty-state">
          <div class="empty-illustration">
            <div class="empty-icon-wrapper">
              <q-icon name="inbox" size="40px" />
            </div>
            <div class="empty-decoration"></div>
          </div>
          <h3>Chưa có đơn nào</h3>
          <p>Các đơn xin nghỉ sẽ hiển thị tại đây sau khi bạn gửi</p>
        </div>

        <!-- Request Cards (đã gom nhóm) -->
        <div v-else class="requests-list">
          <TransitionGroup name="list">
            <div
              v-for="group in groupedRequests"
              :key="group.groupId"
              class="request-card"
              :class="'request-' + group.status.toLowerCase()"
            >
              <!-- Card Header -->
              <div class="request-header">
                <div class="student-info">
                  <div
                    class="student-avatar"
                    :class="'avatar-' + group.status.toLowerCase()"
                  >
                    {{ firstLetter(group.studentName) }}
                  </div>
                  <div class="student-details">
                    <div class="student-name">{{ group.studentName }}</div>
                    <div class="student-class">
                      <q-icon name="school" size="12px" />
                      <span>Lớp {{ group.className }}</span>
                    </div>
                  </div>
                </div>
                <div
                  class="status-badge"
                  :class="'badge-' + group.status.toLowerCase()"
                >
                  <q-icon :name="statusIcon(group.status)" size="12px" />
                  <span>{{ statusLabel(group.status) }}</span>
                </div>
              </div>

              <!-- Card Body -->
              <div class="request-body">
                <!-- Tóm tắt khoảng ngày -->
                <div class="info-row highlight-row">
                  <div class="info-icon">
                    <q-icon name="event" size="16px" />
                  </div>
                  <div class="info-content">
                    <div class="info-label">Khoảng ngày xin nghỉ</div>
                    <div class="info-value">
                      <template v-if="group.items.length === 1">
                        {{ formatDateFull(group.items[0].leaveDate) }}
                      </template>
                      <template v-else>
                        {{ formatDateFull(group.items[0].leaveDate) }}
                        -
                        {{
                          formatDateFull(
                            group.items[group.items.length - 1].leaveDate
                          )
                        }}
                        ({{ group.items.length }} ngày)
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Bảng chi tiết từng ngày -->
                <div class="dates-table">
                  <div class="dates-header">
                    <div class="col-date">Ngày nghỉ</div>
                    <div class="col-status">Trạng thái</div>
                    <div class="col-action"></div>
                  </div>
                  <div
                    v-for="item in group.items"
                    :key="item.id"
                    class="dates-row"
                  >
                    <div class="col-date">
                      {{ formatDateFull(item.leaveDate) }}
                    </div>
                    <div class="col-status">
                      <q-chip
                        dense
                        square
                        :color="statusChipColor(item.status)"
                        text-color="white"
                      >
                        {{ statusLabel(item.status) }}
                      </q-chip>
                    </div>
                    <div class="col-action">
                      <q-btn
                        v-if="canCancel(item)"
                        flat
                        dense
                        no-caps
                        color="negative"
                        class="cancel-btn"
                        @click="confirmCancel(item)"
                      >
                        <q-icon name="close" size="14px" class="btn-icon" />
                        <span>Hủy ngày</span>
                      </q-btn>
                    </div>
                  </div>
                </div>

                <!-- Lý do chung -->
                <div class="info-row">
                  <div class="info-icon secondary">
                    <q-icon name="notes" size="16px" />
                  </div>
                  <div class="info-content">
                    <div class="info-label">Lý do</div>
                    <div class="info-value reason-text">
                      {{ group.reason || 'Không có' }}
                    </div>
                  </div>
                </div>

                <!-- Ghi chú GV -->
                <div
                  v-if="group.teacherNote || group.approvedBy"
                  class="info-row teacher-note"
                >
                  <div class="info-icon teacher">
                    <q-icon name="record_voice_over" size="16px" />
                  </div>
                  <div class="info-content">
                    <div class="info-label">
                      Phản hồi từ {{ group.approvedBy || 'Giáo viên' }}
                    </div>
                    <div class="info-value">
                      {{ group.teacherNote || 'Không có ghi chú' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card Footer -->
              <div class="request-footer">
                <div class="created-time">
                  <q-icon name="schedule" size="12px" />
                  <span>{{ formatDateTime(group.createdAt) }}</span>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'src/stores/auth';

const $q = useQuasar();
const auth = useAuthStore();

/* ====== CONSTANTS ====== */
const MAX_LEAVE_DAYS = 5;

/* ====== STATE ====== */
const children = ref([]);
const loadingChildren = ref(false);

const form = ref({
  studentId: null,
  leaveRange: null, // { from, to }
  reason: ''
});

const submitting = ref(false);
const requests = ref([]); // raw list từ BE
const listLoading = ref(false);

/* ====== COMPUTED ====== */
const childrenOptions = computed(() =>
  children.value.map((c) => ({
    label: `${c.fullName} - Lớp ${c.className}`,
    value: c.studentId
  }))
);

const minDate = computed(() => {
  const d = new Date();
  return d.toISOString().split('T')[0];
});

const leaveRangeLabel = computed(() => {
  const range = form.value.leaveRange;
  if (!range || !range.from || !range.to) return '';
  const fromLabel = formatDate(range.from);
  const toLabel = formatDate(range.to);
  return fromLabel === toLabel ? fromLabel : `${fromLabel} - ${toLabel}`;
});

/**
 * Gom các đơn lại theo chuỗi ngày liên tiếp
 *  - Cùng studentId
 *  - Cùng reason
 *  - Cùng status
 *  - Các leaveDate liền nhau (mỗi ngày cách 1)
 */
const groupedRequests = computed(() => {
  return groupRequestsByRange(requests.value);
});

/* ====== HELPERS ====== */

function allowFromToday(date) {
  return date >= minDate.value;
}

function countByStatus(status) {
  return requests.value.filter((r) => r.status === status).length;
}

function formatDate(dateStr) {
  if (!dateStr) return '--/--/----';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatDateFull(dateStr) {
  if (!dateStr) return '--/--/----';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayName = days[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dayName}, ${dd}/${mm}/${yyyy}`;
}

function formatDateTime(str) {
  if (!str) return '';
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  return d.toLocaleString('vi-VN');
}

function statusLabel(status) {
  const labels = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    CANCELLED: 'Đã hủy'
  };
  return labels[status] || status || 'Không rõ';
}

function statusIcon(status) {
  const icons = {
    PENDING: 'hourglass_empty',
    APPROVED: 'check_circle',
    REJECTED: 'cancel',
    CANCELLED: 'block'
  };
  return icons[status] || 'help';
}

function statusChipColor(status) {
  const s = status || '';
  if (s === 'PENDING') return 'amber-7';
  if (s === 'APPROVED') return 'green-6';
  if (s === 'REJECTED') return 'red-6';
  if (s === 'CANCELLED') return 'grey-6';
  return 'grey-5';
}

function canCancel(req) {
  return req.status === 'PENDING';
}

function firstLetter(name) {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
}

function buildDatesFromRange(range) {
  if (!range || !range.from || !range.to) return [];

  const start = new Date(range.from);
  const end = new Date(range.to);
  const dates = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }

  return dates;
}

function mapLeaveResponse(r) {
  return {
    id: r.id,
    studentId: r.studentId,
    studentName: r.studentName,
    studentCode: r.studentCode,
    className: r.className,
    parentId: r.parentId,
    parentName: r.parentName,
    leaveDate: r.leaveDate,
    reason: r.reason,
    status: r.status,
    teacherNote: r.teacherNote,
    approvedBy: r.approvedBy,
    approvedAt: r.approvedAt,
    createdAt: r.createdAt
  };
}

/**
 * Check hai ngày có liền kề nhau không (cách 1 ngày)
 */
function isConsecutiveDate(prevDateStr, curDateStr) {
  if (!prevDateStr || !curDateStr) return false;
  const prev = new Date(prevDateStr);
  const cur = new Date(curDateStr);
  const diffMs = cur.getTime() - prev.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays === 1;
}

/**
 * Gom danh sách request thành các group liên tiếp
 */
function groupRequestsByRange(list) {
  if (!list || !list.length) return [];

  const sorted = [...list].sort((a, b) => {
    if (a.studentId !== b.studentId) return a.studentId - b.studentId;

    const ca = new Date(a.createdAt || a.leaveDate).getTime();
    const cb = new Date(b.createdAt || b.leaveDate).getTime();
    if (ca !== cb) return ca - cb;

    const da = new Date(a.leaveDate).getTime();
    const db = new Date(b.leaveDate).getTime();
    return da - db;
  });

  const groups = [];
  let current = null;

  sorted.forEach((r) => {
    if (
      current &&
      current.studentId === r.studentId &&
      current.reason === r.reason &&
      current.status === r.status &&
      isConsecutiveDate(current.lastLeaveDate, r.leaveDate)
    ) {
      current.items.push(r);
      current.lastLeaveDate = r.leaveDate;
    } else {
      current = {
        groupId: r.id,
        studentId: r.studentId,
        studentName: r.studentName,
        className: r.className,
        parentName: r.parentName,
        status: r.status,
        reason: r.reason,
        teacherNote: r.teacherNote,
        approvedBy: r.approvedBy,
        createdAt: r.createdAt,
        items: [r],
        lastLeaveDate: r.leaveDate
      };
      groups.push(current);
    }
  });

  return groups;
}

/* ====== API CALLS ====== */

async function loadChildren() {
  if (!auth.accessToken) return;

  try {
    loadingChildren.value = true;

    const res = await api.get('/parents/children', {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });

    const list = res.data?.data || [];
    children.value = list;

    if (list.length && !form.value.studentId) {
      form.value.studentId = list[0].studentId;
    }
  } catch (e) {
    console.error('[Leave] loadChildren error', e);
    $q.notify({
      type: 'negative',
      message: e?.response?.data?.message || 'Không lấy được danh sách bé.',
      icon: 'error'
    });
  } finally {
    loadingChildren.value = false;
  }
}

async function loadRequests() {
  if (!auth.accessToken) return;

  try {
    listLoading.value = true;

    const res = await api.get('/leave-requests/parents', {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });

    const list = res.data?.data || [];
    requests.value = list.map(mapLeaveResponse);
  } catch (e) {
    console.error('[Leave] loadRequests error', e);
    $q.notify({
      type: 'negative',
      message:
        e?.response?.data?.message || 'Không lấy được danh sách đơn xin nghỉ.',
      icon: 'error'
    });
  } finally {
    listLoading.value = false;
  }
}

async function submitLeaveRequest() {
  if (!auth.accessToken) {
    $q.notify({
      type: 'warning',
      message: 'Bạn chưa đăng nhập.',
      icon: 'login'
    });
    return;
  }

  if (!form.value.studentId) {
    $q.notify({
      type: 'warning',
      message: 'Vui lòng chọn bé cần xin nghỉ.',
      icon: 'child_care'
    });
    return;
  }

  if (!form.value.leaveRange || !form.value.leaveRange.from || !form.value.leaveRange.to) {
    $q.notify({
      type: 'warning',
      message: 'Vui lòng chọn khoảng ngày xin nghỉ.',
      icon: 'event'
    });
    return;
  }

  if (!form.value.reason || form.value.reason.trim().length < 5) {
    $q.notify({
      type: 'warning',
      message: 'Vui lòng nhập lý do xin nghỉ (tối thiểu 5 ký tự).',
      icon: 'notes'
    });
    return;
  }

  const dates = buildDatesFromRange(form.value.leaveRange);

  if (!dates.length) {
    $q.notify({
      type: 'warning',
      message: 'Khoảng ngày xin nghỉ không hợp lệ.',
      icon: 'event_busy'
    });
    return;
  }

  if (dates.length > MAX_LEAVE_DAYS) {
    $q.notify({
      type: 'warning',
      message: `Bạn chỉ được xin nghỉ tối đa ${MAX_LEAVE_DAYS} ngày liên tiếp.`,
      icon: 'event_busy'
    });
    return;
  }

  const todayOnly = new Date();
  todayOnly.setHours(0, 0, 0, 0);

  const hasPast = dates.some((dStr) => {
    const d = new Date(dStr);
    d.setHours(0, 0, 0, 0);
    return d < todayOnly;
  });

  if (hasPast) {
    $q.notify({
      type: 'warning',
      message: 'Không thể xin nghỉ cho ngày trong quá khứ.',
      icon: 'event_busy'
    });
    return;
  }

  try {
    submitting.value = true;

    for (const dStr of dates) {
      const payload = {
        studentId: form.value.studentId,
        leaveDate: dStr,
        reason: form.value.reason.trim()
      };

      await api.post('/leave-requests/parents', payload, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
    }

    $q.notify({
      type: 'positive',
      message: `Đã gửi đơn xin nghỉ cho ${dates.length} ngày.`,
      icon: 'check_circle'
    });

    form.value.reason = '';
    await loadRequests();
  } catch (e) {
    console.error('[Leave] submitLeaveRequest error', e);
    $q.notify({
      type: 'negative',
      message:
        e?.response?.data?.message ||
        'Không gửi được đơn xin nghỉ. Thử lại sau.',
      icon: 'error'
    });
  } finally {
    submitting.value = false;
  }
}

function confirmCancel(req) {
  $q.dialog({
    title: 'Xác nhận hủy đơn',
    message: `Bạn có chắc muốn hủy đơn xin nghỉ ngày ${formatDate(
      req.leaveDate
    )} cho bé ${req.studentName}?`,
    cancel: {
      label: 'Không',
      color: 'grey-7',
      flat: true,
      noCaps: true
    },
    ok: {
      label: 'Hủy đơn',
      color: 'negative',
      unelevated: true,
      noCaps: true
    },
    persistent: true
  }).onOk(() => {
    cancelRequest(req);
  });
}

async function cancelRequest(req) {
  if (!auth.accessToken) return;

  try {
    await api.patch(
      `/leave-requests/parents/${req.id}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${auth.accessToken}` } }
    );

    $q.notify({
      type: 'positive',
      message: 'Đã hủy đơn xin nghỉ.',
      icon: 'check_circle'
    });

    await loadRequests();
  } catch (e) {
    console.error('[Leave] cancelRequest error', e);
    $q.notify({
      type: 'negative',
      message:
        e?.response?.data?.message || 'Không hủy được đơn xin nghỉ.',
      icon: 'error'
    });
  }
}

/* ====== INIT ====== */
onMounted(async () => {
  if (!auth.accessToken) {
    $q.notify({
      type: 'warning',
      message: 'Bạn chưa đăng nhập.',
      icon: 'login'
    });
    return;
  }

  await loadChildren();
  await loadRequests();
});
</script>

<style lang="scss" scoped>
/* (giữ nguyên toàn bộ phần style cũ của bạn)
   Nếu cần anh có thể rút gọn lại, nhưng hiện giờ không phải sửa gì
   cho phần gom nhóm cả, chỉ thêm một số class dates-table, dates-row. */

$primary: #6366f1;
$primary-light: #818cf8;
$primary-lighter: #eef2ff;
$primary-dark: #4f46e5;
$success: #10b981;
$success-light: #d1fae5;
$warning: #f59e0b;
$warning-light: #fef3c7;
$danger: #ef4444;
$danger-light: #fee2e2;
$grey-50: #f9fafb;
$grey-100: #f3f4f6;
$grey-200: #e5e7eb;
$grey-300: #d1d5db;
$grey-400: #9ca3af;
$grey-500: #6b7280;
$grey-600: #4b5563;
$grey-700: #374151;
$grey-800: #1f2937;
$grey-900: #111827;
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 20px;
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);

/* ... toàn bộ style cũ của bạn ở đây ... */

/* Bảng ngày trong 1 group */
.dates-table {
  margin: 8px -14px 4px;
  border-top: 1px dashed $grey-200;
  padding: 8px 14px 4px;
}

.dates-header,
.dates-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dates-header {
  font-size: 11px;
  font-weight: 600;
  color: $grey-500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.dates-row {
  font-size: 13px;
  padding: 4px 0;
  border-top: 1px solid $grey-100;

  &:first-of-type {
    border-top: none;
  }
}

.col-date {
  flex: 2;
}

.col-status {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}

.col-action {
  flex: 0 0 auto;
}

// Header
.page-header {
  background: linear-gradient(135deg, $primary 0%, $primary-light 50%, #a78bfa 100%);
  padding: 20px 16px 36px;
  position: relative;
  overflow: hidden;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 2;
}

.header-icon-wrapper {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin: 4px 0 0;
  line-height: 1.4;
}

.header-decoration {
  position: absolute;
  top: -60px;
  right: -40px;
  width: 140px;
  height: 140px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.header-decoration-2 {
  position: absolute;
  bottom: -30px;
  left: -20px;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
}

// Content
.page-content {
  margin-top: -20px;
  position: relative;
  z-index: 3;
  padding: 0 12px;
}

// Section Header
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  width: 32px;
  height: 32px;
  background: $primary-lighter;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: $grey-800;
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

// Form Card
.form-card {
  border-radius: $radius-xl;
  box-shadow: $shadow-card;
  border: none;
  overflow: hidden;
  margin-bottom: 20px;
}

.card-header-section {
  padding: 16px 16px 0;
}

.form-section {
  padding: 16px;
}

.form-field {
  margin-bottom: 18px;

  &:last-child {
    margin-bottom: 0;
  }
}

.field-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: $grey-700;
  margin-bottom: 8px;
  gap: 6px;

  .label-icon {
    color: $grey-500;
  }
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: $grey-500;
  margin-top: 6px;

  span {
    line-height: 1;
  }
}

.field-error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: $danger;
  margin-top: 6px;

  span {
    line-height: 1.3;
  }
}

.character-count {
  text-align: right;
  font-size: 11px;
  color: $grey-400;
  margin-top: 4px;
}

.custom-select,
.custom-input,
.custom-textarea {
  :deep(.q-field__control) {
    border-radius: $radius-md;
    min-height: 44px;

    &::before {
      border-color: $grey-200;
    }

    &:hover::before {
      border-color: $primary-light;
    }
  }

  :deep(.q-field--focused .q-field__control) {
    &::before {
      border-color: $primary;
    }

    &::after {
      border-width: 2px;
      border-color: $primary;
    }
  }

  :deep(.q-field__native) {
    font-size: 14px;
    color: $grey-800;
    padding: 8px 0;
  }

  :deep(.q-field__prepend) {
    padding-right: 8px;
  }
}

.custom-textarea {
  :deep(.q-field__control) {
    min-height: 100px;
    align-items: flex-start;
    padding-top: 10px;
  }

  :deep(.q-field__prepend) {
    padding-top: 2px;
  }
}

.form-actions {
  padding: 0 16px 16px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: $radius-md;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  .btn-icon {
    margin-right: 4px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
  }

  &:active {
    transform: translateY(0);
  }
}

// History Section
.history-section {
  padding: 4px 0;
}

// Stats Row
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.stat-card {
  padding: 12px 10px;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  gap: 10px;

  &.stat-pending {
    background: linear-gradient(135deg, #fef9c3 0%, $warning-light 100%);

    .stat-icon {
      background: rgba($warning, 0.15);
      color: $warning;
    }

    .stat-number {
      color: darken($warning, 5%);
    }
  }

  &.stat-approved {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);

    .stat-icon {
      background: rgba($success, 0.15);
      color: $success;
    }

    .stat-number {
      color: darken($success, 5%);
    }
  }

  &.stat-rejected {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);

    .stat-icon {
      background: rgba($danger, 0.15);
      color: $danger;
    }

    .stat-number {
      color: darken($danger, 5%);
    }
  }
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  color: $grey-600;
  margin-top: 2px;
  white-space: nowrap;
}

// Loading & Empty States
.loading-state {
  text-align: center;
  padding: 40px 20px;

  p {
    color: $grey-500;
    margin: 12px 0 0;
    font-size: 13px;
  }
}

.empty-state {
  text-align: center;
  padding: 40px 24px;
  background: white;
  border-radius: $radius-xl;
  box-shadow: $shadow-sm;

  .empty-illustration {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 16px;
  }

  .empty-icon-wrapper {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, $grey-100 0%, $grey-200 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $grey-400;
    position: relative;
    z-index: 1;
  }

  .empty-decoration {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 30px;
    height: 30px;
    background: $primary-lighter;
    border-radius: 50%;
    z-index: 0;
  }

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: $grey-800;
    margin: 0 0 6px;
  }

  p {
    font-size: 12px;
    color: $grey-500;
    margin: 0;
    line-height: 1.5;
  }
}

// Request Cards
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.request-card {
  background: white;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
  overflow: hidden;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.995);
  }

  &.request-pending {
    border-left-color: $warning;
  }

  &.request-approved {
    border-left-color: $success;
  }

  &.request-rejected {
    border-left-color: $danger;
  }

  &.request-cancelled {
    border-left-color: $grey-400;
  }
}

.request-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: $grey-50;
  gap: 10px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: white;
  flex-shrink: 0;

  &.avatar-pending {
    background: linear-gradient(135deg, $warning, #fbbf24);
  }

  &.avatar-approved {
    background: linear-gradient(135deg, $success, #34d399);
  }

  &.avatar-rejected {
    background: linear-gradient(135deg, $danger, #f87171);
  }

  &.avatar-cancelled {
    background: linear-gradient(135deg, $grey-400, $grey-300);
  }
}

.student-details {
  min-width: 0;
  flex: 1;
}

.student-name {
  font-size: 14px;
  font-weight: 600;
  color: $grey-800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-class {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: $grey-500;
  margin-top: 2px;

  span {
    line-height: 1;
  }
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;

  span {
    line-height: 1;
  }

  &.badge-pending {
    background: $warning-light;
    color: darken($warning, 10%);
  }

  &.badge-approved {
    background: $success-light;
    color: darken($success, 10%);
  }

  &.badge-rejected {
    background: $danger-light;
    color: darken($danger, 5%);
  }

  &.badge-cancelled {
    background: $grey-100;
    color: $grey-600;
  }
}

.request-body {
  padding: 12px 14px;
}

.info-row {
  display: flex;
  gap: 10px;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid $grey-100;
  }

  &.highlight-row {
    background: $primary-lighter;
    margin: 0 -14px;
    padding: 10px 14px;
    border-radius: $radius-sm;
    border-bottom: none !important;
    margin-bottom: 4px;

    .info-icon {
      background: white;
      box-shadow: $shadow-sm;
    }
  }

  &.teacher-note {
    background: #fef9c3;
    margin: 4px -14px 0;
    padding: 10px 14px;
    border-radius: $radius-sm;
    border-bottom: none !important;

    .info-icon.teacher {
      background: rgba($warning, 0.15);
      color: $warning;
    }
  }
}

.info-icon {
  width: 32px;
  height: 32px;
  background: $primary-lighter;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary;
  flex-shrink: 0;

  &.secondary {
    background: $grey-100;
    color: $grey-500;
  }
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 10px;
  color: $grey-500;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-value {
  font-size: 13px;
  color: $grey-800;
  font-weight: 500;
  line-height: 1.4;
}

.reason-text {
  font-weight: 400;
  color: $grey-700;
}

.request-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: $grey-50;
  border-top: 1px solid $grey-100;
}

.created-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: $grey-500;

  span {
    line-height: 1;
  }
}

.cancel-btn {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  gap: 4px;

  .btn-icon {
    margin-right: 2px;
  }

  &:hover {
    background: $danger-light;
  }
}

// Animations
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.list-move {
  transition: transform 0.3s ease;
}

// Select Popup
:deep(.select-popup) {
  border-radius: $radius-md !important;

  .q-item {
    padding: 10px 14px;
    min-height: 48px;
  }
}
</style>
