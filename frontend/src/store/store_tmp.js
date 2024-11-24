import { createConditionalExpression } from '@vue/compiler-core'
import { createStore } from 'vuex'
export default createStore({
    state: {
        id:0,
        password:'',
        name:'',
        BS_info: {},//基站信息
        BSCluster_info: {},//基站集群信息
        BS_Hardware_info:{},//基站硬件信息
        BS_num: [], //集群中基站数量,待初始化
        cluster_num : 1, //集群数量，先设为1
        clu_uptraff:{
            'clu_totup_traffic': 0,//二十四小时内的传输的上行流量
            'clu_totup_traffic_48':  Array(48).fill(0),//四十八次流量采样值
        },
        clu_downtraffic:{
            'clu_totdown_traffic': 0,//二十四小时内的传输的下行流量
            'clu_totdown_traffic_48':  Array(48).fill(0),//四十八次流量采样值
        },
        bs_traffic:{ //各个基站的流量
            'vr': Array(48).fill(0), 
            'ob': Array(48).fill(0),
            'fa': Array(48).fill(0),
            'cs': Array(48).fill(0),
            'others': Array(48).fill(0)
        },
        Bs_numuser: [], //基站的接入用户数量
        Node_name:[], 
        Node_num:0,
        Service_num:0,
        Service: '',
        Service_info: {},//服务信息，用于绘制算力网络图
        cncChart:[],
        Service_list:["service1","service2","service3","service4"]
    },
    mutations: { 
        setID(state,msg){
            state.id = msg;
        },
        setPassword(state,msg){
            state.password = msg;
        },
        setName(state,msg){
            state.name = msg;
        },
        //
        setService(state, service) {
            state.Service = service
            /* state.avgLatency = Array(11).fill(state.def_avg),
            state.pt99Latency = Array(11).fill(state.def_pt99),
            state.fairness = Array(11).fill(state.def_fair),
            state.svclevel = state.def_level,
            state.info.weight_matrix = [] */
        },
        setBSClusterinfo(state,msg)
        {
            var clusterinfo = JSON.parse(msg);
            if (state.BSCluster_info != undefined){
                return
            }
            clusterinfo.sort(function(a,b){
                return a.name > b.name ? 1 : -1
            })
            state.BSCluster_info.name = clusterinfo.name;//名称
            state.BSCluster_info.Clusterloc = clusterinfo.Clusterloc;//位置
            state.BSCluster_info.ClusterId = clusterinfo.ClusterId;  //记录集群ID
            state.BSCluster_info.numBS = clusterinfo.numBS; //集群中的基站数量
            state.BSCluster_info.BSs = clusterinfo.BSs; //根据后端基站和基站集群的存法
        },
        //获取基站信息
        setBSinfo(state,msg){
            var clusterinfo = JSON.parse(msg);
            if (state.BS_info != undefined){
                return
            }
            var Bsinfo = [];
            var Bsnum = [];
            for(var c in clusterinfo){
                Bsnum.push(clusterinfo[c].numBS)
                for(var b in clusterinfo[c].Bss){
                    var bsinfo = clusterinfo[c].Bss[b];//c集群的第b个基站
                    Bsinfo.push(bsinfo)
                }  
            }
            Bsinfo.sort(function(a,b){
                if (a.clu == b.clu) { //两个基站属于同一集群
                    return a.BSId > b.BSId ? 1 : -1
                }
                else {
                    return a.clu > b.clu ? 1 : -1
                }
            })
            state.BS_info = Bsinfo;
            state.BS_num = Bsnum;
           /*  state.BS_info.BSId = bsinfo.BSID;
            state.BS_info.BSloc = bsinfo.BSloc;
            state.BS_info.BSP = bsinfo.BSIP;
            state.BS_info.BSMAC = bsinfo.BSMAC;
            state.BS_info.BSrealmID = bsinfo.BSrealmID;
            state.BS_info.UserID = bsinfo.UserID; */
        },
        setBShardwareinfo(state,msg)
        { 
            var hardwareinfo = JSON.parse(msg);
            if(state.BS_Hardware_info!= undefined){
                return 
            }
            state.BS_Hardware_info = hardwareinfo;
        },

       setCluUpTraffic(state,msg){
        var uptraffic = JSON.parse(msg);
        var totup = 0;
        var totup_48 = Array(48).fill(0);f
        totup = state.clu_totup_traffic-totup_48[0]+uptraffic.clu_totup_traffic_48//变量名参考后端读取的数据
        for (let i = 0; i < 47; i++) {
            totup_48[i] = state.clu_totup_traffic_48[i+1];
       }
       totup_48[47] = uptraffic.clu_totup_traffic_48;
       state.clu_uptraff ={
        'clu_totup_traffic': totup,
        'clu_totup_traffic_48': totup_48
       }
    },

    setCluDownTraffic(state,msg){
        var downtraffic = JSON.parse(msg);
        var totdown = 0;
        var totdown_48 = Array(48).fill(0);
        totdown = state.clu_totdown_traffic-totdown_48[0]+downtraffic.clu_totdown_traffic_48//变量名参考后端读取的数据
        for (let i = 0; i < 47; i++) {
            totdown_48[i] = state.clu_totdown_traffic_48[i+1];
       }
       totdown_48[47] = downtraffic.clu_totdown_traffic_48;
       state.clu_downtraff ={
        'clu_totdown_traffic': totdown,
        'clu_totdown_traffic_48': totdown_48
       };
    },

    setBSTraffic(state,msg)
    {
        var bstraffic = JSON.parse(msg);
            var vr = Array(48).fill(0)
            var ob = Array(48).fill(0)  
            var fa = Array(48).fill(0)
            var cs = Array(48).fill(0)
            var others = Array(48).fill(0)
            for (let i = 0; i < 47; i++) {
                vr[i] = state.BS_traffic.vr[i + 1]
                ob[i] = state.BS_traffic.ob[i + 1]
                fa[i] = state.BS_traffic.fa[i + 1]
                cs[i] = state.BS_traffic.cs[i + 1]
                others[i] = state.BS_traffic.others[i + 1]
            }
            vr[47] = bstraffic.vr
            ob[47] = bstraffic.ob
            fa[47] = bstraffic.fa
            cs[47] = bstraffic.cs
            others[47] = bstraffic.others
            state.requestDis = {
                'vr': vr, //vr服务
                'ob': ob, //多目标检测服务
                'fa': fa, //人脸识别服务
                'cs': cs, //cs服务
                'others': others//其它
            };
    },
    setNodes(state,msg){
        var nodeinfo = JSON.parse(msg);
        state.Node_name = nodeinfo
        state.Node_num = nodeinfo.length()
    },

    setServiceDecisions(state,msg){
        var serviceinfo = JSON.parse(msg); //服务名称
        state.Service_info.decision = serviceinfo.service_scheduling_decisions//调度决策
    },

    setServiceInfo(state,msg){
        var info = JSON.parse(msg);
        state.Service_info = info;
        state.Service_info.name = info.service_name;
        state.Service_info.Nodes = info.nodes;
        state.Service_info.Networks = info.networks;
        var servicelist = []
        servicelist.find(function(value,index,servicelist){
            if(value!=info.service_name){
                servicelist.push(svc.name)
            }
        })
            servicelist.sort()
            state.servicelist = servicelist
            // 设置默认服务
            if (state.Service == ''){
                state.Service = servicelist[0]
            }
        state.Service_list = servicelist;
    },


    setServiceNodes(state,msg){
        var serviceinfo = JSON.parse(msg);
        var nodes= []//基站信息（节点信息）
        for(var s in serviceinfo){ //遍历每一次服务
            for(var n in serviceinfo[s].Node){
                var node = serviceinfo[s].Node[n];//c服务的第n个节点
                node.first = false
                node.cpu_allocation = (node.cpu_allocation / 1000).toFixed(3) //单位转换
                node.cpu_used = (node.cpu_used / 1000).toFixed(3)
                node.mem_allocation = (node.mem_allocation / 1000000000).toFixed(3)
                node.mem_used = (node.mem_used / 1000000000).toFixed(3)
                nodes.push(node)
            }     
        } 
        node.sort(function(a,b){
            return a.name > b.name ? 1 : -1
        })
        state.Service_info.Nodes = nodes;
    },
    setServiceNetworks(state,msg){
        var serviceinfo = JSON.parse(msg);
        var networks = []//边信息
        for(var s in serviceinfo){ //遍历每一次服务
            for(var n in serviceinfo[s].network){
                var network= serviceinfo[s].network[n];
                networks.push(network) //push的边信息包含了"source_node": "target_node","latency","bandwidth"
            }   
        } 
        network.sort(function(a,b){
            if (a.source_node == b.source_node) {
                return a.target_node > b.target_node ? 1 : -1
            }
            else {
                return a.source_node > b.source_node ? 1 : -1
            }
        })
        state.Service_info.Networks = networks;
    },
    setServiceList(state,msg){
        var servicelist = JSON.parse(msg);
        state.Service_list = servicelist;
    }
    
}
})

