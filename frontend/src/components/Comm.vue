<script>
import axios from 'axios'
import store from '../store/store'
// 请求的url，后面应加入相应地址来确定具体get什么内容
const url = 'http://localhost:8080/'

export default {
    name: 'Comm',
    data() {
        return {
        }
    },
    mounted(){
        this.refreshData()
    },
    computed: {
        // 检测条目更新（需要和watch中的同名函数搭配使用）
        isEdit() {
            return this.$store.state.service; //需要监听的数据
        }
    },
    watch: {
        deep: true,
        // 当选中的服务变更时，执行以下内容
        isEdit(newer, older) {
        }
    },
    methods: { 
        // 获取全部静态数据
        refreshData() {
            axios.get(url+"cncgraph/services")
            .then(response => {
                console.log(response.data);
                this.$store.commit('setCNCServices',response.data);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            })
            axios.get(url+"cncgraph/nodes")
            .then(response => {
                console.log(response.data);
                this.$store.commit('setCNCNodes',response.data);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            })
            this.$store.commit('setService','service0')
           
            axios.get(url+"usergraph/userinfo")
            .then(response => {
                console.log(response.data);
                this.$store.commit('setClusterinfo',response.data);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            })
        },
    },
}
</script>
