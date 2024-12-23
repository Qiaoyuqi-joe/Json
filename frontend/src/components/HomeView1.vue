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
/* import { ref, onMounted } from "vue"; */
import { ref, computed, watch, onMounted } from 'vue';
import * as echarts from "echarts";
import store from '../store/store'
import "@/assets/Styles.css"; // 引入外部 CSS 文件
import axios from 'axios'
// 地图相关变量和逻辑
const searchQuery = ref("");
const path = ref([]);
const current_position = ref([]);




let placeSearch;
let map;
let AMap;
const clusterInfo = computed(() => store.state.clusterInfo);
var bsTrafficPortrait = [];
var traffic_24h = [];
let serviceTraf = [];
var bsPortrait = [] //基站画像
var userPortrait = []//基站画像
// 监听 clusterInfo 的变化
watch(clusterInfo, (newVal, oldVal) => {
  console.log(store.state.clusterInfo)
  bsTrafficPortrait = bsPortrait.bs_traffic_list;
  traffic_24h = [];
  serviceTraf = [];
  bsPortrait = JSON.parse(JSON.stringify(store.state.clusterInfo.bss)) //基站画像
  userPortrait = JSON.parse(JSON.stringify(store.state.clusterInfo.users)) //基站画像
});
  bsPortrait = JSON.parse(JSON.stringify(store.state.clusterInfo.bss)) //基站画像
  userPortrait = JSON.parse(JSON.stringify(store.state.clusterInfo.users)) //基站画像
function getTraffic_24h(){
    var trafficList = userPortrait.user_traffic_list;
    var trafficdis = trafficList[0].traf_dis;
    for(let i=1; i<trafficList.length();i++){
        trafficdis = trafficdis+trafficList[0].traf_dis;
    }
    traffic_24h = trafficdis;
    console.log("traffic",traffic_24h)
}
function getOrder(svcname,bsname){
    var order = parseInt(svcname[7], 10)*4+parseInt(svcname[8], 10)-5;
    return order
}

function getServicetraf(){
    var trafficList = userPortrait.user_traffic_list;
    var svctraf = Array(12,0);
    for(let i=1; i<trafficList.length();i++){
      console.log("name",svcname,bsname)
        var svcname = trafficList.traf_svcname;
        var bsname = trafficList.traf_svcname;
        var order = getOrder(svcname,bsname);
        var sumtraf = trafficList[i].traf_dis.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        svctraf[order] = svctraf[order]+sumtraf;
        serviceTraf = svctraf;
        console.log("service_traf",serviceTraf)
    }
}

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
  upDownTrafficChartOptions.value = {
    backgroundColor: "#2d2d2d",
    title: {
      //text: "24h 上下行流量 - 时间分布",
      left: "center",
      textStyle: {
        color: "#ffffff",
      },
    },
    xAxis: {
      type: "category",
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
    },
    yAxis: {
      type: "value",
      axisLine: {
        lineStyle: {
          color: "#ffffff",
        },
      },
    },
    series: [
      {
        data: traffic_24h,
        type: "bar",
        color: "#4caf50",
      },
    ],
  };

  baseStationTrafficChartOptions.value = {
    backgroundColor: "#2d2d2d",
    title: {
      //text: "24h 基站流量 - 业务类别分布",
      left: "center",
      textStyle: {
        color: "#ffffff",
      },
    },
    legend: {
      textStyle: {
        color: "#ffffff",
      },
    },
    xAxis: {
      type: "category",
      data: ["基站1", "基站2", "基站3", "基站4"],
      axisLine: {
        lineStyle: {
          color: "#ffffff",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLine: {
        lineStyle: {
          color: "#ffffff",
        },
      },
    },
    series: [
      {
        name: "类别A",
        /* data: [100, 200, 150, 300], */
        data:[serviceTraf[0],serviceTraf[1],serviceTraf[2],serviceTraf[3]],
        type: "bar",
        stack: "流量",
        color: "#4caf50",
      },
      {
        name: "类别B",
        /* data: [50, 80, 70, 120], */
        data:[serviceTraf[4],serviceTraf[5],serviceTraf[6],serviceTraf[7]],
        type: "bar",
        stack: "流量",
        color: "#81c784",
      },
      {
        name: "类别C",
        /* data: [30, 50, 40, 90], */
        data:[serviceTraf[8],serviceTraf[9],serviceTraf[10],serviceTraf[11]],
        type: "bar",
        stack: "流量",
        color: "#c8e6c9",
      },
    ],
  };
}

onMounted(() => {
  initMap();
  loadChartData();
  getTraffic_24h();
  getServicetraf();
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
