<template>
  <q-layout view="hHh lpR fFf">
    <!-- HEADER -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar class="justify-center">
        <div class="text-subtitle1 text-weight-medium">
          {{ pageTitle }}
        </div>
      </q-toolbar>
    </q-header>

    <!-- NỘI DUNG TRANG -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- BOTTOM TABS -->
    <q-footer bordered class="bg-white">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey-6 full-width"
        active-color="primary"
        indicator-color="transparent"
        align="justify"
      >
        <q-route-tab
          name="feed"
          to="/feed"
          icon="article"
          label="Bảng tin"
        />
        <q-route-tab
          name="features"
          to="/features"
          icon="apps"
          label="Tính năng"
        />
        <q-route-tab
          name="notifications"
          to="/notifications"
          icon="notifications"
          label="Thông báo"
        />
        <q-route-tab
          name="account"
          to="/account"
          icon="person"
          label="Tài khoản"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const tab = ref(route.name ?? 'features');

watch(
  () => route.name,
  name => {
    if (name) tab.value = name;
  },
  { immediate: true }
);

const pageTitleMap = {
  feed: 'Bảng tin',
  features: 'Tính năng',
  notifications: 'Thông báo',
  account: 'Tài khoản'
};

const pageTitle = computed(
  () => pageTitleMap[route.name] || 'Health Tracking'
);
</script>
