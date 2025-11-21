<template>
  <q-page class="album-detail-page">
    <div class="album-detail-scroll q-pa-md q-pt-sm">
      <!-- Thanh tiêu đề + back -->
      <div class="row items-center q-mb-md">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          @click="goBack"
        />
        <div class="text-subtitle1 text-weight-medium q-ml-sm ellipsis">
          {{ album.title || "Album ảnh" }}
        </div>
      </div>

      <q-card class="album-detail-card" v-if="!loading">
        <!-- Ảnh cover -->
        <q-img
          :src="coverUrl"
          ratio="16/9"
          class="album-cover-main"
          :alt="album.title"
        >
          <div class="absolute-bottom-left text-white text-caption q-pa-sm">
            {{ formatDate(album.createdAt) }}
          </div>
          <div class="absolute-top-right q-pa-sm">
            <q-badge color="pink-4" text-color="white" class="text-caption">
              {{ album.photos.length }} ảnh
            </q-badge>
          </div>
        </q-img>

        <q-card-section>
          <div class="text-body1 text-weight-semibold q-mb-xs">
            {{ album.title }}
          </div>
          <div
            v-if="album.description"
            class="text-caption text-grey-7 q-mb-sm"
          >
            {{ album.description }}
          </div>
        </q-card-section>
      </q-card>

      <q-card v-else flat class="q-pa-md">
        <q-inner-loading showing>
          <q-spinner-dots size="32px" color="primary" />
        </q-inner-loading>
      </q-card>

      <!-- GRID ẢNH -->
      <section v-if="album.photos.length" class="q-mt-md">
        <div class="row items-center q-mb-xs section-title">
          <q-icon
            name="photo_library"
            size="18px"
            class="q-mr-xs text-primary"
          />
          <span>Hình ảnh trong album</span>
        </div>

        <div class="photo-grid q-mt-xs">
          <q-img
            v-for="(p, idx) in album.photos"
            :key="p.id || idx"
            :src="p.photoUrl"
            :alt="p.caption || album.title"
            class="photo-item"
            ratio="1"
            spinner-color="primary"
            @click="openViewer(idx)"
          >
            <div
              v-if="p.caption"
              class="absolute-bottom text-white text-caption q-pa-xs bg-black-50"
            >
              {{ p.caption }}
            </div>
          </q-img>
        </div>
      </section>

      <section v-else-if="!loading" class="q-mt-md">
        <q-banner class="bg-blue-1 text-blue-8" rounded>
          <template #avatar>
            <q-icon name="image_not_supported" />
          </template>
          Album này hiện chưa có hình ảnh.
        </q-banner>
      </section>
    </div>

    <!-- VIEWER FULLSCREEN -->
    <q-dialog v-model="viewer.show" maximized transition-show="fade" transition-hide="fade">
      <q-card class="bg-black album-viewer-card">
        <q-btn
          flat
          round
          dense
          icon="close"
          class="absolute-top-right q-ma-sm text-white"
          v-close-popup
        />

        <div class="fit column items-center justify-center">
          <q-img
            v-if="currentPhoto"
            :src="currentPhoto.photoUrl"
            :alt="currentPhoto.caption || album.title"
            class="viewer-img"
            spinner-color="white"
            fit="contain"
          />
          <div
            v-if="currentPhoto?.caption"
            class="text-white text-caption q-mt-sm q-px-md text-center"
          >
            {{ currentPhoto.caption }}
          </div>

          <!-- Nút prev/next -->
          <div class="viewer-nav row justify-between full-width q-px-md q-mt-md">
            <q-btn
              flat
              dense
              no-caps
              icon="chevron_left"
              color="white"
              @click="prevPhoto"
              :disable="album.photos.length <= 1"
            />
            <div class="text-white text-caption">
              {{ viewer.index + 1 }} / {{ album.photos.length }}
            </div>
            <q-btn
              flat
              dense
              no-caps
              icon="chevron_right"
              color="white"
              @click="nextPhoto"
              :disable="album.photos.length <= 1"
            />
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const loading = ref(true);
const album = ref({
  id: null,
  title: "",
  description: "",
  createdAt: null,
  photos: [],
});

// viewer state
const viewer = ref({
  show: false,
  index: 0,
});

const coverUrl = computed(() => {
  if (album.value.photos.length > 0) {
    return album.value.photos[0].photoUrl;
  }
  return "https://i.postimg.cc/L5pNS6fB/album-placeholder.png";
});

const currentPhoto = computed(
  () => album.value.photos[viewer.value.index] || null
);

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function goBack() {
  router.back();
}

// mở viewer
function openViewer(idx) {
  viewer.value.index = idx;
  viewer.value.show = true;
}

function prevPhoto() {
  if (album.value.photos.length <= 1) return;
  viewer.value.index =
    (viewer.value.index - 1 + album.value.photos.length) %
    album.value.photos.length;
}

function nextPhoto() {
  if (album.value.photos.length <= 1) return;
  viewer.value.index =
    (viewer.value.index + 1) % album.value.photos.length;
}

// gọi API lấy chi tiết album
async function fetchAlbumDetail() {
  const albumId = route.params.albumId;
  const parentId = localStorage.getItem("currentParentId");
  const studentId = localStorage.getItem("currentStudentId");

  if (!albumId || !parentId || !studentId) {
    $q.notify({
      type: "negative",
      message: "Thiếu thông tin để tải album. Hãy quay lại và thử lại.",
    });
    goBack();
    return;
  }

  try {
    loading.value = true;
    const res = await api.get(
      `/parents/${parentId}/children/${studentId}/albums/${albumId}`
    );
    const apiAlbum = res.data?.data;

    if (!apiAlbum) {
      throw new Error("Không tìm thấy dữ liệu album");
    }

    album.value = {
      id: apiAlbum.albumId,
      title: apiAlbum.albumTitle,
      description: apiAlbum.description,
      createdAt: apiAlbum.createdAt,
      photos: Array.isArray(apiAlbum.photos) ? apiAlbum.photos : [],
    };
  } catch (err) {
    console.error("[AlbumDetail] fetchAlbumDetail error", err);
    $q.notify({
      type: "negative",
      message: "Không tải được thông tin album.",
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchAlbumDetail();
});
</script>

<style scoped>
.album-detail-page {
  background: linear-gradient(180deg, #fef9ff, #f5f7fb);
  padding-bottom: 64px;
}

.album-detail-scroll {
  max-width: 520px;
  margin: 0 auto;
}

.album-detail-card {
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 40, 80, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.95);
}

.album-cover-main {
  max-height: 260px;
}

/* GRID ẢNH */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.photo-item {
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
}

/* viewer */
.album-viewer-card {
  border-radius: 0;
}

.viewer-img {
  width: 100%;
  max-height: 80vh;
}

.bg-black-50 {
  background: rgba(0, 0, 0, 0.4);
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
}
</style>
