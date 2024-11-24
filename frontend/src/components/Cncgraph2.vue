<script>
 import store from '../store/store'
 import axios from 'axios'
 import Svcselector from './Svcselector'
  import Comm_dynamic from './Comm_dynamic'
import colors from '../assets/color.module.scss'
import { ElSegmented } from 'element-plus'
import NeoVis from 'neovis.js';
import neo4j from 'neo4j-driver';
import { DataSet, Network } from 'vis-network/standalone';

 export default{
    name: 'Cncgraph1',
    data(){
        return{  
            data:{
                serviceinfo:{
                    Name:[],
                    Nodes:[],
                    Networks:[],
                    Decisions:[]
                }
            },
            node:{},
            Nodelist:[],
            nodes:[],
            edges:[],
            service_list:[],
            services:[],
            selectedNode: null,
            node0:{ "name": "node5", "cpu_allocation": "311 mcores", "mem_allocation": "211MB", "cpu_used": "211 mcores", "mem_used": "111MB" },
            node1:{ "name": "node6", "cpu_allocation": "311 mcores", "mem_allocation": "211MB", "cpu_used": "211 mcores", "mem_used": "111MB" },
            edge:[{ "source_node": "node3", "target_node": "node6", "offloading_percent": "136%"},{"source_node": "node2", "target_node": "node5", "offloading_percent": "135%"  },],
        }
    },
    created() {
        this.driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'password'));
        this.session = this.driver.session();
    },
    computed: {
        isEdit1() {
            return this.$store.state.CNCServices;　　//需要监听的数据
        },
    },
    watch: {
        isEdit1(newer, older) {
            this.service_list = JSON.parse(JSON.stringify(store.state.CNCServices))
        },
    },
    mounted() {
        this.service_list = JSON.parse(JSON.stringify(store.state.CNCServices))
        this.initNetwork();
    },
    beforeDestroy() {
        if (this.session) {
            this.session.close();
        }
        if (this.driver) {
            this.driver.close();
        }
    },
    methods:{
        changeServices(){  //服务表单切换函数
            var url_svc = this.selectedValue   
            this.$store.commit('setService',url_svc)
            this.$store.commit('setService',url_svc)
            this.services = JSON.parse(JSON.stringify(store.state.CNCSvcinfo))
            console.log("this.services",this.services)
            this.services.map((item,i)=>{
                if(item.Name == this.selectedValue){
                    this.data.serviceinfo = item;
                }
            })
            this.importdata()
        }, 
    
        async importdata() {
            const tx = this.session.beginTransaction();
            /* this.services = JSON.parse(JSON.stringify(store.state.CNCSvcinfo))
            this.services.map((item,i)=>{
                console.log(item)
                if(item.Name =='service1'){
                    this.data.serviceinfo =  item
                }
            }) */
            this.data.serviceinfo=JSON.parse(JSON.stringify( this.data.serviceinfo))
            console.log(this.data.serviceinfo)
            var nodes = this.data.serviceinfo.Nodes;
            var decisions = this.data.serviceinfo.Decisions;
            nodes.push(this.node0);
            nodes.push(this.node1);
            decisions.push(this.edge[0],this.edge[1])
            console.log("nodes",nodes,"decisions",decisions)
            try {
                // 清空现有数据
                await tx.run('MATCH (n) DETACH DELETE n');

                // 上传 JSON 数据到 Neo4j
                for (const item of nodes) {
                    await tx.run('CREATE (n:Node {id:$id, label:$label,name: $name,  cpu_used: $cpu_used, cpu_total: $cpu_total, mem_used: $mem_used,  mem_total: $mem_total})', {
                        id:item.name ,
                        name: item.name,
                        label:item.name,
                        cpu_used: item.cpu_used,
                        cpu_total: item.cpu_allocation,
                        mem_used: item.mem_used,
                        mem_total: item.mem_allocation,
                    });
                }
                // 上传边数据
                for (const edge of decisions) {
                    if(edge.source_node >= edge.target_node){
                        continue
                    }
                    await tx.run('MATCH (a:Node {id: $from}), (b:Node {id: $to}) CREATE (a)-[:CONNECTED_TO {weight: $weight}]->(b)', {
                        from: edge.source_node,
                        to: edge.target_node,
                        weight: edge.offloading_percent
                    });
                }

                await tx.commit();
                console.log("Data uploaded successfully");
                await this.fetchGraph();
            } catch (error) {
                console.error("Error uploading data:", error);
                await tx.rollback();
            }
        },
        
        async fetchGraph() {
            try {
                const result = await this.session.run('MATCH (n:Node) RETURN n');
                this.nodes = [];
                result.records.forEach(record => {
                    const node = record.get('n');
                    const nodeId = node.properties.id;
                    console.log("sssssssssssss",nodeId)
                    const nodeName = node.properties.name || 'Unnamed';
                    const label = node.properties.label;
                    const cpu_used = node.properties.cpu_used;
                    const cpu_total = node.properties.cpu_total;
                    const mem_used = node.properties.mem_used;
                    const mem_total = node.properties.mem_total;
                    const x = 300;
                    this.nodes.push({ id:nodeId, label:label, name: nodeName, cpu_used: cpu_used, cpu_total: cpu_total, mem_used: mem_used, mem_total:mem_total,x:x,y:x });
                });

                // Fetch edges
                const edgeResult = await this.session.run('MATCH (a:Node)-[r:CONNECTED_TO]->(b:Node) RETURN a.id AS from, b.id AS to,r.weight AS weight');
                this.edges = [];
                edgeResult.records.forEach(record => {
                    this.edges.push({ from: record.get('from'), to: record.get('to'),label: record.get('weight') });
                });

                console.log("Fetched nodes:", this.nodes);
                console.log("Fetched edges:", this.edges);
                this.updateNetwork();
            } catch (error) {
                console.error("Error fetching graph:", error);
            }
        },

        initNetwork() {
            const container = this.$refs.network;
            const data = {
                nodes: new DataSet(this.nodes),
                edges: new DataSet(this.edges)
            };
            console.log("success init")
            const options = {
                nodes: {
            shape: 'box', // 使用方块形状
            size: 80,
            color: {
                border: '#1E88E5', // 边框颜色设置为深蓝色
                background: '#2196F3', // 背景颜色设置为蓝色
            },
            font: {
                color: '#ffffff',
                size: 16,
                face: 'Tahoma',
            },
            shadow: {
                enabled: true,
                color: 'rgba(0, 0, 0, 0.5)', // 阴影颜色
                x: 5,
                y: 5,
                size: 10
            },
        },
                edges: {
                    color: {
                        color: '#9E9E9E', // 默认边颜色
                        highlight: '#FF5722', // 高亮颜色
                        hover: '#FF5722' // 悬停颜色
                    },
                    width: 2, // 边的宽度
                    arrows: {
                        to: { enabled: true, scaleFactor: 1.5 }, // 使箭头更大
                    },
                    smooth: {
                        type: 'continuous'
                    },
                    font: {
                        color: '#9E9E9E', // 边标签的颜色，与边相同
                        size: 10, // 边标签的大小
                        align: 'top' // 标签位置
                    }
                },
            };
            this.network = new Network(container, data, options);
            /* this.network.on('selectEdge', (params) => {
            this.handleEdgeSelect(params);
            this.network.onR('deselectEdge', (params) => {
                if (params.edges.length === 0) {
                    this.resetEdgeStyles();
                }
            });

            }); */
            // 添加节点点击事件
            this.network.on('selectNode', (params) => {
            const id = params.nodes[0];
            const node = this.nodes.find(n => n.id === id);
            if (node) {
                this.selectedNode = node;
                this.highlightEdges(node.id); // 调用加粗边的函数
            }
            });
        },
        highlightEdges(nodeId) {
    this.edges.forEach(edge => {
        if (edge.from === nodeId || edge.to === nodeId) {
            this.network.body.data.edges.update({
                id: edge.id,
                /* color: { color: '#000000' }, // 边的颜色变为黑色 */
                width: 2, // 加粗
                font: {
                    color: '#000000', // 标签颜色变为黑色
                    size: 14, // 标签大小变大
                    align: 'top'
                }
            });
        }
    });
},    
    handleEdgeSelect(params) {
        const selectedEdgeId = params.edges[0];
        const selectedEdge = this.edges.find(edge => edge.id === selectedEdgeId);
        if (selectedEdge) {
            this.network.body.data.edges.update({
            id: selectedEdgeId,
            color: { color: '#000000' }, // 变为黑色
            width: 4, // 加粗
            font: {
                color: '#000000', // 标签颜色变为黑色
                size: 14, // 标签大小变大
                align: 'top'
            }
        });
    }
},

    resetEdgeStyles() {
        this.edges.forEach(edge => {
        this.network.body.data.edges.update({
            id: edge.id,
            color: { color: '#9E9E9E' }, // 恢复边的颜色
            width: 2, // 恢复边的宽度
            font: {
                color: '#9E9E9E', // 标签颜色恢复
                size: 12, // 标签大小恢复
                align: 'top'
            }
        });

    });
},
        updateNetwork() {
            if (this.network) {
        const data = {
            nodes: new DataSet(this.nodes),
            edges: new DataSet(this.edges)
        };
        this.network.setData(data);
    } else {
        console.error('Network instance is invalid.');
    }
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
 <div>
       <!--  <button @click="importdata">Upload Data to Neo4j</button> -->
        <div ref="network" style="width: 100%; height: 1200px;"></div>
        <div v-if="selectedNode" class="info-panel">
            <h3>Node Information</h3>
            <p><strong>节点名称:</strong> {{ selectedNode.name}}</p>
            <p><strong>已使用CPU:</strong> {{ selectedNode.cpu_used }}</p>
            <p><strong>系统分配CPU:</strong> {{ selectedNode.cpu_total }}</p>
            <p><strong>已使用内存:</strong> {{ selectedNode.mem_used }}</p>
            <p><strong>系统分配内存:</strong> {{ selectedNode.mem_total }}</p>
        </div>
    </div>
        

</template>

<style>
.selector {
    top: 4%;
    float: left;
    background: linear-gradient(90deg, #BBDEFB,); 
    padding: 12px 24px;
    width: 40%;
    height: 20%;
    margin: 20px;
    font-size: 30px;
    box-sizing: border-box;
    background: #BBDEFB url(../assets/wg.png) repeat 50% 50% !important;
}

.info-panel {
    margin: 50px;
    padding: 20px;
    border-radius: 8px;
    background-color: #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 节点和边的样式 */
.vis-network .vis-node {
    border-radius: 5px;
    transition: transform 0.3s;
}

.vis-network .vis-node:hover {
    transform: scale(1.1);
}

.vis-network .vis-label {
    font-family: 'Arial', sans-serif;
    font-weight: bold;
    color: #ffffff;
}

.vis-network .vis-edge {
    transition: stroke-width 0.3s;
}

.vis-network .vis-edge:hover {
    stroke-width: 3px;
}

.vis-network .vis-arrow {
    fill: #2196F3; 
}

/* 其他相关样式 */
.nodes {
    color: #2196F3; /* 节点边框颜色 */
    background: #BBDEFB; /* 节点背景颜色 */
}

.edges {
    color: #90CAF9; /* 边的默认颜色 */
}

/* 更新高亮和悬停颜色 */
.edges:hover {
    color: #1E88E5; /* 悬停颜色 */
}
</style>