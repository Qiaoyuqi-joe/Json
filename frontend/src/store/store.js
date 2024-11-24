import { createStore } from 'vuex'
export default createStore({
    state:{
        CNCServices:[],
        CNCNodes:[],
        Userinfo:{},
        service:'',
        serviceinfo:{
            Name:[],
            Nodes:[],
            Networks:[],
            Decisions:[],
        },
        CNCSvcinfo:[],
        CNCSvclist:[]
    },
    mutations:{
        
        setService(state,service){
            state.service = service;
        },
        setCNCServices(state,msg){
            var info = JSON.parse(JSON.stringify(msg));
            var cncservices = [];
            info.map((item,i)=>{
                cncservices.push(item)
            })
            state.CNCServices = cncservices;
        },
        setCNCNodes(state,msg){
            var info = JSON.parse(JSON.stringify(msg));
            var cncnodes = [];
            info.map((item,i)=>{
                cncnodes.push(item)
            })
            state.CNCNodes = cncnodes;
        },
        setCNCSvcinfo(state,msg){
            var tocontinue =  1;
            var info  = JSON.parse(JSON.stringify(msg));
            state.CNCSvcinfo.map((item,i)=>{
                console.log("svc_name",item.Name)
                if(item.Name == info.name)
                    tocontinue =  0
            })
            if(tocontinue==0){
                console.log("不能继续")
                return ;
            }
            if(state.CNCSvcinfo.length >= state.CNCServices.length)
                return ;
            console.log("state.CNCSvcinfo push之前",state.CNCSvcinfo)
            state.serviceinfo.Name = info.service_name;
            state.serviceinfo.Nodes = info.nodes;
            state.serviceinfo.Networks = info.networks;
            state.serviceinfo.Decisions = info.service_scheduling_decisions.scheduling_decisions;
            var cncsvcinfo = JSON.parse(JSON.stringify(state.serviceinfo));
            state.CNCSvcinfo.push(cncsvcinfo);
            state.CNCSvcinfo.sort(function(a,b){
                return a.name > b.name ? 1 : -1
            });
            console.log("state.CNCSvcinfo push之后",state.CNCSvcinfo)
            /* if (state.service == ''){
                state.service = state.CNCServices[0];
            } */
            state.service = info.service_name;
        },
        setUserinfo(state,msg){
            var info = JSON.parse(JSON.stringify(msg));
            state.Userinfo = info;
        },
    }
})