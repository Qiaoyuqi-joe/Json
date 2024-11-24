<script>
 import axios from 'axios'
import store from '../store/store'
 import Cncgraph from './Cncgraph'
const url = 'http://localhost:8080/'
export default {
    name: 'Svcselector',
    data() {
        return {
            service_list:[],
            selectedValue: '',
        }
    },
    computed: {
        isEdit2() {
            return this.$store.state.CNCSvcinfo;　　//需要监听的数据
        }
    },
    watch: {
        deep: true,
        isEdit2(newer, older) {
            this.service_list = JSON.parse(JSON.stringify(store.state.CNCServices))
        }
    },
    mounted() {
        this.service_list = JSON.parse(JSON.stringify(store.state.CNCServices))
    },
    components:{
        Cncgraph
    },
    methods: {
        changeServices(){
         var url_svc = this.selectedValue   
            /* async function  getList(){
            let response = await axios.get(url+"cncgraph/"+url_svc);
            console.log("成功一半")
            console.log(response.data);
            store.commit('setCNCSvcinfo',response.data)
            }
            getList()  */
          /*  let response1 =getList();
           console.log("response1")
           console.log(response1)
           this.$store.commit('setCNCSvcinfo',response1) */
            /* axios.get(url+"cncgraph/"+url_svc)
                .then(response => {
                    console.log("here")
                    console.log(response.data);
                    this.$store.commit('setCNCSvcinfo',response.data);
                })
                .catch(error => {
                    console.error('Error fetching data: ', error);
                }) */
            console.log("这里修改服务")
            this.$store.commit('setService',url_svc)
            this.services = JSON.parse(JSON.stringify(store.state.CNCSvcinfo))
            console.log("this.services",this.services[0])
            this.services.map((item,i)=>{
                if(item.Name == this.selectedValue){
                    console.log(item)
                    this.data.serviceinfo = item;
                }
                
            }) 
        }, 

    },
}
</script>

<template>
    
    <div>
        <div class="selector">
            <div class="标题">查看服务对应的算力网络图</div>
            <el-select class="select"  v-model="selectedValue" filterable placeholder="请选择" @change="changeServices" 
                onselect="">
                <el-option v-for="svc in service_list" :key="svc" :label="svc" :value="svc" />
            </el-select>
        </div>
    </div>
    
</template>

<style scoped>
.selector {
    top: 22%;
    left: 9%;
    float: left;
    margin: 5px;
    width: 33%;
    height: 18%;

    position: absolute;
    overflow: auto;
    border: 2px solid rgba(92, 255, 255, 0.1);
    background: rgba(10, 106, 255, 0.1) url(../assets/wg.png) repeat 50% 50% !important;
    background-blend-mode: screen;
}

.标题 {
    position: absolute;
    height: 26px;
    font-size: 16px;
    color: #00c2ff;
    line-height: 26px;
    padding: 0 0 0 20px;
    left: 10px;
    right: 10px;
    top: 10px;
}

.标题::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    margin-top: -7px;
    width: 14px;
    height: 14px;
    background: url(../assets/sn-title.png) no-repeat 0% 0%;
    display: inline-block;
}

.select {
    position: absolute;
    top: 40%;
    left: 3%;
    width: 94%;
    color: white;
}
</style>
