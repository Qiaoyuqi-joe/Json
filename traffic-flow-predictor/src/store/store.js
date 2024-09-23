import { createStore } from "vuex";

export default createStore({
  state: {
    stationInfo: {
      name: "",
      id: "",
      ip: "",
      mac: "",
      users: [],
    },
    current_position: [116.358104, 39.961554], // 存储地图的当前位置
    path: [
      [116.357975, 39.96069],
      [116.356252, 39.960573],
      [116.359203, 39.963459],
    ],
    searchQuery: "", // 存储搜索查询
  },

  mutations: {
    setStationInfo(state, station) {
      state.stationInfo = station;
    },
    setCurrentPosition(state, position) {
      state.current_position = position;
    },
    addPathPoint(state, point) {
      state.path.push(point);
    },
    setSearchQuery(state, query) {
      state.searchQuery = query;
    },
  },

  actions: {
    updateStationInfo({ commit }, station) {
      commit("setStationInfo", station);
    },
    updateCurrentPosition({ commit }, position) {
      commit("setCurrentPosition", position);
    },
    addPath({ commit }, point) {
      commit("addPathPoint", point);
    },
    updateSearchQuery({ commit }, query) {
      commit("setSearchQuery", query);
    },
  },

  getters: {
    getStationInfo: (state) => state.stationInfo,
    getCurrentPosition: (state) => state.current_position,
    getPath: (state) => state.path,
    getSearchQuery: (state) => state.searchQuery,
  },
});
