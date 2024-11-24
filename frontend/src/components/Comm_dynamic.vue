<script>
import axios from 'axios'
import Comm from './Comm'
import store from '../store/store'
import  toRaw from 'vue'
// 请求的url，后面应加入相应地址来确定具体get什么内容
const url = 'http://localhost:8080/'

export default {
    name: 'Comm_dynamic',
    data() {
        return {
            servicelist:[],
            servicename:'',
            userlist:[]
        }
    },
    mounted(){
        this.servicelist = JSON.parse(JSON.stringify(store.state.CNCServices))
    },
    components:{
        Comm,
    },
    computed: {
        // 检测条目更新（需要和watch中的同名函数搭配使用）
        isEdit1() {
            return this.$store.state.CNCServices; //需要监听的数据
            
        },
    },
    watch: {
        // 当选中的服务变更时，执行以下内容
        isEdit1(newer, older) {
            this.servicelist = JSON.parse(JSON.stringify(store.state.CNCServices))
            this.refreshData()
        },
      '$route' () {
       this.refreshData();
    }
    },
    methods: { 
        refreshData() {
            let url_svc = this.servicelist;
            var svc_num = this.servicelist.length;
            for(let i=0; i<svc_num; i++){
                axios.get(url+"cncgraph/"+url_svc[i])
                .then(response => {
                    console.log(response.data);
                    this.$store.commit('setCNCSvcinfo',response.data);
                })
                .catch(error => {
                    console.error('Error fetching data: ', error);
                })
            }    
            
        },
    },
}
</script>

<template>
<Comm />
</template>