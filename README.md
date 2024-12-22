# Cncgraph_frontend_and_backend
数据大屏前后端

## 模块介绍
该部分分为三个模块：登录模块、算力网络图模块、用户画像分析模块。该部分从zookeeper请求数据，展示的场景选择为多集群（2个）多基站（8个）多用户（50个）多服务（4种）的算力网络系统。
算力网络模块用于在前端界面展示算力网络图、网络拓扑图及其相关信息，图形化基站、用户、服务三者关系及基站间连接状态及基站间卸载情况。该部分展示基站、用户两种节点并将他们划分集群。基站节点部署四种服务，用户节点部署其中的1~4种。计算卸载图部分展示请求不同服务时基站间卸载状况（卸载百分比）、网络拓扑图展示基站之间的联通情况（带宽、延迟）并在拓扑状态表中展示。
用户画像分析部分展示基站分布、某一基站的流时分布图、不同基站不同服务流量的分布。同时，将按照时间顺序展示用户接入请求列表，包括用户MAC、请求服务、上行/下行流量以及该次请求消耗能量。


## 模块部署
打开backend,输入go run main.go指令，后端数据从zookeeper请求数据  
打开frontend,输入 npm install 指令及 npm run serve指令运行程序  
出现登录界面，输入用户名，密码（均为admin）即可查看页面  

##  前端模块组成
### 登录模块见frontend/Login.vue  
用户名和密码为admin
### 服务卸载模块见frontend/Cncgraph.vue  
此模块用于生成算力网络服务卸载图，使用j3力向导图将节点按照集群聚类展示，并用不同颜色区分。
将基站（8个）建模为节点并将基站之间的卸载决策建模为边，初始时隐藏不同节点间卸载决策，节点被选中时展示与节点相关的卸载决策并浮窗显示节点信息，节点信息包括被分配/已使用的CPU资源和被分配/已使用的内存资源点击按钮可以选择展示完整算力网络图或只展示节点。用户使用selector选择需要查看的服务（共4个）,选择成功后展示该服务对应的卸载决策
该部分后端数据间
### 网络拓扑图模块frontend/Nettopology.vue  
此模块使用neo4j数据库图可视化功能构建网络拓扑图，该代码展示网络拓扑图，显示基站之间联通情况以及带宽，用户状态初始隐藏。点击某基站后隐藏其他基站，展示该与该基站相连的用户，并在右侧展示基站信息表，内容包括：基站名称、节点类型（基站）、基站所属集群、与基站连接的用户节点、基站部署的服务，在下方展示包含该基站的拓扑子图。点击用户节点时展示用户信息，包括用户名称、节点类型（基站）、基站所属集群、与基站连接的用户节点、基站部署的服务拓扑图下方展示网络将拓扑结构状态表
### 基站流量状态图frontend/Usergraph.vue  
左侧部分为区域地图，右侧部分为基站24小时流时分布图（每半小时取样，共48个取样点）和不同基站不同服务的流量分析图（展示每个基站近24小时三种不同服务的流量和）
### 用户接入请求列表frontend/AdminDashBoard.vue  
该模块按照服务请求顺序展示用户画像分析，包括用户mac，用户所属基站，用户请求服务类别，上行or下行以及近24小时请求流量

## 后端模块组成
### pb文件夹
zookeeper存储配置文件
### entity.go：
cncgraph与usergraph路径下该文件分别存储算力网络图与用户画像分析所需要的结构体
### controller.go：
从zookeeper读取数据路径入口
### service.go:
存储读取数据的函数，制造为服务切切片，将数据转存为url接口存储给前端的示例。
### upload.go:
上传zookeeper的结构，将数据层状存储。

##模块测试
经测试前端页面运行正常，效果如下： 
