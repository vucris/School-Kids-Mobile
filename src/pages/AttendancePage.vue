<template>
  <q-page class="attendance-page">
    <!-- Tabs -->
    <div class="tabs-wrapper">
      <q-tabs
        v-model="tab"
        class="bg-white text-primary"
        indicator-color="primary"
        active-color="primary"
        align="justify"
        dense
      >
        <q-tab name="attendance" label="Điểm danh" />
        <q-tab name="leave" label="Đơn xin nghỉ" />
      </q-tabs>
    </div>

    <div class="q-pa-md q-pt-sm">
      <!-- chọn tháng -->
      <div class="row items-center justify-between month-picker q-mb-md">
        <q-btn
          flat
          round
          dense
          icon="chevron_left"
          @click="prevMonth"
        />
        <div class="month-label row items-center">
          <q-icon name="event" size="18px" class="q-mr-xs text-primary" />
          <span>{{ monthLabel }}</span>
        </div>
        <q-btn
          flat
          round
          dense
          icon="chevron_right"
          @click="nextMonth"
        />
      </div>

      <!-- thống kê -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-3" v-for="box in summaryBoxes" :key="box.key">
          <q-card class="summary-card" :class="box.class">
            <div class="summary-number">{{ box.value }}</div>
            <div class="summary-label">{{ box.label }}</div>
          </q-card>
        </div>
      </div>

      <!-- danh sách theo tuần -->
      <div class="q-gutter-md">
        <q-card
          v-for="week in weeks"
          :key="week.range"
          class="week-card"
        >
          <q-card-section class="q-pb-xs">
            <div class="text-caption text-grey-7 text-center">
              {{ week.range }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pt-xs q-pb-xs">
            <div
              v-for="day in week.days"
              :key="week.range + day.date"
              class="day-row row items-center justify-between"
            >
              <div class="text-caption text-grey-7">
                <span class="text-weight-medium">{{ day.weekday }}</span>
                <span class="q-ml-xs">{{ day.date }}</span>
              </div>

              <div class="day-status" :class="day.type">
                {{ day.label }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- nút viết đơn xin nghỉ -->
      <div class="q-mt-lg q-mb-md">
        <q-btn
          class="write-leave-btn full-width"
          outline
          rounded
          no-caps
          color="primary"
          @click="writeLeave"
        >
          <q-icon name="edit_note" size="18px" class="q-mr-xs" />
          Viết đơn xin nghỉ phép
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';

const tab = ref('attendance');

// demo: tháng 6/2024
const monthIndex = ref(5); // 0-11
const year = ref(2024);

const monthLabel = computed(() => {
  const month = monthIndex.value + 1;
  return `Tháng ${month}/${year.value}`;
});

// thống kê demo
const summary = ref({
  total: 26,
  present: 20,
  excused: 5,
  unexcused: 1
});

const summaryBoxes = computed(() => [
  { key: 'total', label: 'Tất cả', value: summary.value.total, class: 'box-total' },
  { key: 'present', label: 'Đi học', value: summary.value.present, class: 'box-present' },
  { key: 'excused', label: 'Nghỉ phép', value: summary.value.excused, class: 'box-excused' },
  { key: 'unexcused', label: 'Không phép', value: summary.value.unexcused, class: 'box-unexcused' }
]);

// dữ liệu điểm danh demo
const weeks = ref([
  {
    range: '20/06/2024 - 27/06/2024',
    days: [
      { weekday: 'Thứ 6', date: '30/06', label: 'Đi học', type: 'present' },
      { weekday: 'Thứ 5', date: '29/06', label: 'Nghỉ phép', type: 'excused' },
      { weekday: 'Thứ 4', date: '28/06', label: 'Không phép', type: 'unexcused' },
      { weekday: 'Thứ 3', date: '27/06', label: 'Đi học', type: 'present' },
      { weekday: 'Thứ 2', date: '26/06', label: 'Đi học', type: 'present' }
    ]
  },
  {
    range: '13/06/2024 - 19/06/2024',
    days: [
      { weekday: 'Thứ 6', date: '23/06', label: 'Đi học', type: 'present' },
      { weekday: 'Thứ 5', date: '22/06', label: 'Nghỉ phép', type: 'excused' },
      { weekday: 'Thứ 4', date: '21/06', label: 'Đi học', type: 'present' },
      { weekday: 'Thứ 3', date: '20/06', label: 'Đi học', type: 'present' },
      { weekday: 'Thứ 2', date: '19/06', label: 'Đi học', type: 'present' }
    ]
  }
]);

function prevMonth() {
  if (monthIndex.value === 0) {
    monthIndex.value = 11;
    year.value -= 1;
  } else {
    monthIndex.value -= 1;
  }
}

function nextMonth() {
  if (monthIndex.value === 11) {
    monthIndex.value = 0;
    year.value += 1;
  } else {
    monthIndex.value += 1;
  }
}

function writeLeave() {
  // sau này chuyển sang màn viết đơn xin nghỉ
  console.log('Viết đơn xin nghỉ phép');
}
</script>

<style scoped>
.attendance-page {
  background: #f5f7fb;
  padding-bottom: 64px;
}

.tabs-wrapper {
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.08);
  z-index: 2;
}

/* chọn tháng */
.month-picker {
  background: #ffffff;
  border-radius: 14px;
  padding: 6px 8px;
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.08);
}

.month-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

/* thống kê */
.summary-card {
  border-radius: 16px;
  text-align: center;
  padding: 6px 4px;
  font-size: 11px;
  box-shadow: 0 2px 6px rgba(15, 40, 80, 0.06);
  background: #ffffff;
}

.summary-number {
  font-size: 16px;
  font-weight: 700;
}

.summary-label {
  margin-top: 2px;
  color: #6b7280;
}

/* màu cho từng box */
.box-total .summary-number {
  color: #4b5563;
}
.box-present .summary-number {
  color: #16a34a;
}
.box-excused .summary-number {
  color: #f59e0b;
}
.box-unexcused .summary-number {
  color: #dc2626;
}

/* card theo tuần */
.week-card {
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 3px 10px rgba(15, 40, 80, 0.08);
}

/* từng dòng ngày */
.day-row {
  padding: 6px 4px;
  border-radius: 10px;
  margin-bottom: 4px;
}

.day-row:last-child {
  margin-bottom: 0;
}

.day-status {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}

/* trạng thái màu nền giống app */
.day-status.present {
  background: #e3f9e5;
  color: #15803d;
}

.day-status.excused {
  background: #fff7e6;
  color: #b45309;
}

.day-status.unexcused {
  background: #fee2e2;
  color: #b91c1c;
}

/* nút viết đơn */
.write-leave-btn {
  border-style: dashed;
  border-width: 1.5px;
  background: #f9fafb;
}
</style>
