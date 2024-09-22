<template>
  <div id="map" class="map-container"></div>
</template>

<script>
import AMapLoader from "@amap/amap-jsapi-loader";
import { ref, onMounted, watch, computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "GeoMap",
  props: {
    searchQuery: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const store = useStore(); // 使用 Vuex store
    const map = ref(null); // 地图对象
    let AMap = null; // 高德地图 API
    let marker = null; // 地图标记
    let placeSearch = null; // 高德地图 PlaceSearch 实例

    const current_position = computed(() => store.state.current_position); // 当前地图中心

    // 地图初始化
    const initMap = () => {
      window._AMapSecurityConfig = {
        securityJsCode: "934e3abdf65d36a21caae3a069789da3", // 保留安全密钥
      };

      AMapLoader.load({
        key: "7778b36918b20db096abc451498af897", // 保留API密钥
        version: "2.0",
        plugins: [
          "AMap.ToolBar",
          "AMap.Scale",
          "AMap.HawkEye",
          "AMap.MapType",
          "AMap.MouseTool",
          "AMap.PlaceSearch",
          "AMap.ControlBar",
        ],
      })
        .then((AMapInstance) => {
          AMap = AMapInstance;

          // 创建地图实例并设置3D视图
          map.value = new AMap.Map("map", {
            center: current_position.value.length
              ? current_position.value
              : [116.358145, 39.961495], // 如果有当前位置，使用当前位置作为中心
            zoom: 18,
            pitch: 50,
            rotation: -15,
            viewMode: "3D", // 保留 3D 视图
            zooms: [2, 20], // 缩放范围
          });

          // 添加工具栏和控制条
          const toolBar = new AMap.ToolBar();
          const controlBar = new AMap.ControlBar();
          map.value.addControl(toolBar);
          map.value.addControl(controlBar);

          // 初始化 PlaceSearch
          placeSearch = new AMap.PlaceSearch({
            map: map.value,
          });

          // 初始化标记
          addMarker();
        })

        .catch((error) => {
          console.error("AMap 加载错误:", error);
        });
    };

    // 监听搜索框内容变化并执行搜索
    watch(
      () => props.searchQuery,
      (newQuery) => {
        if (newQuery && placeSearch) {
          placeSearch.search(newQuery, (status, result) => {
            if (status === "complete" && result.info === "OK") {
              const poi = result.poiList.pois[0];
              if (poi && poi.location) {
                const lnglat = poi.location;
                current_position.value = [lnglat.lng, lnglat.lat];
                store.dispatch("updateCurrentPosition", current_position.value); // 更新 Vuex 中的当前位置
                map.value.setCenter(current_position.value);
                addMarker();
              }
            } else {
              console.error("搜索失败或无结果", result);
            }
          });
        }
      },
    );

    // 添加标记
    const addMarker = () => {
      if (!AMap || !map.value) return;

      // 如果已经有标记，移除旧标记
      if (marker) {
        marker.setMap(null);
      }

      // 创建新的标记并添加到地图
      marker = new AMap.Marker({
        position: current_position.value,
        icon: new AMap.Icon({
          size: new AMap.Size(40, 50), // 设置图标大小 (宽度40px, 高度50px)
          image: "/station-icon.png", // 图标图片路径
          imageSize: new AMap.Size(40, 50), // 保证图标图片大小和显示大小一致
        }),
        offset: new AMap.Pixel(-13, -26),
      });

      marker.setMap(map.value);
    };

    // 监听 current_position 变化并更新地图
    watch(current_position, () => {
      if (map.value) {
        map.value.setCenter(current_position.value); // 更新地图中心
        addMarker(); // 更新标记
      }
    });

    // 地图初始化
    onMounted(() => {
      initMap();
    });

    return {
      map,
    };
  },
};
</script>
