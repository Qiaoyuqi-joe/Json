<script>
import Comm_dynamic from './components/Comm_dynamic'
import { Monitor, Menu, Histogram, Setting, InfoFilled } from '@element-plus/icons'
// import DevicePixelRatio from '../utils/devicePixelRatio';

const paths = ['/cncgraph','/cncchart','nettopology']
export default {
    name: 'App',
    components: {
        Comm_dynamic,
    },
    data() {
        return {
            paths: paths,
            currPath: paths[0],
            login: false
        }
    },
    watch: {
        '$route.path'(to, from) {
            let path = to
            if (path === '/') {
                path = paths[0]
            }
            this.currPath = path
        },
    },
    methods:{
        getLogin(value){
            this.login = value
            this.$router.replace("/cncgraph")
            console.log(value)
        },
    },
     mounted() {
       },
       
    created(){
        if (this.$router.path !== "/"){
            this.$router.replace("")
        }
    } 
}
</script>


<template>
    <Comm_dynamic />
  <el-container>
        <el-header id="header">
            <div v-if="login">
                <el-menu
                    :default-active="currPath"
                    id="aside-menu"
                    mode="horizontal"
                    :ellipsis="false"
                    router>
                    <el-menu-item :index="paths[0]">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>Cncgraph</span>  <!-- 算力网络图 -->
                    </el-menu-item>
                    <el-menu-item :index="paths[1]">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>Cncchart</span> <!-- 算力网络表 -->
                    </el-menu-item>
                    <el-menu-item :index="paths[2]">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>Nettopology</span>
                    </el-menu-item>
                </el-menu>
            </div>
            <div id="header-title">算力网关开发平台（comEdge-Lite）</div>
                
        </el-header>
      </el-container>
      <el-container id="body">
            <el-main id="main">
                <keep-alive>
                <router-view @getLogin='getLogin'/>
                </keep-alive>
            </el-main>
        </el-container>
        
   <!--    <el-container id="body">
            <el-main id="main">
                <router-view/>
            </el-main>
        </el-container> -->
</template>

<style>
@import "./assets/font/font.css";
:root {
    /* 头部导航栏颜色 */
    --header-background-color: #2980b9;
    --nav-background-color: #001C40;
    --nav-hover-background-color: #3e5c81;
    --nav-selected-background-color: #4a6282;
    --nav-text-color: #CCCCCC;
    --nav-selected-text-color: #ff8923;
    /* 浅色界面颜色（即overview） */
    --card-background-color:rgba(52, 152, 219, 0.8);
    --card-title-color:#FFE574;
    --card-text-color:#f2f2f2;
    --card-border-color: #3b93eb;
    --card-text-color-deep:#001C40;

    /* 深色界面颜色（即service等） */
    --main-background-color: #2c3e50;
    
    --highlight-color: #FFE574;

    /* 尺寸信息 */
    --aside-width: 168px;
    --header-height: 55px;
   /*  --margin: 10px; */
}
</style>
<style scoped>
#header {
    z-index: 1000;
    height: var(--header-height);
    background-color: var(--header-background-color);
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.64);    
    padding: 0px;
}

#header-time {
    color: var(--highlight-color);
    font-weight: bold;
    position: absolute;
    top: 18px;
    right:150px;
}
#header-title {
    color: var(--highlight-color);
    font-size: 20px;
    font-weight: bold;
    position: absolute;
    left: 50%;
    transform:translate(-50%,0);
    top: 15px;
}



#body {
   /*  height:100vh; */
   background-color: rgba(236, 240, 241, 0.8);
    height: calc(100vh - var(--header-height));
    font-family: Yahei;
}
#aside {
    /* z-index: 900; */
    width: var(--aside-width);
    background-color: var(--nav-background-color);
    /* box-shadow: 2px 0 2px 0 rgba(0, 0, 0, 0.32); */
}

#aside-menu {
    border: none;
    background-color: transparent;
}

#aside-menu li {
    font-weight: bold;
    color: var(--nav-text-color);
    /* width: 150px */
}

.el-menu-item:hover {
	outline: 0 !important;
	color: var(--nav-selected-text-color) !important;
	background: var(--nav-hover-background-color) !important;
}

.el-menu-item.is-active{
    color: var(--nav-selected-text-color) !important;
    background: var(--nav-selected-background-color) !important;
}

#main {
    background-color: rgba(236, 240, 241);
    padding: 0px;
    overflow: auto
}

.about {
    margin-left:60%
  /* margin-left:calc(100%-5*150px); */
}
.flex-grow {
  flex-grow: 1;
}
</style>