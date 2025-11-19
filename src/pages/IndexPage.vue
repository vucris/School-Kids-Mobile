<template>
  <q-page class="album-page">
    <div class="album-scroll q-pa-md q-pt-sm">
      <!-- KHU VỰC THÔNG TIN BÉ -->
      <section class="child-section">
        <div class="child-label row items-center q-mb-xs">
          <q-icon name="child_care" size="16px" class="q-mr-xs" />
          <span>Con của bạn</span>
        </div>

        <q-card class="child-card">
          <div class="child-card-bg"></div>

          <div class="child-card-content">
            <!-- HÀNG 1: avatar + tên + nút xem chi tiết -->
            <div class="row no-wrap items-center q-mb-xs">
              <div class="col-auto q-pr-sm">
                <q-avatar size="58px" class="child-avatar">
                  <img :src="child.avatar" alt="avatar" />
                </q-avatar>
              </div>

              <div class="col">
                <div class="row items-center justify-between child-name-row">
                  <div class="text-subtitle1 text-weight-semibold text-dark ellipsis">
                    {{ child.name || "Bé yêu của bạn" }}
                  </div>
                  <q-badge
                    v-if="child.name"
                    class="hidden-xs text-caption text-white q-px-sm q-py-xs"
                    color="pink-4"
                  >
                    Bé của bạn 💕
                  </q-badge>
                </div>
              </div>

              <div class="col-auto hide-on-very-small">
                <q-btn
                  flat
                  dense
                  no-caps
                  size="sm"
                  color="primary"
                  label="Xem chi tiết"
                  class="q-mb-xs"
                  @click="openChildDetail"
                />
              </div>
            </div>

            <!-- HÀNG 2: Lớp -->
            <div class="row items-center info-row">
              <q-icon name="school" size="16px" class="info-icon" />
              <span class="info-label">Lớp:</span>
              <span class="info-value">
                {{ child.className || "Chưa cập nhật" }}
              </span>
            </div>

            <!-- HÀNG 3: Mã học sinh -->
            <div class="row items-center info-row">
              <q-icon name="confirmation_number" size="16px" class="info-icon" />
              <span class="info-label">Mã HS:</span>
              <span class="info-value">
                {{ child.studentCode || "---" }}
              </span>
            </div>

            <!-- HÀNG 4: chọn bé nếu có nhiều con -->
            <div
              v-if="children.length > 1"
              class="row items-start q-mt-sm children-switch"
            >
              <div class="col-auto">
                <span class="text-caption text-grey-7">Chọn bé:</span>
              </div>
              <div class="col">
                <div class="row no-wrap scroll-x">
                  <q-chip
                    v-for="s in children"
                    :key="s.id"
                    clickable
                    @click="selectChild(s)"
                    :color="s.studentCode === child.studentCode ? 'primary' : 'white'"
                    :text-color="s.studentCode === child.studentCode ? 'white' : 'grey-8'"
                    class="q-mr-xs q-mb-xs children-chip"
                  >
                    {{ s.name }}
                  </q-chip>
                </div>
              </div>
            </div>

            <!-- nút xem chi tiết cho màn rất nhỏ -->
            <div class="row justify-end q-mt-xs show-on-very-small">
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                label="Xem chi tiết"
                @click="openChildDetail"
              />
            </div>
          </div>
        </q-card>
      </section>

      <!-- TIÊU ĐỀ ALBUM -->
      <section class="q-mt-lg">
        <div class="row items-center justify-between section-header">
          <div class="row items-center">
            <div class="section-dot q-mr-sm"></div>
            <span class="text-body1 text-weight-medium"> Album lớp của bé </span>
          </div>
          <div class="row items-center">
            <span v-if="child.className" class="text-caption text-grey-6 q-mr-sm">
              {{ child.className }}
            </span>
            <q-btn dense flat icon="refresh" size="sm" @click="reloadAlbums" />
          </div>
        </div>
      </section>

      <!-- DANH SÁCH ALBUM -->
      <section class="q-mt-sm">
        <q-card v-if="loading" flat class="q-pa-md q-mt-sm">
          <q-inner-loading showing>
            <q-spinner-dots size="32px" color="primary" />
          </q-inner-loading>
        </q-card>

        <q-banner
          v-else-if="!albums.length"
          class="q-mt-md bg-blue-1 text-blue-8"
          rounded
        >
          <template #avatar>
            <q-icon name="photo_album" />
          </template>
          Hiện chưa có album nào cho bé trong khoảng thời gian được hiển thị.
        </q-banner>

        <div v-else class="row q-col-gutter-md q-mt-sm">
          <div v-for="album in albums" :key="album.id" class="col-6">
            <q-card class="album-card" @click="openAlbum(album)">
              <div class="album-cover-wrapper">
                <img :src="album.coverUrl" alt="cover" class="album-cover" />
                <div class="album-photo-count">
                  <q-icon name="photo_camera" size="14px" class="q-mr-xs" />
                  <span class="text-caption">{{ album.photoCount }}</span>
                </div>
              </div>

              <q-card-section class="q-pt-sm q-pb-xs">
                <div class="text-caption text-weight-medium ellipsis-2-lines">
                  {{ album.title }}
                </div>

                <!-- MÔ TẢ ALBUM DƯỚI TIÊU ĐỀ -->
                <div
                  v-if="album.description"
                  class="text-caption text-grey-7 q-mt-xs album-desc ellipsis-2-lines"
                >
                  {{ album.description }}
                </div>

                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ formatDate(album.createdAt) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";
import { api } from "boot/axios";

const $q = useQuasar();
const auth = useAuthStore();

const loading = ref(false);
const children = ref([]); // toàn bộ con
const child = ref({
  id: null,
  name: "Bé yêu",
  className: "",
  studentCode: "",
  avatar: "https://i.postimg.cc/2jFv66sG/avatar-kid.png",
});
const albums = ref([]);
const currentParentId = ref(null);

// ---- FORMAT DATE ----
function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ---- LẤY PARENT + CHILDREN TỪ BE ----
async function fetchParentAndChildren() {
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

    // 1) Lấy danh sách phụ huynh → tìm theo username
    const resParents = await api.get("/parents/all");
    const apiParents = resParents.data || {};
    const parents = apiParents.data || [];

    const parent = parents.find((p) => p.username === username);
    if (!parent) {
      $q.notify({
        type: "warning",
        message: "Không tìm thấy thông tin phụ huynh tương ứng.",
      });
      return;
    }

    currentParentId.value = parent.id;

    // 2) Lấy danh sách con của phụ huynh
    const resChildren = await api.get(`/parents/${parent.id}/children`);
    const apiChildren = resChildren.data || {};
    const list = apiChildren.data || [];

    children.value = list.map((s) => ({
      id: s.studentId,
      name: s.fullName,
      className: s.className,
      studentCode: s.studentCode,
      avatar: "https://i.postimg.cc/2jFv66sG/avatar-kid.png", // sau này thay avatar thật nếu BE có
    }));

    if (children.value.length > 0) {
      selectChild(children.value[0]); // mặc định chọn bé đầu tiên
    }
  } catch (e) {
    console.error("[Album] fetchParentAndChildren error", e);
    $q.notify({
      type: "negative",
      message: "Không lấy được thông tin phụ huynh / con.",
    });
  } finally {
    loading.value = false;
  }
}

// ---- LẤY ALBUM THEO BÉ ----
async function fetchAlbumsForChild(studentId) {
  if (!currentParentId.value || !studentId) return;

  try {
    loading.value = true;
    const res = await api.get(
      `/parents/${currentParentId.value}/children/${studentId}/albums`
    );
    const apiAlbums = res.data || {};
    const list = apiAlbums.data || [];

    albums.value = list.map((a) => ({
      id: a.albumId,
      title: a.albumTitle,
      description: a.description,
      createdAt: a.createdAt,
      photoCount: Array.isArray(a.photos) ? a.photos.length : 0,
      coverUrl:
        Array.isArray(a.photos) && a.photos.length > 0
          ? a.photos[0].photoUrl
          : "https://i.postimg.cc/L5pNS6fB/album-placeholder.png",
    }));
  } catch (e) {
    console.error("[Album] fetchAlbumsForChild error", e);
    $q.notify({
      type: "negative",
      message: "Không lấy được danh sách album của bé.",
    });
  } finally {
    loading.value = false;
  }
}

// ---- CHỌN BÉ ----
function selectChild(s) {
  child.value = { ...child.value, ...s };
  fetchAlbumsForChild(s.id);
}

// reload album hiện tại
function reloadAlbums() {
  if (child.value.id) {
    fetchAlbumsForChild(child.value.id);
  }
}

// ---- ACTION NHỎ ----
function openChildDetail() {
  $q.notify({
    type: "info",
    message: "Sau này sẽ mở trang chi tiết hồ sơ bé.",
  });
}

function openAlbum(album) {
  console.log("Open album", album);
  $q.notify({
    type: "info",
    message: `Mở album: ${album.title}`,
  });
}

onMounted(() => {
  if (auth.accessToken) {
    fetchParentAndChildren();
  } else {
    $q.notify({
      type: "warning",
      message: "Bạn chưa đăng nhập.",
    });
  }
});
</script>

<style scoped>
.album-page {
  background: linear-gradient(180deg, #fef9ff, #f5f7fb);
  padding-bottom: 64px; /* chừa chỗ cho bottom tabs */
}

.album-scroll {
  max-width: 520px;
  margin: 0 auto;
}

/* --- THẺ CON CỦA BẠN --- */
.child-section {
  position: relative;
}

.child-label {
  font-size: 11px;
  color: #9ca3af;
}

.child-card {
  position: relative;
  overflow: hidden;
  margin-top: 4px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 22px rgba(15, 40, 80, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.95);
}

.child-card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, #ffe4f1 0, transparent 45%),
    radial-gradient(circle at bottom right, #dbeafe 0, transparent 50%);
  opacity: 0.85;
}

.child-card-content {
  position: relative;
  z-index: 1;
  padding: 12px 14px 10px;
}

.child-avatar {
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

/* các hàng thông tin */
.info-row {
  font-size: 12px;
  color: #4b5563;
  margin-top: 2px;
}

.info-icon {
  color: #60a5fa;
  margin-right: 4px;
}

.info-label {
  font-weight: 600;
  margin-right: 4px;
}

.info-value {
  flex: 1;
  min-width: 0;
}

/* chọn bé */
.children-switch .scroll-x {
  overflow-x: auto;
}

.children-chip {
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.15);
}

/* hiển/ẩn nút xem chi tiết theo màn hình */
.hide-on-very-small {
  display: block;
}

.show-on-very-small {
  display: none;
}

@media (max-width: 360px) {
  .hide-on-very-small {
    display: none;
  }
  .show-on-very-small {
    display: flex;
  }
}

/* --- HEADER ALBUM --- */
.section-header {
  margin-top: 2px;
}

.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f97373, #fb923c);
}

/* --- ALBUM CARD --- */
.album-card {
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(15, 40, 80, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.9);
  cursor: pointer;
  overflow: hidden;
}

.album-cover-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 ratio */
  overflow: hidden;
}

.album-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-photo-count {
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  display: inline-flex;
  align-items: center;
}

/* mô tả album */
.album-desc {
  line-height: 1.3;
}

/* multi-line ellipsis */
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* màn nhỏ */
@media (max-width: 380px) {
  .child-card {
    border-radius: 18px;
  }
  .album-card {
    border-radius: 16px;
  }
}
</style>
