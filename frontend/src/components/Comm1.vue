<!-- <script>
/* import SockJS from 'sockjs-client'
import Stomp from 'stompjs' */
import store from '../store/store'
export default {
    name: 'Comm',
    data() {
        return {
            websocket: null,
            websocket1: null,
            websocket2:null
        }
    },
     mounted() {
        this.initWebSocket(); // websocket订阅
    },
    destroyed: function () { // 离开页面生命周期函数
      this.websocketclose();
    },
    beforeDestroy: function () {
        // 页面离开时断开连接,清除定时器
        this.disconnect();
        // clearInterval(this.timer);
    },
    computed: {
        isEdit() {
            // return store.state.servicelist;　　//需要监听的数据
            return this.$store.state.Service; //需要监听的数据
        }
    },
    methods: { 
         initWebSocket: function () {
        // WebSocket与普通的请求所用协议有所不同，ws等同于http，wss等同于https
        var url0 = "http://127.0.0.1:8080"
        var url = url0.replace("https://","wss://").replace("http://","ws://");
        var url1 = url +"/cncgraph"+"/nodes";
        var url2 = url +"/cncgraph"+"/services";

        
        this.websock = new WebSocket(url);
        this.websock.onopen = this.websocketOnopen;
        this.websock.onerror = this.websocketOnerror;
        this.websock.onmessage = this.websocketOnmessage;
        this.websock.onclose = this.websocketOnclose;

        this.websock1 = new WebSocket(url1);
        this.websock1.onopen = this.websocketOnopen;
        this.websock1.onerror = this.websocketOnerror;
        this.websock1.onmessage = this.websocketOnmessage1;
        this.websock1.onclose = this.websocketOnclose;

        this.websock2 = new WebSocket(url2);
        this.websock2.onopen = this.websocketOnopen;
        this.websock2.onerror = this.websocketOnerror;
        this.websock2.onmessage = this.websocketOnmessage2;
        this.websock2.onclose = this.websocketOnclose;

        },
      websocketOnopen: function () {
        console.log("WebSocket连接成功");
        //心跳检测重置
        //this.heartCheck.reset().start();
      },
      websocketOnerror: function (e) {
        console.log("WebSocket连接发生错误");
        this.reconnect();
      },
      websocketOnmessage: function (e) {
        var data = eval("(" + e.data + ")"); //解析对象
      },
      websocketOnmessage1: function (e) {
        store.commit('setNodes', e)
    
      },
      websocketOnmessage2: function (e) {
        var tmp = JSON.parse(e);
        for (let item in e){
            url_svc = "http://127.0.0.1:8080"+"/cncngraph"+item
            svc_socket = new WebSocket(url_svc);
            store.commit(setServiceInfo,e)
        }
        /* var data = eval("(" + e.data + ")"); //解析对象 */
      },
      websocketOnclose: function (e) {
        console.log("connection closed (" + e.code + ")");
        this.reconnect();
      },
      websocketSend(text) { // 数据发送
        this.connect();
      },
 
      reconnect() {
        var that = this;
        if(that.lockReconnect) return;
        that.lockReconnect = true;
        //没连接上会一直重连，设置延迟避免请求过多
        setTimeout(function () {
          console.info("尝试重连...");
          that.initWebSocket();
          that.lockReconnect = false;
        }, 5000);
      }, 
        over(){
            clearInterval(this.timer);
        },
        onSelect(event) {
            console.log(event)
            store.commit('setService', event)
        },
        
        disconnect() {
            if (this.stompClient) {
                this.stompClient.disconnect();
            }
        }, 

    },
}
</script>
 -->


<script>
export default{
    data(){
        
    }
}
</script>