<template>
    <div>
      <div class="selector">
        <div class="标题">查看服务对应的算力网络图</div>
        <el-select class="select" v-model="selectedValue" filterable placeholder="请选择" @change="changeServices">
          <el-option v-for="svc in service_list" :key="svc" :label="svc" :value="svc" />
        </el-select>
      </div>
      <div ref="network" style="width: 100%; height: 1200px;">
        <svg ref="svg" width="100%" height="100%"></svg> 
      </div>
      <div v-if="selectedNode" class="info-panel">
        <h3>Node Information</h3>
        <p><strong>节点名称:</strong> {{ selectedNode.name }}</p>
        <p><strong>已使用CPU:</strong> {{ selectedNode.cpu_used }}</p>
        <p><strong>系统分配CPU:</strong> {{ selectedNode.cpu_total }}</p>
        <p><strong>已使用内存:</strong> {{ selectedNode.mem_used }}</p>
        <p><strong>系统分配内存:</strong> {{ selectedNode.mem_total }}</p>
      </div>
    </div>
  </template>
  <script>
  import * as d3 from 'd3';
  import store from '../store/store'
 import axios from 'axios'
 import Svcselector from './Svcselector'
  import Comm_dynamic from './Comm_dynamic'
import colors from '../assets/color.module.scss'
import { ElSegmented } from 'element-plus'
import NeoVis from 'neovis.js';
import neo4j from 'neo4j-driver';
import { DataSet, Network } from 'vis-network/standalone';

  
  export default {
    name: 'Cncgraph4',
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
            links:[],
            service_list:[],
            services:[],
            selectedNode: null,
            node0:{ "name": "node5", "cpu_allocation": "311 mcores", "mem_allocation": "211MB", "cpu_used": "211 mcores", "mem_used": "111MB" },
            node1:{ "name": "node6", "cpu_allocation": "311 mcores", "mem_allocation": "211MB", "cpu_used": "211 mcores", "mem_used": "111MB" },
            link:[{ "source_node": "node3", "target_node": "node6", "offloading_percent": "136%"},{"source_node": "node2", "target_node": "node5", "offloading_percent": "135%"  },],
        }
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
        this.initNeo4j(); // 初始化 Neo4j 驱动
       /*  this.drawGraph(); // 绘制图形 */
    },
    methods: {
      /* initNeo4j() {
        const uri = 'bolt://localhost:7687'; // Neo4j 地址
        const user = 'neo4j'; // 用户名
        const password = 'your_password'; // 密码
        this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
      }, */
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
        /* async importdata() {
            this.session = this.driver.session(); // 创建会话
            const tx = this.session.beginTransaction();
            this.data.serviceinfo=JSON.parse(JSON.stringify( this.data.serviceinfo))
            console.log(this.data.serviceinfo)
            var nodes = this.data.serviceinfo.Nodes;
            var decisions = this.data.serviceinfo.Decisions;
            nodes.push(this.node0);
            nodes.push(this.node1);
            decisions.push(this.link[0],this.link[1])
            console.log("nodes",nodes,"decisions",decisions)
            try {
                // 清空现有数据
                await tx.run('MATCH (n) DETACH DELETE n');
                // 上传 JSON 数据到 Neo4j
                for (const item of nodes) {
                    await tx.run('CREATE (n:Node {id:$id, label:$label,name: $name,  cpu_used: $cpu_used, cpu_total: $cpu_total, mem_used: $mem_used,  mem_total: $mem_total, cluster: $cluster})', {
                        id:item.name ,
                        name: item.name,
                        label:item.name,
                        cpu_used: item.cpu_used,
                        cpu_total: item.cpu_allocation,
                        mem_used: item.mem_used,
                        mem_total: item.mem_allocation,
                        cluster: (item.name =='node1'||item.name =='node4'||item.name =='node5')? 1:2
                    });
                }
                // 上传边数据
                for (const edge of decisions) {
                    if(edge.source_node >= edge.target_node){
                        continue
                    }
                    await tx.run('MATCH (a:Node {id: $source}), (b:Node {id: $target}) CREATE (a)-[:CONNECTED_TO {weight: $weight}]->(b)', {
                        source: edge.source_node,
                        target: edge.target_node,
                        weight: 10 
                    });
                }

                await tx.commit();
                console.log("Data uploaded successfully");
                await this.fetchData();
            } catch (error) {
                console.error("Error uploading data:", error);
                await tx.rollback();
            }
        }, */
        
        /* async fetchData() {
            const session = this.driver.session();
            try {
            const result = await session.run('MATCH (n:Node) RETURN n');
            this.nodes = result.records.map(record => {
                const node = record.get('n').properties;
                return {
                    id: node.id,
                    label:node.label,
                    name: node.name,
                    cpu_used: node.cpu_used,
                    cpu_total: node.cpu_total,
                    mem_used: node.mem_used,
                    mem_total: node.mem_total,
                    cluster: node.cluster,
                    x:300,
                    y:300,
                    getter:'yes'
                };
                });
            const edgeResult = await this.session.run('MATCH (a:Node)-[r:CONNECTED_TO]->(b:Node) RETURN a AS source, b AS target,r.weight AS weight');
            this.links = [];
            edgeResult.records.forEach(record => { 
                var renode = record.get('source').properties;
                console.log("renode",renode)
                this.links.push({ source: renode.id, target: record.get('target'),label: record.get('weight'),weight:record.get('weight') });
            });
            console.log("Fetched nodes:", this.nodes);
            console.log("Fetched edges:", this.links);
            await this.drawGraph(); // 重新绘制图形
                } catch (error) {
                console.error('获取数据时出错:', error);
                } finally {
                await session.close();
            }       
      }, */
    importdata(){
        this.nodes = [];
        this.links = [];
        this.data.serviceinfo.Nodes.map((item,i)=>{
            let id = item.name;
            let name = item.name;
            let cpu_used = item.cpu_used
            let cpu_total = item.cpu_allocation
            let mem_used = item.mem_used
            let mem_total = item.mem_allocation
            let cluster = (item.name == 'node1' ||item.name == 'node4'||item.name == 'node5')?1:2
            this.nodes.push({ id: id, name:name,cpu_used:cpu_used,cpu_total:cpu_total,mem_used:mem_used,mem_total:mem_total,cluster:cluster});
        })
        this.data.serviceinfo.Decisions.map((item,i)=>{
            let source = item.source_node
            let target = item.target_node
            let label = item.offloading_percent
            let weight =10
            this.links.push({ source: source, target: target, label: label, weight:weight});
        })
        this.drawGraph();
      },
      drawGraph() {
        const svg = d3.select(this.$refs.svg);
        svg.selectAll("*").remove(); // 清空 SVG 元素
  
        const width = +svg.attr("width");
        const height = +svg.attr("height");
        const linkDistance = (link) => {
            return 300 / link.weight; //权重越大，距离越小
        };
        const simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink()
            .id(d => d.id)
            .distance(linkDistance))
            .force("charge", d3.forceManyBody().strength(-120))
            .force("center", d3.forceCenter(width / 2, height / 2));
        // 添加节点之间的边
        const link = svg.append("g")
          .attr("class", "links")
          .selectAll("line")
          /* .data(this.links.filter(link => link.weight > 5))  */// 节点之间的边
          .enter().append("line")
          .attr("stroke", "#4A90E2") // 节点之间的边颜色
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", 2);
  
        // 添加集群cluster间的边
        svg.append("g")
          .attr("class", "cluster-links")
          .selectAll("line")
          .data(this.links.filter(link => link.weight <= 5)) // 城市之间的边
          .enter().append("line")
          .attr("stroke", "#FF5722") // 城市之间的边颜色
          .attr("stroke-opacity", 0.4)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4 2"); // 使用虚线
  
        const nodeGroup = svg.append("g")

          .attr("class", "nodes");
  
        const node = nodeGroup.selectAll("circle")
          .data(this.nodes)
          .enter().append("circle")
          .attr("r", this.nodeRadius)
          .attr("fill", d => {
            switch (d.cluster) {  
              case 1: return '#E57373';
              case 2: return '#64B5F6';
              default: return '#B0BEC5';
            }
          })
          .attr("stroke", "white")
          .attr("stroke-width", 1.5)
          .call(d3.drag()
            .on("start", this.dragstarted)
            .on("drag", this.dragged)
            .on("end", this.dragended));
  
        // 添加节点名称文本
        const text = nodeGroup.selectAll("text")
          .data(this.nodes)
          .enter().append("text")
          .attr("dy", ".35em")
          .attr("font-size", "12px")
          .attr("fill", "#333")
          .text(d => d.id);
  
        // 创建城市圆圈的引用
        const clusterCircles = svg.append("g").attr("class", "cluster-circles");
  
        simulation
          .nodes(this.nodes)
          .on("tick", () => {
            link
            .attr("x1", d => d.source.x || 0) // 确保有默认值
            .attr("y1", d => d.source.y || 0)
            .attr("x2", d => d.target.x || 0)
            .attr("y2", d => d.target.y || 0);
            node
            .attr("cx", d => (d.x || 0)) // 默认值为 0
            .attr("cy", d => (d.y || 0)); // 默认值为 0
  
            text
              .attr("x", d => d.x)
              .attr("y", d => d.y); // 将文本放置在节点中心
  
            // 更新城市圆圈的位置
            this.drawClusterCircles(clusterCircles);
            this.updateClusterCircles(clusterCircles);
          });
  
        simulation.force("link")
          .links(this.links);
          console.log("nodes after simulation ",this.nodes)
      },
      drawClusterCircles(clusterCircles) {
        console.log(this.nodes)
        const clusterGroups = d3.group(this.nodes, d => d.cluster);
        clusterCircles.selectAll("*").remove(); // 清空城市圆圈
  
        const clusterCenters = {};
        clusterGroups.forEach((nodes, cluster) => {
          if (!nodes || nodes.length === 0) return;
  
          const validXValues = nodes.map(d => (typeof d.x === 'number' ? d.x : 0)).filter(x => x !== null);
          const validYValues = nodes.map(d => (typeof d.y === 'number' ? d.y : 0)).filter(y => y !== null);
          const centerX = d3.mean(validXValues);
          const centerY = d3.mean(validYValues);
          const radius = 30 + nodes.length * 20;
  
          // 创建城市圆圈
          clusterCircles.append("circle")
            .attr("r", radius)
            .attr("fill", "none")
            .attr("stroke", "#FF5722") // 圆圈的颜色
            .attr("stroke-width", 2)
            .attr("opacity", 0.5)
            .attr("cx", centerX)
            .attr("cy", centerY);
  
          clusterCenters[cluster] = { x: centerX, y: centerY, radius: radius };
        });
  
        // 连接城市圆圈的边缘点的逻辑
        // 连接城市圆圈的边缘点

const cities = Object.keys(clusterCenters);

for (let i = 0; i < cities.length; i++) {

for (let j = i + 1; j < cities.length; j++) {

const cluster1 = cities[i];

const cluster2 = cities[j];

const x1 = clusterCenters[cluster1].x;

const y1 = clusterCenters[cluster1].y;

const radius1 = clusterCenters[cluster1].radius;

const x2 = clusterCenters[cluster2].x;

const y2 = clusterCenters[cluster2].y;

const radius2 = clusterCenters[cluster2].radius;

// 计算中心之间的角度

const angle = Math.atan2(y2 - y1, x2 - x1);

// 计算边缘点

const edgeX1 = x1 + radius1 * Math.cos(angle);

const edgeY1 = y1 + radius1 * Math.sin(angle);

const edgeX2 = x2 - radius2 * Math.cos(angle);

const edgeY2 = y2 - radius2 * Math.sin(angle);

// 检查其他城市是否在连接线的路径上

let hasOverlap = false;

for (let k = 0; k < cities.length; k++) {

if (k !== i && k !== j) {

const cluster3 = cities[k];

const cx3 = clusterCenters[cluster3].x;

const cy3 = clusterCenters[cluster3].y;

const radius3 = clusterCenters[cluster3].radius;

// 计算连接线的中点和城市3的距离

const midX = (edgeX1 + edgeX2) / 2;

const midY = (edgeY1 + edgeY2) / 2;

const distance = Math.sqrt((midX - cx3) ** 2 + (midY - cy3) ** 2);

// 如果距离小于半径，说明有重叠

if (distance < radius3) {

hasOverlap = true;

break;

}

}

}

// 计算中间的控制点，用于贝塞尔曲线

const controlX = (edgeX1 + edgeX2) / 2;

let controlY = (edgeY1 + edgeY2) / 2;

if (hasOverlap) {

// 如果有重叠，增加控制点的偏移量

controlY -= 50; // 向上偏移

}

// 使用 D3 绘制曲线

clusterCircles.append("path")

.attr("d", `M ${edgeX1} ${edgeY1} Q ${controlX} ${controlY} ${edgeX2} ${edgeY2}`)

.attr("fill", "none")

.attr("stroke", "#4A90E2")

.attr("stroke-opacity", 0.6)

.attr("stroke-width", 1);

}

}
      },
      updateClusterCircles(clusterCircles) {
        const clusterGroups = d3.group(this.nodes, d => d.cluster);
        clusterGroups.forEach((nodes, cluster) => {
          const centerX = d3.mean(nodes, d => d.x);
          const centerY = d3.mean(nodes, d => d.y);
          // 找到对应的圆圈并更新位置
          clusterCircles.selectAll("circle")
            .filter((d) => d && d.cluster === cluster) // 确保 d 存在
            .attr("cx", centerX)
            .attr("cy", centerY);
        });
      },
      dragstarted(event, d) {
        if (!event.active) d3.forceSimulation().alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      },
      dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      },
      dragended(event, d) {
        if (!event.active) d3.forceSimulation().alphaTarget(0);
        d.fx = null;
        d.fy = null;
      },
    },
    beforeDestroy() {
      if (this.driver) {
        this.driver.close();
      }
    },
  };
  </script>
  
  <style>
  .node {
    fill: steelblue;
  }
  .link {
    stroke: #4A90E2;
    stroke-opacity: 0.6;
    stroke-width: 2;
  }
  </style>