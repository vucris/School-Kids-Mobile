<template>
  <q-page class="feature-page">
    <!-- HEADER NHỎ GỌN -->
    <div class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
         <div class="header-mascot">
          <span class="mascot-emoji">👶</span>
        </div>
        <div class="header-text">
          <h1>Tính năng</h1>
          <p>Cùng bé khám phá mỗi ngày! </p>
        </div>
      </div>
    </div>

    <!-- DANH SÁCH TÍNH NĂNG -->
    <div class="features-scroll q-pa-md">
      <!-- Quick Actions Grid - Giống hình mẫu -->
      <section class="quick-section">
        <div class="quick-grid">
          <div
            v-for="item in allFeatures"
            :key="item. key"
            class="quick-item"
            @click="go(item)"
          >
            <div class="quick-card">
              <div class="icon-wrapper" :class="item.iconBg">
                <!-- Custom SVG Icons -->
                <component :is="item. iconComponent" class="feature-icon" />
              </div>
              <span class="quick-label">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </section>


    </div>
  </q-page>
</template>

<script setup>
import { h } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Icon Components
const IconAlbum = {
  render() {
    return h("svg", { viewBox: "0 0 48 48", fill: "none" }, [
      h("rect", { x: "6", y: "8", width: "36", height: "32", rx: "4", fill: "#E0F2FE" }),
      h("rect", { x: "10", y: "12", width: "16", height: "12", rx: "2", fill: "#38BDF8" }),
      h("rect", { x: "28", y: "12", width: "10", height: "5", rx: "1", fill: "#7DD3FC" }),
      h("rect", { x: "28", y: "19", width: "10", height: "5", rx: "1", fill: "#BAE6FD" }),
      h("circle", { cx: "18", cy: "32", r: "4", fill: "#0EA5E9" }),
      h("circle", { cx: "30", cy: "32", r: "4", fill: "#38BDF8" }),
    ]);
  },
};


const IconLeave = {
  render() {
    return h("svg", { viewBox: "0 0 48 48", fill: "none" }, [
      h("rect", { x: "10", y: "6", width: "28", height: "36", rx: "3", fill: "#DBEAFE" }),
      h("rect", { x: "14", y: "12", width: "8", height: "8", rx: "1", fill: "#60A5FA" }),
      h("rect", { x: "26", y: "12", width: "8", height: "3", rx: "1", fill: "#93C5FD" }),
      h("rect", { x: "26", y: "18", width: "8", height: "3", rx: "1", fill: "#93C5FD" }),
      h("circle", { cx: "36", cy: "34", r: "8", fill: "#10B981" }),
      h("path", { d: "M33 34L35 36L39 32", stroke: "white", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
    ]);
  },
};

const IconAttendance = {
  render() {
    return h("svg", { viewBox: "0 0 48 48", fill: "none" }, [
      h("circle", { cx: "24", cy: "24", r: "18", fill: "#FEE2E2" }),
      h("path", { d: "M24 10C24 10 20 14 20 20C20 26 24 28 24 28C24 28 28 26 28 20C28 14 24 10 24 10Z", fill: "#F87171" }),
      h("circle", { cx: "24", cy: "18", r: "3", fill: "#FECACA" }),
      h("path", { d: "M18 32C18 32 20 36 24 36C28 36 30 32 30 32", stroke: "#F87171", "stroke-width": "2", "stroke-linecap": "round" }),
      h("circle", { cx: "12", cy: "18", r: "4", fill: "#60A5FA" }),
      h("path", { d: "M10 17L12 19L15 15", stroke: "white", "stroke-width": "1. 5", "stroke-linecap": "round" }),
    ]);
  },
};

const IconHealth = {
  render() {
    return h("svg", { viewBox: "0 0 48 48", fill: "none" }, [
      h("ellipse", { cx: "24", cy: "30", rx: "14", ry: "10", fill: "#FECDD3" }),
      h("ellipse", { cx: "24", cy: "28", rx: "10", ry: "7", fill: "#FDA4AF" }),
      h("path", { d: "M24 16C20 16 17 19 17 23C17 28 24 34 24 34C24 34 31 28 31 23C31 19 28 16 24 16Z", fill: "#F43F5E" }),
      h("path", { d: "M22 22L24 24L28 20", stroke: "white", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
    ]);
  },
};

const IconFee = {
  render() {
    return h("svg", { viewBox: "0 0 48 48", fill: "none" }, [
      h("circle", { cx: "20", cy: "28", r: "14", fill: "#DBEAFE" }),
      h("circle", { cx: "20", cy: "28", r: "10", fill: "#93C5FD" }),
      h("text", { x: "20", y: "32", "text-anchor": "middle", fill: "#1D4ED8", "font-size": "12", "font-weight": "bold" }, "$"),
      h("circle", { cx: "36", cy: "16", r: "8", fill: "#60A5FA" }),
      h("path", { d: "M33 16L35 14L39 18", stroke: "white", "stroke-width": "2", "stroke-linecap": "round" }),
    ]);
  },
};

const IconMenu = {
  render() {
    return h("svg", { viewBox: "0 0 48 48", fill: "none" }, [
      h("rect", { x: "8", y: "12", width: "32", height: "28", rx: "4", fill: "#FEF3C7" }),
      h("rect", { x: "12", y: "16", width: "24", height: "6", rx: "2", fill: "#FBBF24" }),
      h("circle", { cx: "16", cy: "30", r: "4", fill: "#F97316" }),
      h("circle", { cx: "26", cy: "30", r: "4", fill: "#FB923C" }),
      h("rect", { x: "32", y: "26", width: "6", height: "8", rx: "2", fill: "#FCD34D" }),
      h("path", { d: "M20 8L24 4L28 8", stroke: "#F59E0B", "stroke-width": "2", "stroke-linecap": "round" }),
    ]);
  },
};

const IconFeedback = {
  render() {
    return h("svg", { viewBox: "0 0 48 48", fill: "none" }, [
      h("path", { d: "M8 12C8 9. 79086 9.79086 8 12 8H36C38.2091 8 40 9.79086 40 12V28C40 30. 2091 38. 2091 32 36 32H20L12 40V32H12C9.79086 32 8 30.2091 8 28V12Z", fill: "#E0E7FF" }),
      h("circle", { cx: "16", cy: "20", r: "2", fill: "#6366F1" }),
      h("circle", { cx: "24", cy: "20", r: "2", fill: "#6366F1" }),
      h("circle", { cx: "32", cy: "20", r: "2", fill: "#6366F1" }),
      h("path", { d: "M16 26C16 26 20 28 24 28C28 28 32 26 32 26", stroke: "#818CF8", "stroke-width": "2", "stroke-linecap": "round" }),
    ]);
  },
};

// const IconActivity = {
//   render() {
//     return h("svg", { viewBox: "0 0 48 48", fill: "none" }, [
//       h("circle", { cx: "16", cy: "16", r: "6", fill: "#C4B5FD" }),
//       h("circle", { cx: "32", cy: "20", r: "8", fill: "#A78BFA" }),
//       h("circle", { cx: "20", cy: "32", r: "10", fill: "#8B5CF6" }),
//       h("path", { d: "M14 10L16 6L18 10", stroke: "#7C3AED", "stroke-width": "1.5", "stroke-linecap": "round" }),
//       h("path", { d: "M30 12L32 8L34 12", stroke: "#7C3AED", "stroke-width": "1.5", "stroke-linecap": "round" }),
//       h("text", { x: "16", y: "18", "text-anchor": "middle", fill: "white", "font-size": "8" }, "♪"),
//       h("text", { x: "32", y: "23", "text-anchor": "middle", fill: "white", "font-size": "10" }, "♫"),
//     ]);
//   },
// };

const allFeatures = [
  {
    key: "album",
    label: "Album ảnh",
    iconComponent: IconAlbum,
    iconBg: "bg-sky",
    route: "/feed",
  },
  // {
  //   key: "post",
  //   label: "Bài viết",
  //   iconComponent: IconPost,
  //   iconBg: "bg-emerald",
  //   route: "/posts",
  // },
  {
    key: "leave",
    label: "Xin nghỉ",
    iconComponent: IconLeave,
    iconBg: "bg-blue",
    route: "leave",
  },
  {
    key: "attendance",
    label: "Điểm danh",
    iconComponent: IconAttendance,
    iconBg: "bg-rose",
    route: "/attendance",
  },
  {
    key: "health",
    label: "Sức khỏe",
    iconComponent: IconHealth,
    iconBg: "bg-pink",
    route: "/health",
  },
  {
    key: "fee",
    label: "Học phí",
    iconComponent: IconFee,
    iconBg: "bg-indigo",
    route: "/fee/student",
  },
  {
    key: "menu",
    label: "Thực đơn",
    iconComponent: IconMenu,
    iconBg: "bg-amber",
    route: "/menu",
  },
  {
    key: "feedback",
    label: "Góp ý",
    iconComponent: IconFeedback,
    iconBg: "bg-violet",
    route: "/feedback",
  },
  // {
  //   key: "activity",
  //   label: "Hoạt động",
  //   iconComponent: IconActivity,
  //   iconBg: "bg-purple",
  //   route: "/activities",
  // },
];

function go(item) {
  if (item.route) {
    router. push(item.route);
  }
}
</script>

<style scoped>
.feature-page {
  background: linear-gradient(180deg, #fef7ff 0%, #f0f9ff 50%, #fdf4ff 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}

/* ===== HEADER ===== */
. page-header {
  position: relative;
  padding: 16px 16px 20px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #f472b6 0%, #a78bfa 50%, #818cf8 100%);
  border-radius: 0 0 28px 28px;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-mascot {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.mascot-img {
  width: 36px;
  height: 36px;
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
  color: rgba(255, 255, 255, 0.9);
}

/* ===== FEATURES SCROLL ===== */
.features-scroll {
  margin-top: -8px;
  position: relative;
  z-index: 2;
}

/* ===== QUICK SECTION ===== */
.quick-section {
  margin-bottom: 20px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.quick-item {
  cursor: pointer;
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.quick-card:active {
  transform: scale(0.95);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.feature-icon {
  width: 40px;
  height: 40px;
}

.quick-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  line-height: 1.3;
}

/* Icon backgrounds */
.bg-sky { background: linear-gradient(135deg, #e0f2fe, #bae6fd); }
.bg-emerald { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
.bg-blue { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
.bg-rose { background: linear-gradient(135deg, #ffe4e6, #fecdd3); }
.bg-pink { background: linear-gradient(135deg, #fce7f3, #fbcfe8); }
.bg-indigo { background: linear-gradient(135deg, #e0e7ff, #c7d2fe); }
.bg-amber { background: linear-gradient(135deg, #fef3c7, #fde68a); }
. bg-violet { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }
.bg-purple { background: linear-gradient(135deg, #f3e8ff, #e9d5ff); }

/* ===== FOOTER ===== */
.page-footer {
  text-align: center;
  padding: 24px 16px 32px;
}

.footer-art {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 10px;
  font-size: 22px;
}

.page-footer p {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 380px) {
  .header-text h1 {
    font-size: 18px;
  }

  . header-mascot {
    width: 46px;
    height: 46px;
  }

  .quick-grid {
    gap: 12px;
  }

  .quick-card {
    padding: 12px 6px;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .feature-icon {
    width: 32px;
    height: 32px;
  }

  .quick-label {
    font-size: 11px;
  }
}
</style>
