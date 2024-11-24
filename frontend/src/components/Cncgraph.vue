 <script>
 import store from '../store/store'
 import axios from 'axios'
 import Svcselector from './Svcselector'
  import Comm_dynamic from './Comm_dynamic'
/* import Temporary from './Temporary' */
import colors from '../assets/color.module.scss'
import { ElSegmented } from 'element-plus'
const url = 'http://localhost:8080/'
export default{
    name: 'Cncgraph',
    data(){
        return{
            data:{
                serviceinfo:{
                    Name:[],
                    Nodes:[],
                    Networks:[],
                    Decisions:[],
                },
                 
            },
            node0:{ "name": "node5", "cpu_allocation": "311 mcores", "mem_allocation": "211MB", "cpu_used": "211 mcores", "mem_used": "111MB" },
            node1:{ "name": "node6", "cpu_allocation": "311 mcores", "mem_allocation": "211MB", "cpu_used": "211 mcores", "mem_used": "111MB" },
            edge:[{ "source_node": "node3", "target_node": "node6", "offloading_percent": "136%"},{"source_node": "node3", "target_node": "node5", "offloading_percent": "135%"  },],
            bgcolor: colors.cardBackground,
            service_list:[],
            selectedValue: '',
        }
    },
    computed: {
        isEdit1() {
            return this.$store.state.CNCServices;　　//需要监听的数据
        },
        isEdit2() {
            return this.$store.state.service;//需要监听的数据
        },
    },
    watch: {
        isEdit1(newer, older) {
            this.service_list = JSON.parse(JSON.stringify(store.state.CNCServices))
        },
        isEdit2(newer, older) {
        }, 
    },
    mounted() {
        this.service_list = JSON.parse(JSON.stringify(store.state.CNCServices))
    },
    components:{
        Svcselector,
        Comm_dynamic
    },
    methods:{
        changeServices(){  //服务表单切换函数
         var url_svc = this.selectedValue   
            /* async function  getList(){
            let response = await axios.get(url+"cncgraph/"+url_svc);
            console.log(response.data);
            store.commit('setCNCSvcinfo',response.data)
            }
            getList()  */
            this.$store.commit('setService',url_svc)
            this.services = JSON.parse(JSON.stringify(store.state.CNCSvcinfo))
            console.log("this.services",this.services)
            this.services.map((item,i)=>{
                if(item.Name == this.selectedValue){
                    this.data.serviceinfo = item;
                }   
            }) 
           /*  this.data.serviceinfo.Nodes.push(this.node0); */
           /*  this.data.serviceinfo.Nodes.push(this.node1); */
            /* this.data.serviceinfo.Decisions.push(this.edge[0],this.edge[1]) */
            this.renderChart()
        }, 
        renderChart() {
            /* console.log(this.data.serviceinfo.Decisions[1].offloading_percent) */
            let points = this.data.serviceinfo.Nodes.map((_, i) => {  //遍历每个服务节点
                let angle = 2 * Math.PI * i / this.data.serviceinfo.Nodes.length + Math.PI / 2
                return [Math.cos(angle), -Math.sin(angle)]
            })
            console.log(points)
            let elems = this.data.serviceinfo.Nodes.map((node, i) => {
                let div = document.createElement('div') //创建素
                div.className = 'node-sign' //节点的标识元
                div.style.left = points[i][0] * 16 + 60 + '%'
                console.log("left",div.style.left);
                div.style.top = points[i][1] * 24 + 50 + '%'
                console.log("top",div.style.top);
                let div2 = document.createElement('div')
                div2.className = 'node-msg' //节点的标信息
                div2.style.left = points[i][0] * 27 + 60 + '%'
                div2.style.top = points[i][1] * 35 + 50 + '%'

                let img = document.createElement('div')
                    img.className = 'node-img'
                let name = document.createElement('div')
                name.className = 'node-name'
                name.replaceChildren(node.name)

                let color = colors.cardText
                let text = document.createElement('span')
                    text.style.fontSize = '18px'
                let mem_allo =  this.data.serviceinfo.Nodes[i].mem_allocation
                let mem_used = this.data.serviceinfo.Nodes[i].mem_used
                let cpu_allo =  this.data.serviceinfo.Nodes[i].cpu_allocation
                let cpu_used = this.data.serviceinfo.Nodes[i].cpu_used  
                let p1 =  document.createElement('p')
                let p2 =  document.createElement('p')
                let p3 =  document.createElement('p')
                let p4 =  document.createElement('p')
                let br =  document.createElement('br')
                p1.replaceChildren(`可用内存：${mem_allo} G`)
                p2.replaceChildren(`已使用内存：${mem_used} G`)
                p3.replaceChildren(`可用CPU：${cpu_allo} G`)
                p4.replaceChildren(`已使用CPU：${cpu_used} G`)
                text.replaceChildren(p1,p2,p3,p4)//,可用CPU：${cpu_allo} G,已使用CPU：${cpu_used} G`)
                div.replaceChildren(img, name)
                div2.replaceChildren(text)
                let div1 = document.createElement('div') //创建素
                div1.replaceChildren(div,div2)
                return div1
            })
            var node_num = this.data.serviceinfo.Nodes.length;
            var decision_num = this.data.serviceinfo.Decisions.length
            for (let i = 0; i < this.data.serviceinfo.Nodes.length; i++) {
                for (let j = 0; j < this.data.serviceinfo.Nodes.length; j++) {
                    if (i >= j) {
                        continue
                    }
                    let dx = points[i][0] - points[j][0]
                    let dy = points[i][1] - points[j][1]
                    let cx = (points[i][0] + points[j][0]) / 2
                    let cy = (points[i][1] + points[j][1]) / 2
                    let angle = Math.atan(dy / dx)
                    if (i < j) {
                        angle += Math.PI     //两点连线与水平轴之间的角度
                    }
                    let len = Math.sqrt(dx * dx + dy * dy) //计算距离

                    len *= 100
                    let width = 2
                    let height = 8
                    let space = 30
                    let color = colors.cardText

                    let line = document.createElement('div')
                    line.style.width = `${len - height / 2 - space * 2}px`
                    line.style.height = `${width}px`
                    line.style.backgroundColor = color

                    let tri = document.createElement('div')
                    tri.style.borderLeft = `${height}px solid ${color}`
                    tri.style.borderTop = `${height / 2}px solid transparent`
                    tri.style.borderBottom = `${height / 2}px solid transparent`

                    let arrow = document.createElement('div')
                    arrow.style.display = 'flex'    
                    arrow.style.alignItems = 'center'
                    arrow.style.margin = `0 ${space}px 0 ${space}px`
                    if(i*node_num+j<decision_num){
                    if (this.data.serviceinfo.Decisions[i*node_num+j].offloading_percent != -1 ){
                        arrow.replaceChildren(line, tri)}
                    }

                    let text = document.createElement('span')
                    text.style.color = color
                    if (angle > Math.PI / 2) {
                        text.style.transform = `rotate(${Math.PI}rad)`
                    }
                    text.style.fontSize = '16px'  //12px
                    text.style.fontWeight = 'bold'
                    if(i*node_num+j<decision_num){
                    let per = this.data.serviceinfo.Decisions[i*node_num+j].offloading_percent
                    if (this.data.serviceinfo.Decisions[i*node_num+j].offloading_percent!= -1){
                        text.replaceChildren(`${per} `)}
                    }
                    let wrapper = document.createElement('div')
                    wrapper.style.display = 'flex'
                    wrapper.style.flexDirection = 'column'
                    wrapper.style.alignItems = 'center'
                    wrapper.replaceChildren(text, arrow)

                    let div = document.createElement('div')
                    div.className = 'arrow'
                    div.style.left = cx * 16 + 60 + '%'
                    div.style.top = cy * 24 + 50 + '%'
                    div.style.transform = `translate(-50%, -50%) rotate(${angle}rad) translate(0px, -14px)`
                    div.replaceChildren(wrapper)

                    elems.push(div)
                }
            }
           document.getElementById('chart').replaceChildren(...elems)

        }

}
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
    <div :backgroundColor="bgcolor"  style="width: 100%; height: 100%" >
    <!-- <div style="transform: scale(0.6)"> -->
        <div :backgroundColor="bgcolor" id="chart" />
    </div>

</template>

<style scoped>
#chart {
    /* position: relative; */
    top: 96px;
    left: 64px;
     width: calc(100%) ;
    height: calc(100%); 
    background: rgba(10, 106, 255, 0.1) url(../assets/wg.png) 
}
.selector {
    top: 10%;
    left: 4%;
    float: left;
    margin: 5px;
    width: 28%;
    height: 16%;

    position: absolute;
    overflow: auto;
    border: 2px solid rgba(92, 255, 255, 0.1);
    background: rgba(10, 106, 255, 0.1) url(../assets/wg.png) repeat 50% 50% !important;
    background-blend-mode: screen;
}

.cncelement {
    width: 50%;
    height: 0;
    padding-bottom: 50%;
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


<style>
.node-sign {
    width: 80px;
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
}
.node-msg {
    width: 80px;
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.node-img {
    background: url(../assets/node.jpg) no-repeat 0% 0%;
    background-size: contain;
    width: 64px;
    height: 64px;
}

.node-imggrey {
    background: url(../assets/node.jpg) no-repeat 0% 0%;
    filter: saturate(0%);
    background-size: contain;
    width: 64px;
    height: 64px;
}

.node-name {
    font-size: 16px;
    font-weight: bold;
}
.node-msg{
    width: 250px;
    position: absolute;
    transform: translate(-50%, -50%);
    white-space: pre-wrap;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.arrow {
    position: absolute;
}
.dvborder{
    /* margin: -5px */
    height: 100%;
    width: 100%;
}
.card {
    /* margin-top: var(--margin); */
    padding-top: 3px;
    width: 100%;
    height:100%;
    /* backdrop-filter: blur(3px); */
    border-radius: 0;
}
</style>