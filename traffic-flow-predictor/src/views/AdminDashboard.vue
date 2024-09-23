<template>
  <div class="station-dashboard">
    <!-- 添加标题 -->
    <header class="header">
      <h1>基站视角</h1>
    </header>
    <!-- 左侧地图搜索和显示部分 -->
    <div class="left-section">
      <div class="search-container">
        <input
          v-model="localsearchQuery"
          @keyup.enter="searchStation"
          placeholder="输入基站ID进行搜索"
          class="search-input"
        />
        <button @click="searchStation" class="search-button">搜索</button>
      </div>
      <!-- GeoMap 组件负责显示地图 -->
      <GeoMap />
    </div>

    <!-- 右侧基站信息和图表展示部分 -->
    <div class="right-section">
      <h2>{{ stationInfo.name }}基站视图</h2>
      <div class="station-info">
        <div class="network-info">
          <h3>网络信息</h3>
          <p style="color: #7efdf4">基站ID: {{ stationInfo.id }}</p>
          <p style="color: #7efdf4">基站IP: {{ stationInfo.ip }}</p>
          <p style="color: #7efdf4">基站MAC: {{ stationInfo.mac }}</p>
        </div>
        <div class="user-list">
          <h3>接入用户列表</h3>
          <ul>
            <li
              v-for="user in users"
              :key="user"
              :style="{ color: user === 'WSPN-user1' ? '#FFFEA1' : '#7EFDF4' }"
            >
              {{ user }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 图表展示部分 -->
      <div class="station-chart">
        <h3>24h基站流量-业务类别分布</h3>
        <div id="trafficChart"></div>
        <!-- 图表渲染在这里 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import GeoMap from "@/components/GeoMap.vue"; // 引入GeoMap组件
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex"; // 引入Vuex store
import * as echarts from "echarts";
import "@/assets/Styles.css"; // 引入外部 CSS 文件

const store = useStore();
let myChart;

// 从 Vuex 中获取状态
const stationInfo = computed(() => store.state.stationInfo);
const users = computed(() => stationInfo.value.users || []);
const searchQuery = computed(() => store.state.searchQuery);
const localsearchQuery = ref(searchQuery.value); // 本地双向绑定属性

// 搜索基站并更新 store 中的搜索查询和基站数据

const stations = {
  "WSPN-BS1": {
    name: "基站1",
    id: "WSPN-BS1",
    ip: "10.129.74.83",
    mac: "E4-C7-67-73-08-FC",
    users: ["WSPN-user1", "WSPN-user2", "WSPN-user3"],
    coordinates: [116.359203, 39.963459], // 基站1的24小时流量数据
    trafficData: {
      A: [
        1, 2, 3, 4, 5, 6, 7, 8, 6, 5, 4, 7, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3,
      ], // 业务A的24小时流量
      B: [
        2, 3, 1, 3, 4, 2, 5, 4, 5, 6, 7, 8, 6, 5, 4, 3, 4, 5, 6, 5, 4, 3, 2, 1,
      ], // 业务B的24小时流量
      C: [
        1, 3, 2, 3, 4, 3, 2, 4, 6, 7, 5, 4, 3, 6, 7, 8, 7, 6, 5, 4, 3, 4, 2, 3,
      ], // 业务C的24小时流量
    },
  },
  "WSPN-BS2": {
    name: "基站2",
    id: "WSPN-BS2",
    ip: "10.234.234.234",
    mac: "F5-D8-88-74-09-FD",
    users: ["WSPN-user4", "WSPN-user5", "WSPN-user6"],
    coordinates: [116.356252, 39.960573],
    trafficData: {
      A: [
        2, 4, 6, 4, 2, 3, 5, 7, 6, 5, 4, 3, 2, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1,
      ],
      B: [
        1, 3, 5, 4, 3, 5, 6, 4, 5, 6, 7, 8, 6, 5, 4, 3, 2, 3, 4, 5, 6, 5, 4, 3,
      ],
      C: [
        2, 3, 4, 3, 5, 7, 8, 6, 7, 6, 5, 4, 3, 4, 5, 6, 7, 8, 6, 7, 5, 4, 3, 2,
      ],
    },
  },
  "WSPN-BS3": {
    name: "基站3",
    id: "WSPN-BS3",
    ip: "10.235.235.235",
    mac: "A6-E9-99-75-10-GE",
    users: ["WSPN-user7", "WSPN-user8", "WSPN-user9"],
    coordinates: [116.357975, 39.96069],
    trafficData: {
      A: [
        3, 5, 7, 6, 4, 3, 5, 7, 8, 6, 5, 4, 7, 8, 9, 6, 5, 4, 3, 5, 7, 6, 5, 4,
      ],
      B: [
        1, 3, 4, 3, 2, 3, 4, 5, 6, 5, 4, 3, 2, 4, 6, 7, 8, 6, 5, 4, 3, 5, 6, 7,
      ],
      C: [
        2, 4, 6, 5, 3, 4, 5, 6, 7, 6, 5, 3, 4, 6, 8, 9, 8, 6, 5, 4, 6, 7, 8, 9,
      ],
    },
  },
};

// 搜索基站并更新 store 中的搜索查询和基站数据
const searchStation = () => {
  const searchID = localsearchQuery.value.trim();
  if (searchID) {
    const station = stations[searchID];
    if (station) {
      store.dispatch("updateStationInfo", station);
      store.dispatch("updateCurrentPosition", station.coordinates);
      updateChart(station.trafficData); // 更新图表
    } else {
      console.error("未找到对应的基站");
    }
  }
};
// 更新图表数据
const updateChart = (data) => {
  // 确保 myChart 已经初始化
  if (myChart) {
    const option = {
      series: [
        {
          name: "业务A",
          data: data.A,
        },
        {
          name: "业务B",
          data: data.B,
        },
        {
          name: "业务C",
          data: data.C,
        },
      ],
    };
    myChart.setOption(option); // 更新图表数据
  } else {
    console.error("myChart is not initialized");
  }
};

// 初始化图表函数
const initChart = () => {
  const chartDom = document.getElementById("trafficChart");
  if (chartDom) {
    myChart = echarts.init(chartDom); // 初始化 ECharts 实例

    // 初始化图表配置
    const option = {
      tooltip: {
        trigger: "axis", // 触发类型为整个坐标轴触发
        axisPointer: {
          type: "shadow", // 坐标轴指示器类型，'shadow' 表示显示为阴影
        },
        formatter: function (params) {
          // 自定义的 tooltip 显示内容
          const business = params
            .map((p) => `${p.seriesName}: ${p.value}`)
            .join("<br/>");
          return `时间: ${params[0].axisValue}<br/>${business}`;
        },
      },
      legend: {
        data: ["业务A", "业务B", "业务C"], // 添加图例，显示各业务类型
      },
      xAxis: {
        type: "category",
        data: [
          "0:00",
          "3:00",
          "6:00",
          "9:00",
          "12:00",
          "15:00",
          "18:00",
          "21:00",
        ], // X 轴时间点
        axisLabel: {
          rotate: 30, // X轴标签旋转30度，防止重叠
        },
      },
      yAxis: {
        type: "value", // Y 轴为数值类型
      },
      series: [
        {
          name: "业务A",
          data: [], // 业务A的初始数据为空
          type: "bar", // 显示为柱状图
          stack: "total", // 数据堆叠
          color: "#7EFDF4", // 自定义颜色
          emphasis: {
            focus: "series", // 鼠标悬停时聚焦到整个系列
            itemStyle: {
              borderColor: "#FFD700",
              borderWidth: 2,
            },
          },
        },
        {
          name: "业务B",
          data: [], // 业务B的初始数据为空
          type: "bar",
          stack: "total",
          color: "#BFBCE7",
          emphasis: {
            focus: "series",
            itemStyle: {
              borderColor: "#FFD700",
              borderWidth: 2,
            },
          },
        },
        {
          name: "业务C",
          data: [], // 业务C的初始数据为空
          type: "bar",
          stack: "total",
          color: "#FFFEA1",
          emphasis: {
            focus: "series",
            itemStyle: {
              borderColor: "#FFD700",
              borderWidth: 2,
            },
          },
        },
      ],
    };

    myChart.setOption(option); // 设置图表配置
  } else {
    console.error("chartDom not found");
  }
};

onMounted(() => {
  initChart();
  searchStation(); // 加载基站1的数据并更新图表
});
</script>
