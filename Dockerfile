
 # 基础镜像
FROM node:18

#  设置工作目录
WORKDIR /src

# 将 package.json 和 package-lock.json 文件复制到工作目录
COPY package*.json ./

# 安装依赖项
RUN npm install

# 将应用源代码复制到容器中
COPY . .
RUN npm install mysql2
# 编译Next.js应用
RUN npm run build

# 对外暴露的端口
EXPOSE 3000

# 运行应用
CMD [ "npm", "start" ]