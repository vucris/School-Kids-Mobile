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
        <q-card-section class="q-pb-sm">
          <div class="text-body2 text-weight-medium">
            {{ chartTitle }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-xs">
          <div class="chart-box">
            <div class="chart-inner">
              <!-- trục Y -->
              <div class="y-axis">
                <span
                  v-for="mark in yMarks"
                  :key="mark"
                >
                  {{ mark }}
                </span>
              </div>

              <!-- cột -->
              <div class="bars-wrapper">
                <div class="bars-row">
                  <div
                    v-for="m in measurements"
                    :key="m.month"
                    class="bar-item"
                  >
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
                  <span class="x-unit-right">Tháng</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Lịch sử đo -->
      <div class="q-mt-lg">
        <div class="text-body2 text-weight-medium q-mb-sm">
          Lịch sử đo
        </div>

        <q-card class="history-card">
          <q-list>
            <q-item
              v-for="m in measurements"
              :key="m.month"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <div class="month-pill column items-center justify-center">
                  <span class="month-number">{{ m.month }}</span>
                  <span class="month-label">Tháng</span>
                </div>
              </q-item-section>

              <q-item-section>
                <div class="row items-center q-col-gutter-sm">
                  <div class="col-auto">
                    <div class="value-main">
                      {{ m.height.toFixed(2) }}
                      <span class="value-unit">cm</span>
                    </div>
                    <div class="value-sub">
                      {{ m.weight.toFixed(2) }} kg
                    </div>
                  </div>
                </div>
              </q-item-section>

              <q-item-section side>
                <div class="status-tag" :class="statusClass(m.status)">
                  {{ m.status }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Nút thêm cân đo -->
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
import { ref, computed } from 'vue';

const tab = ref('height');

// data demo – sau này thay bằng API BE
const measurements = ref([
  { month: 55, height: 130, weight: 40, bmi: 23.7, status: 'Béo phì' },
  { month: 40, height: 140, weight: 19, bmi: 14.5, status: 'Bình thường' },
  { month: 28, height: 120, weight: 19, bmi: 13.2, status: 'Thiếu cân' },
  { month: 24, height: 110, weight: 17, bmi: 14.0, status: 'Bình thường' },
  { month: 18, height: 105, weight: 16, bmi: 14.5, status: 'Bình thường' },
  { month: 12, height: 98, weight: 14, bmi: 14.6, status: 'Bình thường' },
  { month: 6, height: 85, weight: 11, bmi: 15.2, status: 'Bình thường' }
]);

const chartTitle = computed(() => {
  if (tab.value === 'height') return 'Biểu đồ đo chiều cao theo tuổi cho bé';
  if (tab.value === 'weight') return 'Biểu đồ cân nặng theo tuổi cho bé';
  return 'Biểu đồ BMI theo tuổi cho bé';
});

const yUnit = computed(() => {
  if (tab.value === 'height') return 'cm';
  if (tab.value === 'weight') return 'kg';
  return 'BMI';
});

const valueOf = (m) => {
  if (tab.value === 'height') return m.height;
  if (tab.value === 'weight') return m.weight;
  return m.bmi;
};

const maxValue = computed(() => {
  return Math.max(...measurements.value.map((m) => valueOf(m)));
});

function barHeight(v) {
  if (!maxValue.value) return 0;
  return Math.max(5, (v / maxValue.value) * 100); // tối thiểu 5% cho bar nhỏ
}

const yMarks = computed(() => {
  const step = tab.value === 'bmi' ? 5 : 30;
  const max = tab.value === 'height' ? 150 : tab.value === 'weight' ? 60 : 35;
  const arr = [];
  for (let v = 0; v <= max; v += step) arr.push(v);
  return arr.reverse(); // hiển thị từ trên xuống
});

function statusClass(status) {
  if (!status) return '';
  const s = status.toLowerCase();
  if (s.includes('béo')) return 'status-obese';
  if (s.includes('thiếu')) return 'status-thin';
  return 'status-normal';
}

function addMeasurement() {
  // sau này mở dialog nhập cân đo
  console.log('Thêm cân đo mới');
}
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
  padding: 8px 10px 12px;
}

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
  border-right: 1px solid #d1d5db;
  margin-right: 6px;
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
  justify-content: space-between;
  gap: 4px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar {
  width: 100%;
  max-width: 20px;
  border-radius: 4px 4px 0 0;
  background: #03a9f4;
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
}

/* pill tháng */
.month-pill {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: #ffb300;
  color: white;
  text-align: center;
}

.month-number {
  font-size: 16px;
  font-weight: 700;
}

.month-label {
  font-size: 10px;
}

/* giá trị */
.value-main {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.value-unit {
  font-size: 11px;
  color: #6b7280;
  margin-left: 2px;
}
.value-sub {
  font-size: 11px;
  color: #6b7280;
}

/* trạng thái */
.status-tag {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
  text-align: right;
  min-width: 70px;
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
