<template>
  <div class="app-container">
    <!-- 左侧地图搜索和显示部分 -->
    <div class="left-section">
      <div class="search-container">
        <input
          v-model="searchQuery"
          @keyup.enter="searchLocation"
          placeholder="输入地址进行搜索"
          class="search-input"
        />
        <button @click="searchLocation" class="search-button">搜索</button>
      </div>
      <div id="container" class="map-container"></div>
    </div>

    <!-- 右侧图表展示部分 -->
    <div class="right-section">
      <div class="chart-box">
        <h3>24h 上下行流量 - 时间分布</h3>
        <div id="upDownTrafficChart"></div>
      </div>
      <div class="chart-box">
        <h3>24h 基站流量 - 业务类别分布</h3>
        <div id="baseStationTrafficChart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AMapLoader from "@amap/amap-jsapi-loader";
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import "@/assets/Styles.css"; // 引入外部 CSS 文件

// 地图相关变量和逻辑
const searchQuery = ref("");
const path = ref([]);
const current_position = ref([]);
let placeSearch;
let map;
let AMap;

function addMarker() {
  if (!AMap || !map) return;
  const marker = new AMap.Marker({
    icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
    position: current_position.value,
    offset: new AMap.Pixel(-26, -54),
  });
  marker.setMap(map);
}

function initMap() {
  window._AMapSecurityConfig = {
    securityJsCode: "934e3abdf65d36a21caae3a069789da3",
  };

  AMapLoader.load({
    key: "7778b36918b20db096abc451498af897",
    version: "2.0",
    plugins: [
      "AMap.ToolBar",
      "AMap.Scale",
      "AMap.HawkEye",
      "AMap.MapType",
      "AMap.MouseTool",
      "AMap.PlaceSearch",
    ],
  })
    .then((loadedAMap) => {
      AMap = loadedAMap;
      map = new AMap.Map("container", {
        viewMode: "3D",
        zoom: 13,
      });

      AMap.plugin(
        ["AMap.ToolBar", "AMap.Scale", "AMap.HawkEye", "AMap.MapType"],
        function () {
          map.addControl(new AMap.ToolBar());
          map.addControl(new AMap.Scale());
          map.addControl(new AMap.HawkEye());
          map.addControl(new AMap.MapType());
        },
      );

      placeSearch = new AMap.PlaceSearch({ map: map });

      map.on("click", (e) => {
        current_position.value = [e.lnglat.lng, e.lnglat.lat];
        path.value.push([e.lnglat.lng, e.lnglat.lat]);
        addMarker();
        addPolyLine();
      });

      function addPolyLine() {
        const polyline = new AMap.Polyline({
          path: path.value,
          isOutline: true,
          outlineColor: "#ffeeff",
          borderWeight: 1,
          strokeColor: "#3366FF",
          strokeOpacity: 0.6,
          strokeWeight: 5,
          strokeStyle: "solid",
          lineJoin: "round",
          lineCap: "round",
          zIndex: 50,
        });
        map.add([polyline]);
      }
    })
    .catch((e) => console.log(e));
}

function searchLocation() {
  if (!placeSearch) {
    console.error("placeSearch 未定义");
    return;
  }

  if (searchQuery.value.trim()) {
    placeSearch.search(searchQuery.value, (status, result) => {
      if (status === "complete" && result.info === "OK") {
        const poi = result.poiList.pois[0];
        if (poi) {
          const lnglat = poi.location;
          current_position.value = [lnglat.lng, lnglat.lat];
          map.setCenter(current_position.value);
          addMarker();
        }
      } else {
        console.error("搜索失败:", result);
      }
    });
  }
}

// 初始化图表的选项
const upDownTrafficChartOptions = ref(null);
const baseStationTrafficChartOptions = ref(null);

function loadChartData() {
  // 生成示例代码中的数据
  const xAxisData = [];
  const data1 = [];
  const data2 = [];
  for (var i = 0; i < 100; i++) {
    xAxisData.push("A" + i);
    data1.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5 + 60); // 随机生成上行流量数据
    data2.push((Math.cos(i / 5) * (i / 5 - 10) + i / 6) * 5 + 60); // 随机生成下行流量数据
  }

  // 上下行流量图表的配置
  upDownTrafficChartOptions.value = {
    backgroundColor: "#2d2d2d",
    legend: {
      data: ["上行", "下行"],
      textStyle: {
        color: "#ffffff",
      },
    },
    toolbox: {
      feature: {
        magicType: {
          type: ["stack"],
        },
        dataView: {},
        saveAsImage: {
          pixelRatio: 2,
        },
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    xAxis: {
      data: [
        "0:00",
        "0:30",
        "1:00",
        "1:30",
        "2:00",
        "2:30",
        "3:00",
        "3:30",
        "4:00",
        "4:30",
        "5:00",
        "5:30",
        "6:00",
        "6:30",
        "7:00",
        "7:30",
        "8:00",
        "8:30",
        "9:00",
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30",
        "19:00",
        "19:30",
        "20:00",
        "20:30",
        "21:00",
        "21:30",
        "22:00",
        "22:30",
        "23:00",
        "23:30",
      ],
      axisLine: {
        lineStyle: {
          color: "#ffffff",
        },
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      max: 120,
      axisLine: {
        lineStyle: {
          color: "#ffffff",
        },
      },
    },
    series: [
      {
        name: "上行",
        type: "bar",
        data: data1,
        emphasis: {
          focus: "series",
        },
        animationDelay: function (idx) {
          return idx * 10;
        },
      },
      {
        name: "下行",
        type: "bar",
        data: data2,
        emphasis: {
          focus: "series",
        },
        animationDelay: function (idx) {
          return idx * 10 + 100;
        },
      },
    ],
    animationEasing: "elasticOut",
    animationDelayUpdate: function (idx) {
      return idx * 5;
    },
  };

  // 融合业务类型分布的基站流量图表配置
  const posList = [
    "left",
    "right",
    "top",
    "bottom",
    "inside",
    "insideTop",
    "insideLeft",
    "insideRight",
    "insideBottom",
    "insideTopLeft",
    "insideTopRight",
    "insideBottomLeft",
    "insideBottomRight",
  ];

  const app = {}; // 创建一个空的app对象，用于存储配置参数
  app.config = {
    position: "top", // 默认位置设置
    distance: 10, // 默认距离设置
    align: "center", // 默认对齐方式设置
    verticalAlign: "middle", // 默认垂直对齐方式
    rotate: 0, // 默认旋转角度
  };

  app.configParameters = {
    rotate: {
      min: -90,
      max: 90,
    },
    align: {
      options: {
        left: "left",
        center: "center",
        right: "right",
      },
    },
    verticalAlign: {
      options: {
        top: "top",
        middle: "middle",
        bottom: "bottom",
      },
    },
    position: {
      options: posList.reduce(function (map, pos) {
        map[pos] = pos;
        return map;
      }, {}),
    },
    distance: {
      min: 0,
      max: 100,
    },
  };

  const labelOption = {
    show: true,
    position: app.config.position,
    distance: app.config.distance,
    align: app.config.align,
    verticalAlign: app.config.verticalAlign,
    rotate: app.config.rotate,
    formatter: "{c}  {name|{a}}",
    fontSize: 16,
    rich: {
      name: {},
    },
  };

  // 基站流量图表的配置
  baseStationTrafficChartOptions.value = {
    backgroundColor: "#2d2d2d", // 保留背景颜色
    title: {
      left: "center",
      textStyle: {
        color: "#ffffff",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["多目标识别", "VR直播", "云游戏", "联邦学习"],
      textStyle: {
        color: "#ffffff",
        fontSize: 16,
      },
    },
    toolbox: {
      show: true,
      orient: "vertical",
      left: "right",
      top: "center",
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ["line", "bar", "stack"] },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    xAxis: [
      {
        type: "category",
        axisTick: { show: false },
        data: ["WSPN-BS1", "WSPN-BS2", "WSPN-BS3", "WSPN-BS4", "WSPN-Server"],
        axisLine: {
          lineStyle: {
            color: "#ffffff", // 保持x轴颜色
          },
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        axisLine: {
          lineStyle: {
            color: "#ffffff", // 保持y轴颜色
          },
        },
      },
    ],
    series: [
      {
        name: "多目标识别",
        type: "bar",
        barGap: 0,
        label: labelOption,
        emphasis: {
          focus: "series",
        },
        data: [320, 332, 301, 334, 390],
        color: "#99D9EA", // 保持自定义颜色
      },
      {
        name: "VR直播",
        type: "bar",
        label: labelOption,
        emphasis: {
          focus: "series",
        },
        data: [220, 182, 191, 234, 290],
        color: "#FFFE91", // 保持自定义颜色
      },
      {
        name: "云游戏",
        type: "bar",
        label: labelOption,
        emphasis: {
          focus: "series",
        },
        data: [150, 232, 201, 154, 190],
        color: "#C8BFE7", // 保持自定义颜色
      },
      {
        name: "联邦学习",
        type: "bar",
        label: labelOption,
        emphasis: {
          focus: "series",
        },
        data: [98, 77, 101, 99, 40],
        color: "#FFAEC9", // 自定义联邦学习颜色
      },
    ],
  };
}

onMounted(() => {
  initMap();
  loadChartData();

  const upDownTrafficChartDom = document.getElementById("upDownTrafficChart");
  const baseStationTrafficChartDom = document.getElementById(
    "baseStationTrafficChart",
  );
  const upDownTrafficChart = echarts.init(upDownTrafficChartDom);
  const baseStationTrafficChart = echarts.init(baseStationTrafficChartDom);

  upDownTrafficChart.setOption(upDownTrafficChartOptions.value);
  baseStationTrafficChart.setOption(baseStationTrafficChartOptions.value);
});
</script>
