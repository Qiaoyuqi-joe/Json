<script>
/*网络拓扑图假数据版本*/
import neo4j from 'neo4j-driver';
import { DataSet, Network } from 'vis-network/standalone';
export default {
name: 'Nettopology',
data() {
    return {
        selectedValue: null,
        selectedNode: null,
        service_list: [],
        nodes: [],
        edges: [],
        nodes1:[],
        edges1:[],
        nodeNames: ['Node1', 'Node2', 'Node3', 'Node4', 'Node5', 'Node6', 'Node7', 'Node8'],
        baseNodeColors: {
          ClusterA: { background: '#FF5733', border: '#C70039' }, // 红色
          ClusterB: { background: '#2196F3', border: '#1E88E5' }, // 绿色
        },
        initialNodeColors: {},
        connectedNodes: { users: [], services: [] },
        connectedUserNodes:{bases: [], services: []},
        weights:[],
        showBackButton: false, 
        baseNodes: [
          { name: "BaseNode1", cluster: "ClusterA" },
          { name: "BaseNode2", cluster: "ClusterB" },
          { name: "BaseNode3", cluster: "ClusterB" },
          { name: "BaseNode4", cluster: "ClusterA" },
          { name: "BaseNode5", cluster: "ClusterA" },
          { name: "BaseNode6", cluster: "ClusterB" },
          { name: "BaseNode7", cluster: "ClusterB" },
          { name: "BaseNode8", cluster: "ClusterB" },
        ],     
        userNodes: Array.from({ length: 50 }, (_, i) => ({
          name: `User${i + 1}`,
          cpu_allocation: "50 mcores",
          mem_allocation: "50MB",
          cpu_used: "25 mcores",
          mem_used: "25MB",
          cluster: i % 2 === 0 ? "ClusterA" : "ClusterB",
          connected: false,
        })),
        serviceNodes: [
          { name: "Service1", cpu_allocation: "100 mcores", mem_allocation: "100MB", cpu_used: "50 mcores", mem_used: "50MB" },
          { name: "Service2", cpu_allocation: "200 mcores", mem_allocation: "200MB", cpu_used: "100 mcores", mem_used: "100MB" },
          { name: "Service3", cpu_allocation: "300 mcores", mem_allocation: "300MB", cpu_used: "150 mcores", mem_used: "150MB" },
          { name: "Service4", cpu_allocation: "400 mcores", mem_allocation: "400MB", cpu_used: "200 mcores", mem_used: "200MB" },
        ],
    };
},
    created() {
        this.driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'password'));
        this.session = this.driver.session();
        this.service_list = this.serviceNodes.map(s => s.name);
    },
    computed: { //监听基站事件实现点击
        isEdit1() {
            return (this.selectedNode && this.selectedNode.id.startsWith("Base"))
        },
    },
    watch: {
      selectedNode(newNode) {
        if (newNode && newNode.id.startsWith('BaseNode')) {
          this.$nextTick(() => {
            this.initBaseNetwork();
          });
        }
      }
    },
    mounted() {
        this.importdata();
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
    methods: {
      async importdata() {
        const tx = this.session.beginTransaction();
        const nodes = [...this.serviceNodes, ...this.baseNodes, ...this.userNodes];
        try {
          await tx.run('MATCH (n) DETACH DELETE n');
  
          // 上传所有节点
          for (const item of nodes) {
            await tx.run('CREATE (n:Node {id:$id, label:$label, name: $name, cpu_used: $cpu_used, cpu_total: $cpu_total, mem_used: $mem_used, mem_total: $mem_total, cluster: $cluster,size:$size})', {
              id: item.name,
              name: item.name,
              label: item.name,
              cpu_used: item.cpu_used || null,
              cpu_total: item.cpu_allocation || null,
              mem_used: item.mem_used || null,
              mem_total: item.mem_allocation || null,
              cluster: item.cluster || null,
              size: (item.name == 'BaseNode1'||item.name == 'BaseNode2'||item.name == 'BaseNode3'||item.name == 'BaseNode4'||item.name == 'BaseNode5'||item.name == 'BaseNode6'||item.name == 'BaseNode7'||item.name == 'BaseNode8')?100:20
            });
          }
          this.weights = Array.from({ length: this.baseNodes.length }, () => Array(this.baseNodes.length).fill(0));
          // 创建双向边：每两个基站之间连两条边，带上权重
          for (let i = 0; i < this.baseNodes.length; i++) {
            for (let j = i ; j < this.baseNodes.length; j++) {
            if(i == j){
                this.weights[i][j] ='inf'
                continue
            }
              const baseNodeA = this.baseNodes[i].name;
              const baseNodeB = this.baseNodes[j].name;
              const weight1= Math.floor(Math.random() * 100) + 1+'Gbps' 
              const weight2= Math.floor(Math.random() * 100) + 1+'Gbps' 
              this.weights[i][j] = weight1
              this.weights[j][i] = weight2
              await tx.run('MATCH (a:Node {id: $from}), (b:Node {id: $to}) CREATE (a)-[:CONNECTED_TO {weight: $weight, width: 4}]->(b)', {
                from: baseNodeA,
                to: baseNodeB,
                weight:weight1,
              });
              await tx.run('MATCH (a:Node {id: $from}), (b:Node {id: $to}) CREATE (b)-[:CONNECTED_TO {weight: $weight, width: 4}]->(a)', {
                from: baseNodeA,
                to: baseNodeB,
                weight: Math.floor(Math.random() * 100) + 1 +'Gbps'
              });
            }
          }
          // 每个基站与四个服务节点相连（后来决定不显示，但程序没删）
          for (const baseNode of this.baseNodes) {
            const connectedServices = this.serviceNodes.sort(() => 0.5 - Math.random()).slice(0, 4);
            for (const service of connectedServices) {
              await tx.run('MATCH (a:Node {id: $from}), (b:Node {id: $to}) CREATE (a)-[:CONNECTED_TO]->(b)', {
                from: baseNode.name,
                to: service.name
              });
            }
          }
          // 每个用户节点连接 1 到 4 个服务节点(也未显示)
          for (const user of this.userNodes) {
            const numberOfConnections = Math.floor(Math.random() * 8) + 1;
            const connectedServices = this.serviceNodes.sort(() => 0.5 - Math.random()).slice(0, numberOfConnections);
            for (const service of connectedServices) {
              await tx.run('MATCH (a:Node {id: $from}), (b:Node {id: $to}) CREATE (a)-[:CONNECTED_TO]->(b)', {
                from: user.name,
                to: service.name
              });
            }
          }
  
          // 每个用户节点连接且仅连接一个基站节点
          for (const user of this.userNodes) {
            const matchingBaseNodes = this.baseNodes.filter(base => base.cluster === user.cluster);
            if (matchingBaseNodes.length > 0) {
              const randomBaseNode = matchingBaseNodes[Math.floor(Math.random() * matchingBaseNodes.length)];
              await tx.run('MATCH (a:Node {id: $from}), (b:Node {id: $to}) CREATE (a)-[:CONNECTED_TO]->(b)', {
                from: user.name,
                to: randomBaseNode.name
              });
            }
          }
  
          await tx.commit();
          await this.fetchGraph();
        } catch (error) {
          console.error("上传数据时出错:", error);
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
  
            // 根据集群设置节点颜色
            let nodeColor;
            let nodeSize = 5; // 默认节点大小
  
            if (node.properties.cluster === "ClusterA") {
              nodeColor = this.baseNodeColors.ClusterA;
            } else if (node.properties.cluster === "ClusterB") {
              nodeColor = this.baseNodeColors.ClusterB;
            } else {
              nodeColor = {background: '#33FF57', border: '#39C700'}; // 默认蓝色
            }
  
            // 判断是否为 BaseNode，设置较大的节点框
            if (node.properties.label.startsWith('BaseNode')) {
              nodeSize = 300; // 增加 BaseNode 的大小
              this.initialNodeColors[nodeId] = { ...nodeColor };
            }
  
            // 仅添加 BaseNode 和 ServiceNode，隐藏 UserNode
            if (node.properties.label.startsWith('BaseNode') ) {
              this.nodes.push({
                id: nodeId,
                label: node.properties.label,
                name: node.properties.name,
                cpu_used: node.properties.cpu_used,
                cpu_total: node.properties.cpu_total,
                mem_used: node.properties.mem_used,
                mem_total: node.properties.mem_total,
                cluster: node.properties.cluster,
                color: nodeColor,
                shape: 'box',
                size: nodeSize,
              });
            } else {
              this.nodes.push({
                id: nodeId,
                label: node.properties.label,
                cluster:node.properties.cluster,
                name: node.properties.name,
                hidden: true,
              });
            }
          });
  
          // 获取边
          const edgeResult = await this.session.run('MATCH (a:Node)-[r:CONNECTED_TO]->(b:Node) RETURN a.id AS from, b.id AS to, r.weight AS weight');
          this.edges = [];
          edgeResult.records.forEach(record => {
            const fromNode = record.get('from');
            const toNode = record.get('to');
            const weight = record.get('weight');
  
            // 仅当边的两个节点都是 BaseNode 时，显示权重
            const fromIsBaseNode = fromNode.startsWith('BaseNode');
            const toIsBaseNode = toNode.startsWith('BaseNode');
  
            this.edges.push({ 
              from: fromNode, 
              to: toNode, 
              label: (fromIsBaseNode && toIsBaseNode && weight) ? weight.toString() : undefined,
              width: (fromIsBaseNode && toIsBaseNode) ? 2 : 0.5 // 基站之间边宽度为4
            });
          });
          this.edges1 = new DataSet(this.edges);
          this.nodes1 = new DataSet(this.nodes);
          this.updateNetwork();
          if(this.selectedNode && this.selectedNode.id.startsWith("Base")){
            this.updateBaseNetwork();
          }
        } catch (error) {
          console.error("获取图形数据时出错:", error);
        }
      },
      
      initNetwork() {
   /*      const baseContainer = this.$refs.basenetwork; */
        const container = this.$refs.network;
        const data = {
          nodes: new DataSet(this.nodes),
          edges: new DataSet(this.edges),
        };
        const data1 = {
          nodes: new DataSet(this.nodes),
          edges: new DataSet(this.edges),
        };
        const options = {
          physics: {
            enabled: true,
            barnesHut: {
              gravitationalConstant: -10000,
              centralGravity: 0.9,
              springLength: 300,
              springConstant: 0.1,
            },
          },
          manipulation: {
            enabled: true,
          },
          nodes: {
            shape: 'circle',
            size: 20,
            font: {
              color: '#ffffff',
              size: 12,
            },
          },
          edges: {
            color: {
              color: '#9E9E9E',
              highlight: '#FF5722',
              hover: '#8B4513'//'#FF5722',
            },
            width: 1, // 默认边宽度
            arrows: {
              to: { enabled: false },
              from: { enabled: false },
            },
            smooth: {
              type: 'continuous',
              roundness: 0.5,
            },
            font: {
              size: 12,
              color: '#000000',
            },
          },
        };
  
        this.network = new Network(container, data, options);
       /*  this.basenetwork = new Network(baseContainer, data1, options); */
        // 绑定节点点击事件
        this.network.on('click', (params) => {
          if (params.nodes.length) {
            const clickedNodeId = params.nodes[0];
            const clickedNode = this.nodes.find(node => node.id === clickedNodeId);
            // 仅在点击基站节点时显示用户节点和边
            if (this.baseNodes.some(base => base.name === clickedNodeId)) {
              this.handleClickedNodes(clickedNodeId);
              this.showBackButton = true; 
            }else if (clickedNodeId.startsWith('User')) {
                this.showUserConnectedNodes(clickedNodeId); // 显示与用户节点连接的基站
            }
          }
          
        });
      },
      initBaseNetwork(){
        const baseContainer = this.$refs.basenetwork;
        const data1 = {
          nodes: this.nodes1,
          edges: this.edges1,
        };
        const options = {
          physics: {
            enabled: true,
            updateInterval:1000, // 更新间隔
            barnesHut: {
              gravitationalConstant: -10000,
              centralGravity: 0.9,
              springLength: 300,
              springConstant: 0.1,
            },
          },
          manipulation: {
            enabled: true,
          },
          nodes: {
            shape: 'circle',
            size: 20,
            font: {
              color: '#ffffff',
              size: 12,
            },
          },
          edges: {
            color: {
              color: '#9E9E9E',
              highlight: '#FF5722',
              hover: '#8B4513'//'#FF5722',
            },
            width: 1, // 默认边宽度
            arrows: {
              to: { enabled: false },
              from: { enabled: false },
            },
            smooth: {
              type: 'continuous',
              roundness: 0.5,
            },
            font: {
              size: 12,
              color: '#000000',
            },
          },
        };

       this.basenetwork = new Network(baseContainer, data1, options); 
       
      },
        showUserConnectedNodes(userNodeId) {
          // 获取与用户节点连接的基站
          const connectedBaseNodes = this.edges
              .filter(edge => edge.from === userNodeId && edge.to.startsWith('BaseNode'))
              .map(edge => edge.to)
              .sort();

          const connectedServices = this.edges
              .filter(edge => edge.from === userNodeId && edge.to.startsWith('Service'))
              .map(edge => edge.to)
              .sort();
          this.connectedUserNodes = {
              bases: connectedBaseNodes,
              services: connectedServices,
            };

        // 更新选中的节点信息
        this.selectedNode = this.nodes.find(node => node.id === userNodeId);
        console.log("this.selectedNode",this.selectedNode)
      },
    resetView() {
        this.fetchGraph();
        this.showBackButton = false; // 隐藏返回按钮
        this.selectedNode =null;
        this.updateNetwork(); 

      },
    handleClickedNodes(baseNodeId){
      console.log("here")
      this.showConnectedUserNodes(baseNodeId)
      this.getBasetopo(baseNodeId);
    },
    showConnectedUserNodes(baseNodeId) {
        console.log("点击了")
        const clickedNode = this.nodes.find(node => node.id === baseNodeId);
        const cluster = clickedNode.cluster;
        const baseColor = this.baseNodeColors[cluster];
        // 获取与基站连接的用户节点和服务节点
        const connectedUsers = this.edges
          .filter(edge => edge.to === baseNodeId && edge.from.startsWith('User'))
          .map(edge => edge.from)
          .sort();
        const connectedServices = this.edges
          .filter(edge => edge.from === baseNodeId && edge.to.startsWith('Service'))
          .map(edge => edge.to)
          .sort();
        this.connectedNodes = {
          users: connectedUsers,
          services: connectedServices,
        };
        console.log("connectednodes",this.connectedNodes)
        // 更新选中的节点信息
       this.selectedNode = this.nodes.find(node => node.id === baseNodeId);

      // 保留所有 BaseNode
        this.nodes.forEach(node => {
          if (node.id === baseNodeId) {
            node.color = this.initialNodeColors[node.id]; 
          } else if (connectedUsers.includes(node.id)) {
            node.color = baseColor;
            node.hidden = false;
          } else if (this.initialNodeColors[node.id]) {
            node.color = this.initialNodeColors[node.id];
          } else if (node.label.startsWith('User')) {
            node.hidden = true;
          }
        });

        this.nodes.forEach(node => {
          node.hidden = !(connectedUsers.includes(node.id)||node.id === baseNodeId) 
        });


        this.edges.forEach(edge => {
          if ((edge.to === baseNodeId ||edge.from === baseNodeId) ) {
              console.log(connectedUsers)
              edge.color = { color: this.initialNodeColors[baseNodeId].background, highlight: this.initialNodeColors[baseNodeId].background }
            edge.width = 1; // 加粗
          } else if(edge.from.startsWith('BaseNode') && edge.to.startsWith('BaseNode')) {
            edge.color = { color: '#9E9E9E' }; // 默认颜色
            edge.width = 2; // 恢复默认宽度
          }else if (edge.from.startsWith('User') ||edge.to.startsWith('User')){
              edge.color = { color: this.initialNodeColors[baseNodeId].background, highlight: this.initialNodeColors[baseNodeId].background }
            edge.width = 1; // 恢复默认宽度
          }else if(edge.from.startsWith('Base') && edge.to.startsWith('Service')){
              edge.color = { color: '#9E9E9E' }; // 默认颜色
              edge.width = 1; // 恢复默认宽度
          }
        });

  

        this.edges.forEach(edge => {
          edge.hidden = !(connectedUsers.includes(edge.from) && edge.to === baseNodeId) 
        });

        this.updateNetwork();
        
      },
  
      updateNetwork() {
        if (this.network) {
          const data = {
            nodes: new DataSet(this.nodes.filter(node => !node.hidden)),
            edges: new DataSet(this.edges.filter(edge => !edge.hidden)),
          };
          this.network.setData(data);
          this.network.redraw(); // 重新绘制网络以应用样式更改
        } else {
          console.error('网络实例无效。');
        }
      },
      getBasetopo(baseNodeId){//基站拓扑图
        var clickedNode = this.nodes.find(node => node.id === baseNodeId);
        var cluster = clickedNode.cluster;
        const baseColor = this.baseNodeColors[cluster];
            // 获取与基站连接的用户节点和服务节点
            const connectedBases = this.edges
              .filter((edge => edge.to === baseNodeId && edge.from.startsWith('Base'))|| (edge => edge.from === baseNodeId && edge.to.startsWith('Base')))
              .map(edge => edge.from)
              .sort();
          
        this.nodes.forEach(node => {
          node.hidden = !(connectedBases.includes(node.id)||node.id === baseNodeId) 
        });
        this.edges.forEach(edge => {
          edge.hidden = !((connectedBases.includes(edge.from) && edge.to === baseNodeId) ||(connectedBases.includes(edge.to) && edge.from === baseNodeId))
          edge.color = { color: '#9E9E9E' }; // 默认颜色
          edge.width = 2;
        });
        console.log("selected",this.selectedNode)
        this.updateBaseNetwork();
      },
      updateBaseNetwork(){
        if (this.basenetwork) {
          const data1 = {
            nodes: this.nodes.filter(node => !node.hidden),
            edges: this.edges.filter(edge => !edge.hidden),
          };
          this.basenetwork.setData({
              nodes: data1.nodes,
              edges: data1.edges,
            });
          this.basenetwork.redraw(); // 重新绘制网络以应用样式更改
        } else {
          console.error('网络实例无效。');
          }
          }
        }
        };
  </script>
  
<template>
  
      <div class ="chart-container">
        <h2 v-if = "selectedNode">当前基站用户接入情况</h2>
        <h2 v-else>网络拓扑图</h2>
        <div ref="network"  class = "network-container" style="width: 100%; height: 800px;"></div>
        <button v-if="showBackButton" class="back-button" @click="resetView">返回网络拓扑图</button>
        
        <div v-if="selectedNode" class="info-panel">
          <h3>节点信息</h3>
          <p><strong>节点名称:</strong> {{ selectedNode.name }}</p>
        <div v-if="selectedNode.id.startsWith('BaseNode')" >
            <h4>节点类型</h4>
          <ul>
            <li >基站</li>
          </ul>
          <p><strong>所属集群:</strong> {{ selectedNode.cluster }}</p> 
          <h4>基站连接的用户节点:</h4>
          <ul>
            <li v-for="user in connectedNodes.users" :key="user">{{ user }}</li>
          </ul>
          <h4>该基站部署的服务:</h4>
          <ul>
            <li v-for="service in connectedNodes.services" :key="service">{{ service }}</li>
          </ul>
        </div>

        <div v-else-if="selectedNode.id.startsWith('User')">
            <h4>节点类型</h4>
          <ul>
            <li >用户</li>
          </ul>
          <p><strong>所属集群:</strong> {{ selectedNode.cluster }}</p> 
          <h4>该用户连接的基站:</h4>
          <ul>
            <li v-for="base in connectedUserNodes.bases" :key="base">{{ base }}</li>
          </ul>
          <h4>该用户部署的服务</h4> 
          <ul>
            <li v-for="service in connectedUserNodes.services" :key="service">{{ service }}</li>
          </ul>
        </div>

      </div>
      <div v-if="selectedNode" >
          <div v-if="selectedNode.id.startsWith('BaseNode')">
          <h2>与当前基站相关的拓扑结构</h2>
          <div ref="basenetwork" class = "base-container"></div>
        </div>
      </div>
    <div>
        <h2>网络状态表</h2>
        <table>
            <thead>
            <tr>
            <th>起始/终止节点</th>
            <th v-for="node in nodeNames" :key="node">{{ node }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(row, rowIndex) in weights" :key="rowIndex">
            <td>{{ nodeNames[rowIndex] }}</td>
            <td v-for="(weight, colIndex) in row" :key="colIndex">{{ weight }}</td>
        </tr>
        </tbody>
    </table>
  </div>
    </div>
    </template>
  <style>
  .chart-container {
  position: relative;
  background-color: rgba(236, 240, 241); /* 淡色背景 */
  
  
}
  .network-container{
    /* position:absolute; */
    background-color:rgba(216, 220, 221, 0.8);
    border-radius: 10px; /* 圆角效果 */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); /* 增加阴影 */
    padding: 20px; /* 增加内边距 */
  }
  .base-container{
    background-color:rgba(216, 220, 221, 0.8);
    border-radius: 10px; /* 圆角效果 */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); /* 增加阴影 */
    padding: 40px; /* 增加内边距 */
    margin-top:30px;
    height:800px;
  }
  .info-panel {
    position: absolute;
    top: 120px; /* 距离顶部的距离 */
    right: 100px; /* 距离右侧的距离 */
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
    color: #333;
    width: 200px; /* 浮窗宽度 */
  }
  .table-container {
    background-color: rgba(236, 240, 241, 0.8); /* 表格背景色 */
    border-radius: 8px; /* 圆角效果 */
    padding: 20px; /* 内边距 */
    margin-top: 40px; /* 与图的间距 */
}

/* 表格样式 */
table {
    width: 100%; /* 表格宽度100% */
    border-collapse: collapse; /* 合并边框 */
}

th, td {
    padding: 10px; /* 单元格内边距 */
    text-align: left; /* 左对齐 */
    border-bottom: 1px solid #ddd; /* 单元格底部边框 */
}

th {
    background-color: rgba(52, 152, 219, 0.8); /* 表头背景色 */
    color: white; /* 表头文字颜色 */
}

tr:hover {
    background-color: rgba(52, 152, 219, 0.2); /* 悬停效果 */
}

  .selector {
    margin: 20px;
    padding: 12px 24px;
    background: #BBDEFB;
    border-radius: 8px;
  }
  
  


.connected-nodes-panel {
  top: 200px;
  right:100px;
  border-radius: 8px;
  background-color: #ffffff; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.back-button {
  position: absolute;
  top: 200px;
  left: 180px;
  padding: 10px 20px;
  background-color: #3498db; /* 按钮颜色 */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
/*   z-index: 1000; */
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #2980b9; /* 悬停效果 */
}
  </style>