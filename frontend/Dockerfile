# 使用官方 Node.js 镜像作为基础镜像
FROM node:latest AS build-stage

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果有）到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm config set registry https://npmreg.proxy.ustclug.org

#RUN npm install --registry=https://registry.npm.taobao.org/ --legacy-peer-deps
#RUN npm install --registry=https://registry.npmmirror.com/ --legacy-peer-deps
RUN npm install -g cnpm --registry=https://registry.npmmirror.com/
RUN cnpm install --legacy-peer-deps

# 复制项目文件到工作目录
#COPY ./dist ./dist
#COPY ./public ./public
#COPY ./src ./src
COPY . .

# 构建 Vue 项目
RUN cnpm run build --verbose

# 使用官方 Nginx 镜像作为生产环境的基础镜像
FROM nginx:alpine

# 从构建阶段复制构建好的静态文件到 Nginx 的默认静态文件目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx 服务器
CMD ["nginx", "-g", "daemon off;"]