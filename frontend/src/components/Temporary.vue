<script>
export default{
    name:Temporary,
    data(){
        return{
            serviceinfo:{}
        }
    },
    mounted(){

    },
    methods:{
        valInit(){
            this.serviceinfo.Name=['cncgraph']
            this.serviceinfo.decision='';
            getNodes=[{"name": "node1","cpu_allocation": "","mem_allocation": "","cpu_used": "","mem_used": ""},{"name": "node2","cpu_allocation": "","mem_allocation": "","cpu_used": "","mem_used": ""},{"name": "node3","cpu_allocation": "","mem_allocation": "","cpu_used": "","mem_used": ""},{"name": "node4","cpu_allocation": "","mem_allocation": "","cpu_used": "","mem_used": ""}]
            var Nodes=[];
            for(let n=1; n<=getNodes.length; n++){
                Nodes.push(getNodes[n])
            }
            this.serviceinfo.Nodes = Nodes;
            getNetworks = [{"source_node": "node1","target_node": "node1","latency": "-1 ms","bandwidth": "-1 Gbps"},{"source_node": "node1","target_node": "node2","latency": "12ms","bandwidth": "12Gbps"},{ "source_node": "node1","target_node": "node3","latency": "13ms","bandwidth": "13Gbps"},{"source_node": "node1","target_node": "node4","latency": "14ms","bandwidth": "14Gbps"},{"source_node": "node2","target_node": "node1","latency": "21ms","bandwidth": "21Gbps"},{"source_node": "node2","target_node": "node2","latency": "-1 ms","bandwidth": "-1 Gbps"},{"source_node": "node2","target_node": "node3","latency": "23ms","bandwidth": "23Gbps"},{"source_node": "node2","target_node": "node4","latency": "24ms","bandwidth": "24Gbps"},{"source_node": "node3","target_node": "node1","latency": "31ms","bandwidth": "31Gbps"},{"source_node": "node3","target_node": "node2","latency": "32ms","bandwidth": "32Gbps"},{"source_node": "node3","target_node": "node3","latency": "-1 ms","bandwidth": "-1 Gbps"},{"source_node": "node3","target_node": "node4","latency": "34ms","bandwidth": "34Gbps"},{"source_node": "node4","target_node": "node1","latency": "41ms","bandwidth": "41Gbps"},{"source_node": "node4","target_node": "node2","latency": "42ms","bandwidth": "42Gbps"},{"source_node": "node4","target_node": "node3","latency": "43ms","bandwidth": "43Gbps"},{"source_node": "node4","target_node": "node4","latency": "-1 ms","bandwidth": "-1 Gbps"}];
            var Networks = [];
            for(let n=1; n<=getNetworks.length; n++){
                Networks.push(getNetworks[n])
            }
            this.serviceinfo.Networks = Networks;

        }
    }
}
</script>

<template>

</template>