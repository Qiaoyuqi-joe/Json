<template>
  <div class="cluster-table">
           <table>
               <thead>
                   <tr>
                       <th>用户mac</th>
                       <th>用户所属基站</th>
                       <th>请求服务</th>
                       <th>上行(1)/下行(0)</th>
                       <th>近24小时消耗流量</th>
                   </tr>
               </thead>
               <tbody>
                      <tr v-for="(user,i) in disList" :key="i">
                          <td>{{ traf_usermac[i] }}</td>
                          <td>{{ traf_svcname[i] }}</td>
                          <td>{{ traf_bsname[i] }}</td>
                          <td>{{ traf_up[i] }}</td>
                          <td>{{ traf_dis[i] }}</td>
                      </tr>
               </tbody>
           </table>
       </div>
</template>

<script>
/* 按照服务请求顺序展示用户画像分析，包括用户mac，用户所属基站，用户请求服务类别，上行or下行以及近24小时请求流量*/
import AMapLoader from "@amap/amap-jsapi-loader";
import { ref, computed, watch, onMounted } from 'vue';
import * as echarts from "echarts";
import store from '../store/store'
import "@/assets/Styles.css"; // 引入外部 CSS 文件
import axios from 'axios'
export default {
  data() {
    return {
      userPortrait : [],//基站画像
      bsPortrait :[],
      trafficList :[],
      disList :[],
      traf_usermac:[],
      traf_svcname:[],
      traf_bsname:[],
      traf_up :[],
      traf_dis :0
  };
  } ,
  mounted() {
    this.importdata();
  },
  methods: {
    importdata(){
      this.bsPortrait=JSON.parse(JSON.stringify(store.state.clusterInfo.bss)),//基站画像
      this.userPortrait = JSON.parse(JSON.stringify(store.state.clusterInfo.users)), //流量数据
      this.userPortrait.map((item,i)=>{
        this.trafficList.push(JSON.parse(JSON.stringify(item.user_traffic_list)));
      this.trafficList[0].map((item,i)=>{
        this.disList.push(item);
        this.traf_usermac.push( item.traf_usermac)
        this.traf_svcname.push(item.traf_svcname)
        this.traf_bsname.push(item.traf_bsname)
        if(item.traf_up=="true")
          this.traf_up.push("上行")
        else this.traf_up.push("下行")
        var sum=0;
        this.traf_dis = item.traf_dis.map((n,i)=>{
          sum = sum+n;
          return sum;
        })
    })
    })
    console.log("list",this.disList)
    }
  },
};
</script>

<style scoped>
.admin-dashboard {
  max-width: 800px;
  margin: auto;
}
</style>
