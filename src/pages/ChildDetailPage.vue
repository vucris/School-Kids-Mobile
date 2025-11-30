<template>
  <q-page class="child-detail-page">
    <div class="child-detail-scroll q-pa-md q-pt-sm">

      <!-- HEADER + BACK -->
      <div class="row items-center q-mb-md">
        <div class="col-auto">
          <q-btn flat round dense icon="arrow_back" @click="goBack" />
        </div>
        <div class="col text-center q-pr-md">
          <div class="text-subtitle1 text-weight-semibold">
            Hồ sơ của bé
          </div>
          <div class="text-caption text-grey-7">
            {{ childDetail.fullName || 'Đang tải...' }}
          </div>
        </div>
        <div class="col-auto">
          <q-avatar size="40px">
            <img :src="avatarUrl" alt="child" />
          </q-avatar>
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
        v-else-if="!childDetail.studentId"
        class="q-mt-md bg-red-1 text-negative"
        rounded
      >
        <template #avatar>
          <q-icon name="error_outline" />
        </template>
        Không tìm thấy thông tin học sinh.
      </q-banner>

      <!-- NỘI DUNG CHI TIẾT -->
      <div v-else>

        <!-- CARD AVATAR + TÊN + LỚP -->
        <q-card class="child-header-card q-mb-md">
          <div class="child-header-bg"></div>

          <q-card-section class="child-header-content">
            <div class="row no-wrap items-center">
              <q-avatar size="70px" class="child-header-avatar q-mr-md">
                <img :src="avatarUrl" alt="child" />
              </q-avatar>

              <div class="col">
                <div class="text-h6 text-weight-semibold ellipsis-2-lines">
                  {{ childDetail.fullName }}
                </div>
                <div class="row items-center q-mt-xs">
                  <q-chip
                    dense
                    square
                    class="q-mr-xs"
                    color="primary"
                    text-color="white"
                  >
                    Lớp {{ childDetail.className || 'Chưa cập nhật' }}
                  </q-chip>
                  <q-chip
                    dense
                    square
                    outline
                    color="primary"
                    class="q-mr-xs"
                  >
                    Mã HS: {{ childDetail.studentCode || '---' }}
                  </q-chip>
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  Ngày nhập học:
                  <span class="text-weight-medium">
                    {{ formatDate(childDetail.enrollmentDate) || '---' }}
                  </span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- THÔNG TIN CƠ BẢN -->
        <q-card class="info-card q-mb-md">
          <q-card-section class="q-pb-xs">
            <div class="row items-center">
              <q-icon name="badge" size="18px" class="q-mr-xs text-primary" />
              <div class="text-subtitle2 text-weight-medium">
                Thông tin cơ bản
              </div>
            </div>
          </q-card-section>

          <q-separator spaced />

          <q-card-section class="q-pt-xs">
            <div class="info-row">
              <span class="info-label">Họ tên:</span>
              <span class="info-value">{{ childDetail.fullName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Mã học sinh:</span>
              <span class="info-value">{{ childDetail.studentCode || '---' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ childDetail.email || '---' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Số điện thoại:</span>
              <span class="info-value">{{ childDetail.phone || '---' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Địa chỉ:</span>
              <span class="info-value">
                {{ childDetail.address || 'Chưa cập nhật' }}
              </span>
            </div>
          </q-card-section>
        </q-card>

        <!-- THÔNG TIN LỚP HỌC -->
        <q-card class="info-card q-mb-md">
          <q-card-section class="q-pb-xs">
            <div class="row items-center">
              <q-icon name="school" size="18px" class="q-mr-xs text-indigo-6" />
              <div class="text-subtitle2 text-weight-medium">
                Thông tin lớp
              </div>
            </div>
          </q-card-section>

          <q-separator spaced />

          <q-card-section class="q-pt-xs">
            <div class="info-row">
              <span class="info-label">Lớp:</span>
              <span class="info-value">
                {{ childDetail.className || 'Chưa xếp lớp' }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Mã lớp:</span>
              <span class="info-value">{{ childDetail.classCode || '---' }}</span>
            </div>
          </q-card-section>
        </q-card>

        <!-- THÔNG TIN PHỤ HUYNH -->
        <q-card class="info-card q-mb-md">
          <q-card-section class="q-pb-xs">
            <div class="row items-center">
              <q-icon name="family_restroom" size="18px" class="q-mr-xs text-pink-5" />
              <div class="text-subtitle2 text-weight-medium">
                Thông tin phụ huynh
              </div>
            </div>
          </q-card-section>

          <q-separator spaced />

          <q-card-section class="q-pt-xs">
            <div class="info-row">
              <span class="info-label">Phụ huynh:</span>
              <span class="info-value">
                {{ childDetail.parentName || '---' }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Quan hệ:</span>
              <span class="info-value">
                {{ childDetail.relationship || 'Chưa cập nhật' }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">SĐT phụ huynh:</span>
              <span class="info-value">
                {{ childDetail.parentPhone || '---' }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Email phụ huynh:</span>
              <span class="info-value">
                {{ childDetail.parentEmail || '---' }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Liên hệ khẩn cấp:</span>
              <span class="info-value">
                {{ childDetail.emergencyContact || '---' }}
              </span>
            </div>
          </q-card-section>
        </q-card>

        <!-- GHI CHÚ SỨC KHỎE -->
        <q-card class="info-card q-mb-xl">
          <q-card-section class="q-pb-xs">
            <div class="row items-center">
              <q-icon name="favorite" size="18px" class="q-mr-xs text-red-5" />
              <div class="text-subtitle2 text-weight-medium">
                Ghi chú sức khỏe
              </div>
            </div>
          </q-card-section>

          <q-separator spaced />

          <q-card-section class="q-pt-xs">
            <div
              v-if="childDetail.healthNotes"
              class="text-body2 text-grey-8"
            >
              {{ childDetail.healthNotes }}
            </div>
            <div v-else class="text-caption text-grey-6">
              Chưa có ghi chú đặc biệt về sức khỏe của bé.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { api } from 'boot/axios';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);
const childDetail = ref({});

// avatar mặc định
const avatarUrl = 'https://i.postimg.cc/2jFv66sG/avatar-kid.png';

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

async function loadChildDetail() {
  try {
    loading.value = true;

    const studentId = Number(route.params.studentId);
    if (!studentId) {
      $q.notify({
        type: 'warning',
        message: 'Thiếu thông tin học sinh.',
      });
      return;
    }

    // lấy username phụ huynh hiện tại
    const username = auth.user?.username || localStorage.getItem('username');
    if (!username) {
      $q.notify({
        type: 'warning',
        message: 'Không tìm thấy tài khoản phụ huynh hiện tại.',
      });
      return;
    }

    // lấy danh sách phụ huynh, tìm theo username
    const resParents = await api.get('/parents/all');
    const parentsApi = resParents.data || {};
    const parents = parentsApi.data || [];
    const parent = parents.find((p) => p.username === username);

    if (!parent) {
      $q.notify({
        type: 'warning',
        message: 'Không tìm thấy thông tin phụ huynh tương ứng.',
      });
      return;
    }

    // gọi API chi tiết con: GET /parents/{parentId}/children/{studentId}
    const res = await api.get(
      `/parents/${parent.id}/children/${studentId}`
    );
    const apiResp = res.data || {};
    const data = apiResp.data;

    if (!data) {
      $q.notify({
        type: 'warning',
        message: 'Không tìm thấy thông tin chi tiết của bé.',
      });
      return;
    }

    childDetail.value = data;
  } catch (e) {
    console.error('[ChildDetail] loadChildDetail error', e);
    $q.notify({
      type: 'negative',
      message: 'Không lấy được thông tin chi tiết của bé.',
    });
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.back();
}

onMounted(() => {
  if (!auth.accessToken) {
    $q.notify({
      type: 'warning',
      message: 'Bạn chưa đăng nhập.',
    });
    return;
  }
  loadChildDetail();
});
</script>

<style scoped>
.child-detail-page {
  background: linear-gradient(180deg, #fef9ff, #f5f7fb);
  padding-bottom: 64px;
}

.child-detail-scroll {
  max-width: 520px;
  margin: 0 auto;
}

/* Card đầu tiên */
.child-header-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 10px 22px rgba(15, 40, 80, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.95);
}

.child-header-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, #fee2e2 0, transparent 45%),
    radial-gradient(circle at bottom right, #dbeafe 0, transparent 50%);
  opacity: 0.9;
}

.child-header-content {
  position: relative;
  z-index: 1;
  padding: 14px 16px 14px;
}

.child-header-avatar {
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.25);
}

/* Card thông tin chung */
.info-card {
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 40, 80, 0.12);
}

/* dòng thông tin */
.info-row {
  display: flex;
  margin-bottom: 6px;
  font-size: 13px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  min-width: 110px;
  color: #6b7280;
  font-weight: 600;
}

.info-value {
  flex: 1;
  color: #111827;
}

/* multi-line ellipsis */
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

@media (max-width: 380px) {
  .child-header-card {
    border-radius: 20px;
  }
  .info-card {
    border-radius: 16px;
  }
}
</style>
