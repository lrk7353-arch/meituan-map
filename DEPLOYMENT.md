# 部署指南

## 前置要求

- Node.js 16+ 
- npm 或 yarn
- 高德地图 API Key（用于地图功能）

## 获取高德地图 API Key

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册并登录账号
3. 进入控制台，创建新应用
4. 添加 Web端（JS API）类型的 Key
5. 将 Key 复制，在 `frontend/src/views/Map.vue` 中替换 `AMAP_KEY` 常量

```javascript
const AMAP_KEY = 'YOUR_AMAP_KEY'; // 替换为你的 Key
```

## 安装依赖

### 后端
```bash
cd backend
npm install
```

### 前端
```bash
cd frontend
npm install
```

## 运行项目

### 启动后端服务
```bash
cd backend
npm run dev
```
后端将运行在 `http://localhost:3000`

### 启动前端服务（新开一个终端）
```bash
cd frontend
npm run dev
```
前端将运行在 `http://localhost:5173`

## 访问应用

在浏览器中打开: `http://localhost:5173`

## 项目结构说明

```
meituan-for-openclaw/
├── backend/                 # 后端服务
│   ├── data/               # JSON 数据文件
│   ├── routes/             # API 路由
│   └── server.js           # 服务器入口
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── api/           # API 封装
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # 状态管理
│   │   ├── views/         # 页面组件
│   │   └── main.js        # 入口文件
│   └── index.html         # HTML 模板
├── PROJECT_PLAN.md         # 产品设计方案
└── README.md              # 项目说明
```

## API 接口

### 餐厅相关
- `GET /api/restaurants` - 获取所有餐厅
- `GET /api/restaurants/:id` - 获取餐厅详情
- `GET /api/restaurants/search` - 搜索餐厅

### 评价相关
- `GET /api/reviews/restaurant/:restaurantId` - 获取餐厅评价
- `POST /api/reviews` - 添加评价
- `POST /api/reviews/:id/like` - 点赞评价

## 开发说明

### 数据存储
当前使用 JSON 文件存储数据，适合演示和开发。生产环境建议使用：
- MongoDB（Node.js 友好）
- PostgreSQL（关系型数据库）
- MySQL

### 地图功能
地图组件使用高德地图 JavaScript API。如果不想申请 API Key，可以：
1. 使用百度地图 API
2. 使用 Leaflet + OpenStreetMap（免费）
3. 暂时跳过地图功能

### 环境变量
可以创建 `.env` 文件配置环境变量：
```env
# backend/.env
PORT=3000

# frontend/.env
VITE_API_BASE_URL=http://localhost:3000
VITE_AMAP_KEY=your_api_key
```

## 常见问题

### 1. 地图不显示
- 检查 API Key 是否正确配置
- 确保网络可以访问高德地图 API
- 打开浏览器控制台查看错误信息

### 2. 跨域问题
前端已经配置了代理，如果仍有问题，检查 `vite.config.js` 中的代理配置

### 3. 数据加载失败
- 确保后端服务已启动
- 检查端口是否被占用
- 查看浏览器网络请求是否正常

## 构建生产版本

### 前端构建
```bash
cd frontend
npm run build
```
构建产物在 `frontend/dist` 目录

### 后端部署
可以直接部署到 Node.js 环境，建议使用 PM2 进程管理：
```bash
npm install -g pm2
cd backend
pm2 start server.js --name meituan-backend
```

## 扩展建议

1. **用户认证**: 添加登录注册功能
2. **订单系统**: 支持在线点餐
3. **智能推荐**: 基于用户偏好的推荐算法
4. **实时通知**: WebSocket 实时推送优惠信息
5. **移动端适配**: 开发小程序或 App
6. **多商户**: 支持商家后台管理系统
