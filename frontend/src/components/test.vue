<template>
    <div>
        <button @click="uploadData">Upload Data to Neo4j</button>
        <div ref="network" style="width: 100%; height: 600px;"></div>
        <div v-if="selectedNode" class="info-panel">
            <h3>Node Information</h3>
            <p><strong>ID:</strong> {{ selectedNode.id }}</p>
            <p><strong>Name:</strong> {{ selectedNode.label }}</p>
            <p><strong>Description:</strong> {{ selectedNode.description }}</p>
        </div>
    </div>
</template>

<script>
import neo4j from 'neo4j-driver';
import { DataSet, Network } from 'vis-network/standalone';

export default {
    data() {
        return {
            driver: null,
            session: null,
            nodes: [],
            edges: [],
            selectedNode: null,
            jsonData: [
                { id: '1', name: 'Node 1', description: 'This is node 1.' },
                { id: '2', name: 'Node 2', description: 'This is node 2.' },
                { id: '3', name: 'Node 3', description: 'This is node 3.' }
            ],
            jsonEdges: [
                { from: '1', to: '2' },
                { from: '2', to: '3' },
                { from: '1', to: '3' }
            ]
        };
    },
    created() {
        this.driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'your_password'));
        this.session = this.driver.session();
    },
    mounted() {
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
        async uploadData() {
            const tx = this.session.beginTransaction();
            try {
                // 清空现有数据
                await tx.run('MATCH (n) DETACH DELETE n');

                // 上传 JSON 数据到 Neo4j
                for (const item of this.jsonData) {
                    await tx.run('CREATE (n:Node {id: $id, name: $name, description: $description})', {
                        id: item.id,
                        name: item.name,
                        description: item.description
                    });
                }

                // 上传边数据
                for (const edge of this.jsonEdges) {
                    await tx.run('MATCH (a:Node {id: $from}), (b:Node {id: $to}) CREATE (a)-[:CONNECTED_TO]->(b)', {
                        from: edge.from,
                        to: edge.to
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
                    const nodeId = node.identity.toString();
                    const nodeName = node.properties.name || 'Unnamed';
                    const nodeDescription = node.properties.description || 'No description available.';
                    this.nodes.push({ id: nodeId, label: nodeName, description: nodeDescription });
                });

                // Fetch edges
                const edgeResult = await this.session.run('MATCH (a:Node)-[r:CONNECTED_TO]->(b:Node) RETURN a.id AS from, b.id AS to');
                this.edges = [];
                edgeResult.records.forEach(record => {
                    this.edges.push({ from: record.get('from'), to: record.get('to') });
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
            const options = {
                nodes: {
                    shape: 'box', // 使用方块形状
                    size: 40,
                    color: {
                        border: '#4CAF50', // 边框颜色
                        background: '#81C784', // 背景颜色
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
                    }
                },
                physics: {
                    enabled: true
                }
            };
            this.network = new Network(container, data, options);

            // 添加节点点击事件
            this.network.on('selectNode', (params) => {
                const nodeId = params.nodes[0];
                const node = this.nodes.find(n => n.id === nodeId);
                if (node) {
                    this.selectedNode = node;
                }
            });
        },
        updateNetwork() {
            const data = {
                nodes: new DataSet(this.nodes),
                edges: new DataSet(this.edges)
            };
            this.network.setData(data);
        }
    }
};
</script>

<style>
/* 添加样式 */
body {
    font-family: Arial, sans-serif;
}

button {
    margin: 10px;
    padding: 10px 20px;
    background-color: #2B7CE9;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #1A5B90;
}

.info-panel {
    margin: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>