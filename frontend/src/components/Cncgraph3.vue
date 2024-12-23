<script>
import * as d3 from 'd3';
import store from '../store/store'
import axios from 'axios'
import colors from '../assets/color.module.scss'
import NeoVis from 'neovis.js';
import neo4j from 'neo4j-driver'
export default {
    name: 'Cncgraph3',
    data() {
      return {
        nodes: [],
        links: [],
        nodeRadius: 10,
        driver: null,
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
            service_list:[],
            services:[],
            selectedNode: null,
            tooltipVisible: false, // 浮窗不可见
            tooltipContent: '', // 浮窗内容
            tooltipStyle: { // 浮窗样式
                position: 'absolute',
                left: '0px',
                top: '0px'
            },
            clusters:[],
            //在后端数据基础上push四个节点测试用
          /*   node0:{ "name": "node5", "cpu_allocation": "311 mcores", "mem_allocation": "211MB", "cpu_used": "211 mcores", "mem_used": "111MB" }, */
            /* node1:{ "name": "node6", "cpu_allocation": "311 mcores", "mem_allocation": "211MB", "cpu_used": "211 mcores", "mem_used": "111MB" }, */
            /* node2:{ "name": "node7", "cpu_allocation": "311 mcores", "mem_allocation": "211MB", "cpu_used": "211 mcores", "mem_used": "111MB" }, */
/*             node3:{ "name": "node8", "cpu_allocation": "311 mcores", "mem_allocation": "211MB", "cpu_used": "211 mcores", "mem_used": "111MB" },*/
            /* link:[{ "source_node": "node3", "target_node": "node6", "offloading_percent": "136%"},{"source_node": "node4", "target_node": "node5", "offloading_percent": "135%"  },{ "source_node": "node3", "target_node": "node7", "offloading_percent": "136%"},{ "source_node": "node3", "target_node": "node8", "offloading_percent": "136%"}], */
      };
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
        /* this.generateDummyData(); // 生成假数据 */
        this.importdata();
        this.drawGraph(); // 绘制图形
    },
    methods: {
        changeServices(){  //服务表单切换函数
            this.services = JSON.parse(JSON.stringify(store.state.CNCSvcinfo))
            console.log("this.services",this.services)
            this.services.map((item,i)=>{
                if(item.Name == this.selectedValue){
                    this.data.serviceinfo = item;
                   /*  this.data.serviceinfo.Nodes.push(this.node0,this.node1,this.node2,this.node3),
                    this.data.serviceinfo.Decisions.push(this.link[0],this.link[1],this.link[2],this.link[3]) */
                }
            })
            this.importdata() //上传数据
        },
        showTooltip(content, x, y) { //展示浮窗
            this.tooltipContent = content;
            this.tooltipStyle.left = `${x}px`;
            this.tooltipStyle.top = `${y}px`;
            this.tooltipVisible = true;
        },
        hideTooltip() { 
            this.tooltipVisible = false;
        },
        showClusterInfo(cluster) { //显示集群信息
            const cluster1 = { name: "Cluster A", nodes: [] };
            const cluster2 = { name: "Cluster B", nodes: [] };
            this.nodes.forEach(node => {
                if (node.cluster == 'CluserA') { cluster1.nodes.push(node);
                } else {
                    cluster2.nodes.push(node);
                }
            });
            this.clusters = [cluster1, cluster2];
        },
        getcluster(node_name){
            if(node_name == "node1"||node_name == "node4"||node_name == "node5")
                return 'ClusterA';
            else    
                return 'ClusterB';
        },
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
            const clusters = d3.group(this.nodes, d => d.cluster);
            this.showClusterInfo(this.clusters) //修改集群存储形式
            clusters.forEach(clusterNodes => {// 为同一集群的所有节点添加虚拟链接，便于聚合
                for (let i = 0; i < clusterNodes.length; i++) {
                    for (let j = i + 1; j < clusterNodes.length; j++) {
                        this.links.push({
                            source: clusterNodes[i].id,
                            target: clusterNodes[j].id,
                            weight: 0.5 
                        });
                    }
                }
            });
            this.data.serviceinfo.Decisions.map((item,i)=>{ //存储边
                let source = item.source_node
                let target = item.target_node
                if(source < target){
                    if(source != target){
                        let label = item.offloading_percent
                        let weight = 10
                        this.links.push({ source: source, target: target, label: label, weight:weight});
                    }  
                }
            })
            this.drawGraph();
        },
        async uploadData() {
            const session = this.driver.session();
            try {
                for (const node of this.nodes) {
                    await session.run(
                        'CREATE (n:Person {id: $id, age: $age, cluster: $cluster}) RETURN n',
                        { id: node.id, age: node.age, cluster: node.cluster }
                    );
                    } 
                for (const link of this.links) {
                    await session.run(
                        'MATCH (a:Person {id: $source}), (b:Person {id: $target}) CREATE (a)-[:LINK {weight: $weight}]->(b)',
                        { source: link.source, target: link.target, weight: link.weight }
                    );
                }
            } catch (error) {
                console.error('上传数据时出错:', error);
            } finally {
                await session.close();
            }
        },
        async fetchData() {
            const session = this.driver.session();
            try {
          const result = await session.run('MATCH (n:Person) RETURN n');
  
          this.nodes = result.records.map(record => {
            const node = record.get('n').properties;
            return {
              id: node.id,
              age: node.age,
              cluster: node.cluster,
            };
          });
          console.log("this.nodes",this.nodes)
          this.drawGraph(); // 重新绘制图形
        } catch (error) {
          console.error('获取数据时出错:', error);
        } finally {
          await session.close();
        }
      },
      
        drawGraph() {
            const svg = d3.select(this.$refs.svg);
            svg.selectAll("*").remove(); // 清空 SVG 元素
            svg.append("foreignObject")
                .attr("x", 80)
                .attr("y", 40)
                .attr("width", 200)
                .attr("height", 100)
                .append("xhtml:div")
                .html(`
                <button class = "button" id="showEdges">查看完整的服务卸载图</button>
                <button class = "button" id="hideEdges">仅查看节点</button>
            `)
            d3.selectAll("foreignObject .button")
                .style("background-color", "#3498db")
                .style("color", "white")
                .style("border", "none")
                .style("padding", "10px 20px")
                .style("left", "20px")
                .style("cursor", "pointer")
                .style("margin", "5px")
                .style("border-radius", "5px");
            // 显示所有边、标签和箭头
            d3.select("#showEdges").on("click", () => {
                link.attr("stroke-opacity", 1); // 显示所有边
                link.attr("marker-end", "url(#arrow)"); // 显示所有箭头
                labels.attr("opacity", 1); // 显示所有标签
            });
            // 隐藏所有边、标签和箭头
            d3.select("#hideEdges").on("click", () => {
                link.attr("stroke-opacity", 0);
                link.attr("marker-end", null); 
                labels.attr("opacity", 0); 
            });
            const width = +svg.attr("width");
            const height = +svg.attr("height");
            const linkDistance = (link) => {
            const sourceCluster = this.nodes.find(node => node.id === link.source.id).cluster;
            const targetCluster = this.nodes.find(node => node.id === link.target.id).cluster;
            // 如果两个节点在同一个 cluster，设置较短的距离
            if (sourceCluster === targetCluster) {
                return 50; 
            } else {
                return 3000 / link.weight; // 权重越大，距离越小
            }
        };
            const arrow = svg.append("defs").selectAll("marker")
                .data(["end"]) 
                .enter().append("marker")
                .attr("id", "arrow")
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15) // 参考点 x 位置
                .attr("refY", 0) // 参考点 y 位置
                .attr("markerWidth", 6) // 箭头宽度
                .attr("markerHeight", 6) // 箭头高度
                .attr("orient", "auto")
                .append("polygon")
                .attr("points", "0,-5 10,0 0,5") // 箭头形状
                .attr("fill", "#4A90E2") // 箭头颜色
                .attr("stroke-opacity", 0);
            const simulation = d3.forceSimulation(this.nodes)
                .force("link", d3.forceLink()
                .id(d => d.id)
                .distance(linkDistance))
                .force("charge", d3.forceManyBody().strength(-180))
                .force("center", d3.forceCenter(width / 1.5, height / 1.5));
            // 添加节点之间的边
            const link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(this.links.filter(link => link.weight > 5)) // 节点之间的边
                .enter().append("line")
                .attr("stroke", "#4A90E2") // 节点之间的边颜色
                .attr("marker-end", null)// 使用箭头标记
                .attr("stroke-opacity", 0)
                .attr("stroke-width", 2)
            const labels = svg.append("g")
                .attr("class", "labels")
                .selectAll("text")
                .data(this.links)
                .enter().append("text")
                .attr("dy", -5) // 调整文本垂直位置
                .attr("text-anchor", "middle") // 文本居中
                .attr("fill", "gray") // 文本颜色
                .attr("font-size", "8px") // 设置字体大小
                .attr("font-family", "Arial") // 字体类型
                .attr("opacity", 0) // 初始状态下隐藏标签
                .text(d => d.label); // 使用边的标签
            // 添加城市间的边
            svg.append("g")
                .attr("class", "cluster-links")
                .selectAll("line")
                .data(this.links.filter(link => link.weight <= 5)) // 城市之间的边
                .enter().append("line")
                .attr("stroke", "#FF5722") 
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4 2");
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
            node.on("click", (event, d) => {
                const [x, y] = d3.pointer(event);
                this.showTooltip(`Node: ${d.id},\n总CPU:${d.cpu_total},\n已使用CPU:${d.cpu_used},\n总内存:${d.mem_total},\n已使用内存:${d.mem_used},\n`, x + 50, y + 50); // 10px 偏移以避免遮挡
                const connectedLinks = link.filter(l => l.source.id === d.id || l.target.id === d.id);
                // 隐藏所有边和标签
                link.attr("marker-end", null); 
                link.attr("stroke-opacity", 0);
                arrow.attr("stroke-opacity", 0)
                labels.attr("opacity", 0);
                // 显示与当前节点相连的边和标签
                connectedLinks.attr("stroke-opacity", 1);
                connectedLinks.attr("stroke-opacity", 1).attr("marker-end", "url(#arrow)");
                labels.filter(l => l.source.id === d.id || l.target.id === d.id).attr("opacity", 1);
            });
            node.on("mouseleave", () => {
                this.hideTooltip();    
            });
            // 创建城市圆圈的引用
            const clusterCircles = svg.append("g").attr("class", "cluster-circles");
            simulation
                .nodes(this.nodes)
                .on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                text
                    .attr("x", d => d.x)
                    .attr("y", d => d.y); // 将文本放置在节点中心
                labels
                    .attr("x", d => (d.source.x + d.target.x) / 2) // 文本 X 位置
                    .attr("y", d => (d.source.y + d.target.y) / 2); // 文本 Y 位置
            // 更新城市圆圈的位置
            this.drawclusterCircles(clusterCircles);
            this.updateclusterCircles(clusterCircles);
          });
            simulation.force("link")
            .links(this.links);
        },
        drawclusterCircles(clusterCircles) {
            const clusterGroups = d3.group(this.nodes, d => d.cluster);
            clusterCircles.selectAll("*").remove(); // 清空城市圆圈
            const clusterCenters = {};
            clusterGroups.forEach((nodes, cluster) => {
                if (!nodes || nodes.length === 0) return;
                const validXValues = nodes.map(d => (typeof d.x === 'number' ? d.x : 0)).filter(x => x !== null);
                const validYValues = nodes.map(d => (typeof d.y === 'number' ? d.y : 0)).filter(y => y !== null);
                const centerX = d3.mean(validXValues);
                const centerY = d3.mean(validYValues);
                const radius = 40 + nodes.length * 10;
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
            // 连接城市圆圈的边缘点
            const clusters = Object.keys(clusterCenters);
            for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const cluster1 = clusters[i];
                const cluster2 = clusters[j];
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
                for (let k = 0; k < clusters.length; k++) {
                    if (k !== i && k !== j) {
                        const cluster3 = clusters[k];
                        const cx3 = clusterCenters[cluster3].x;
                        const cy3 = clusterCenters[cluster3].y;
                        const radius3 = clusterCenters[cluster3].radius;
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
                if (hasOverlap) {// 如果有重叠，增加控制点的偏移量
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
        updateclusterCircles(clusterCircles) {
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
  <template>
    <div class="selector">
       <div class="title-text">查看服务对应的服务卸载图</div>
       <el-select class="select" v-model="selectedValue" filterable placeholder="请选择" @change="changeServices">
         <el-option v-for="svc in service_list" :key="svc" :label="svc" :value="svc" />
       </el-select>
     </div>
      
       
   <div>
<!--        <svg ref="svg" width="100%" height="100%"></svg>  -->
       <svg ref="svg" width="800" height="500"></svg>
       <div v-if="tooltipVisible" 
            :style="tooltipStyle" 
            class="tooltip">
           {{ tooltipContent }}
       </div>
   </div>
   <div class="cluster-table">
           <table>
               <thead>
                   <tr>
                       <th>Cluster Name</th>
                       <th>Node Name</th>
                       <th>Used CPU</th>
                       <th>Total CPU</th>
                       <th>Used Memory</th>
                       <th>Total Memory</th>
                   </tr>
               </thead>
               <tbody>
                   <template v-for="(cluster, index) in clusters" :key="index">
                       <tr v-for="(node, nodeIndex) in cluster.nodes" :key="nodeIndex">
                           <td v-if="nodeIndex === 0" :rowspan="cluster.nodes.length">{{ cluster.name }}</td>
                           <td>{{ node.name }}</td>
                           <td>{{ node.cpu_used }}</td>
                           <td>{{ node.cpu_total }}</td>
                           <td>{{ node.mem_used }}</td>
                           <td>{{ node.mem_total }}</td>
                       </tr>
                   </template>
               </tbody>
           </table>
       </div>
 </template>
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
<style scoped>


 .selector{
    background-color: rgba(52, 152, 219, 0.8);
    font-family: 'Roboto', sans-serif;
    font-size: 20px;
  }
.tooltip {
    background-color: rgba(255, 245, 204, 0.9); 
    border: 1px solid #f0c36d; /* 边框颜色 */
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: opacity 0.3s ease;
    pointer-events: none; /* 防止浮窗捕获鼠标事件 */
    z-index: 10;
    font-family: Arial, sans-serif;
    font-size: 14px;
    color: #333; /* 文本颜色 */
    white-space: pre-wrap; /* 允许空格和换行 */
}
.cluster-info {
    position: absolute;
    top: 200px; /* 距离顶部的距离 */
    right: 20px; /* 距离右侧的距离 */
/*     background-color: rgba(255, 255, 255, 0.9); */
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
    color: #333;
    width: 200px; /* 浮窗宽度 */
}
.cluster-table {
    position: absolute;
    top: 200px;
    right: 100px;
  /*   background-color: rgba(255, 255, 255, 0.9); */
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    max-width: 400px;
    overflow: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    border: 1px solid #ccc;
    padding: 5px;
    text-align: left;
}

th {
/*     background-color: #f0f0f0; */
}

</style>