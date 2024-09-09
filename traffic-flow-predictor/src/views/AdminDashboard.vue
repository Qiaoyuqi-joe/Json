<template>
  <div class="station-dashboard">
    <!-- 添加标题 -->

    <!-- 左侧地图搜索和显示部分 -->
    <div class="left-section">
      <div class="search-container">
        <input
          v-model="searchQuery"
          @keyup.enter="searchStation"
          placeholder="输入基站ID进行搜索"
          class="search-input"
        />
        <button @click="searchStation" class="search-button">搜索</button>
      </div>
      <div id="map-container" class="map-container"></div>
      <!-- 地图容器 -->
    </div>

    <!-- 右侧基站信息和图表展示部分 -->
    <div class="right-section">
      <h2>{{ stationInfo.name }}基站视图图</h2>
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
import AMapLoader from "@amap/amap-jsapi-loader";
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import "@/assets/Styles.css"; // 引入外部 CSS 文件

// 模拟基站数据

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

const searchQuery = ref(""); // 基站ID搜索输入框绑定的变量
const stationInfo = ref({
  name: "",
  id: "",
  ip: "",
  mac: "",
});
const users = ref([]); // 用户列表

// 地图相关变量和逻辑
let placeSearch;
let map;
let AMap;
let myChart; // 定义全局变量来保存图表实例

// 初始化地图和相关功能
function initMap() {
  window._AMapSecurityConfig = {
    securityJsCode: "934e3abdf65d36a21caae3a069789da3",
  };

  AMapLoader.load({
    key: "7778b36918b20db096abc451498af897",
    version: "2.0",
    plugins: ["AMap.ToolBar", "AMap.Scale", "AMap.PlaceSearch"],
  })
    .then((loadedAMap) => {
      AMap = loadedAMap;
      map = new AMap.Map("map-container", {
        viewMode: "3D",
        zoom: 13,
        center: [116.397428, 39.90923], // 默认中心位置，北京
      });

      AMap.plugin(["AMap.ToolBar", "AMap.Scale"], function () {
        map.addControl(new AMap.ToolBar());
        map.addControl(new AMap.Scale());
      });

      placeSearch = new AMap.PlaceSearch({ map: map });
    })
    .catch((e) => console.log(e));
}

// 搜索基站并更新地图位置
// 使用 IP 地址获取经纬度并更新地图位置
/*
async function getCoordinatesByIP(ip) {
  const apiKey = "7778b36918b20db096abc451498af897"; // 替换为你的高德 API key
  const url = `https://restapi.amap.com/v3/ip?ip=${ip}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "1") {
      const rectangle = data.rectangle;
      if (rectangle) {
        // 解析 rectangle，获取经纬度范围并计算中心点
        const coords = rectangle.split(";");
        const coord1 = coords[0].split(",");
        const coord2 = coords[1].split(",");

        const lng = (parseFloat(coord1[0]) + parseFloat(coord2[0])) / 2;
        const lat = (parseFloat(coord1[1]) + parseFloat(coord2[1])) / 2;

        // 返回中心经纬度
        return { lng, lat };
      }
    } else {
      console.error("IP 定位失败", data.info);
    }
  } catch (error) {
    console.error("请求失败", error);
  }

  return null;
}
*/
// 搜索基站并更新地图位置
async function searchStation() {
  if (!placeSearch) {
    console.error("placeSearch 未定义");
    return;
  }

  const searchID = searchQuery.value.trim();

  if (searchID) {
    const station = stations[searchID]; // 根据ID从stations对象中查找
    if (station) {
      // 如果找到基站，先更新右侧的基站信息
      stationInfo.value = station;
      users.value = station.users;
      updateChart(station.trafficData); // 更新图表

      // 使用IP获取经纬度并更新地图
      // const coords = await getCoordinatesByIP(station.ip);
      // if (coords) {
      //  const { lng, lat } = coords;
      //    map.setCenter([lng, lat]); // 更新地图中心
      //    addMarker([lng, lat]); // 添加标记
      //    console.log("地图更新到该 IP 对应的位置:", lng, lat);
      //  } else {
      //    console.error("IP 地址未能成功获取地理位置");
      //  }
      //} else {
      //  console.error("没有找到对应的基站。");
      //}
      //} else {
      //  console.error("请输入基站ID进行搜索");

      const coords = station.coordinates;
      if (coords) {
        map.setCenter(coords); // 更新地图中心
        addMarker(coords); // 添加标记
        console.log("地图更新到基站的位置:", coords[0], coords[1]);
      } else {
        console.error("没有为基站指定经纬度");
      }
    } else {
      console.error("没有找到对应的基站。");
    }
  } else {
    console.error("请输入基站ID进行搜索");
  }
}

// 更新图表数据
// 更新图表数据
function updateChart(data) {
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
}

function addMarker(lnglat) {
  // 创建带自定义图标的标记
  const marker = new AMap.Marker({
    position: lnglat,
    map: map,
    icon: new AMap.Icon({
      size: new AMap.Size(40, 50), // 图标大小
      image: require("@/components/station-icon.png"), // 使用相对路径引用图片// 自定义图标的路径
      imageSize: new AMap.Size(40, 50), // 设置图标实际显示的大小
    }),
    offset: new AMap.Pixel(-20, -50), // 调整标记位置，使其与经纬度对齐
  });

  map.add(marker); // 在地图上添加标记
}
// 初始化图表函数
function initChart() {
  const chartDom = document.getElementById("trafficChart");
  myChart = echarts.init(chartDom); // 初始化 ECharts 实例

  // 初始化图表配置
  const option = {
    tooltip: {
      trigger: "axis", // 触发类型，'axis' 表示整个坐标轴触发
      axisPointer: {
        // 坐标轴指示器，坐标轴触发有效
        type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
      },
      formatter: function (params) {
        // 返回一个自定义的显示内容
        const business = params
          .map((p) => `${p.seriesName}: ${p.value}`)
          .join("<br/>");
        return `时间: ${params[0].axisValue}<br/>${business}`;
      },
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
      ],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "业务A",
        data: [], // 初始化为空
        type: "bar",
        stack: "total",
        color: "#7EFDF4",
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
        data: [], // 初始化为空
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
        data: [], // 初始化为空
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

  myChart.setOption(option); // 设置图表
}

onMounted(() => {
  initMap(); // 初始化地图
  initChart(); // 初始化图表结构
  searchStation(); // 加载基站1的数据并更新图表
});
</script>
