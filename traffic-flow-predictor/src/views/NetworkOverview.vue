<template>
  <div class="network-overview">
    <h1>轻量化通算一体边缘智能——用户画像平台</h1>
    <div class="topology-container">
      <svg width="600" height="400" viewBox="0 0 600 400">
        <circle cx="150" cy="100" r="40" fill="#0099ff" />
        <circle cx="450" cy="100" r="40" fill="#0099ff" />
        <circle cx="150" cy="300" r="40" fill="#0099ff" />
        <circle cx="450" cy="300" r="40" fill="#0099ff" />
        <line
          x1="150"
          y1="100"
          x2="450"
          y2="100"
          stroke="#666"
          stroke-width="2"
        />
        <line
          x1="150"
          y1="100"
          x2="150"
          y2="300"
          stroke="#666"
          stroke-width="2"
        />
        <line
          x1="450"
          y1="100"
          x2="450"
          y2="300"
          stroke="#666"
          stroke-width="2"
        />
        <line
          x1="150"
          y1="300"
          x2="450"
          y2="300"
          stroke="#666"
          stroke-width="2"
        />
      </svg>
    </div>
    <div class="charts-container">
      <div id="up-down-stream-chart" class="chart"></div>
      <div id="station-traffic-chart" class="chart"></div>
    </div>
  </div>
</template>

<script>
import echarts from "@/echarts-config"; // 修改为按需引入的 ECharts

export default {
  name: "NetworkOverview",
  mounted() {
    this.initCharts();
  },
  methods: {
    initCharts() {
      const upDownStreamChart = echarts.init(
        document.getElementById("up-down-stream-chart"),
      );
      const stationTrafficChart = echarts.init(
        document.getElementById("station-traffic-chart"),
      );

      const upDownStreamOption = {
        title: { text: "24h上下行流量-时间分布" },
        tooltip: {},
        legend: { data: ["上行", "下行"] },
        xAxis: {
          data: [
            "0:00",
            "2:30",
            "5:00",
            "7:30",
            "10:00",
            "12:30",
            "15:00",
            "17:30",
            "20:00",
            "22:30",
          ],
        },
        yAxis: {},
        series: [
          {
            name: "上行",
            type: "bar",
            data: [5, 20, 36, 10, 10, 20, 15, 8, 6, 12],
          },
          {
            name: "下行",
            type: "bar",
            data: [15, 30, 46, 20, 25, 30, 25, 18, 16, 22],
          },
        ],
      };

      const stationTrafficOption = {
        title: { text: "24h基站流量-业务类别分布" },
        tooltip: {},
        legend: { data: ["多目标识别", "VR直播", "云游戏", "联邦学习"] },
        xAxis: { data: ["WSPN-BS1", "WSPN-BS2", "WSPN-BS3", "WSPN-Server"] },
        yAxis: {},
        series: [
          { name: "多目标识别", type: "bar", data: [320, 332, 301, 334] },
          { name: "VR直播", type: "bar", data: [220, 182, 191, 234] },
          { name: "云游戏", type: "bar", data: [150, 232, 201, 154] },
          { name: "联邦学习", type: "bar", data: [98, 77, 101, 99] },
        ],
      };

      upDownStreamChart.setOption(upDownStreamOption);
      stationTrafficChart.setOption(stationTrafficOption);
    },
  },
};
</script>

<style scoped>
.network-overview {
  text-align: center;
  padding: 20px;
}

.topology-container {
  margin-bottom: 20px;
}

.charts-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.chart {
  width: 600px;
  height: 400px;
}
</style>
