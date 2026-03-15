# 快速开始指南

## 一分钟启动

### 1. 安装依赖
```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install
```

### 2. 启动服务
```bash
# 终端1：启动后端
cd backend
npm run dev

# 终端2：启动前端
cd frontend
npm run dev
```

### 3. 访问应用
打开浏览器访问: http://localhost:5173

## 功能演示

### 首页
- 浏览所有餐厅
- 使用搜索框搜索餐厅或菜品
- 使用筛选器按菜系或价格筛选
- 点击餐厅卡片查看详情

### 餐厅详情
- 查看完整餐厅信息
- 浏览餐厅图片
- 查看用户评价
- 添加评价（可选）
- 点击收藏按钮收藏餐厅

### 地图
- 在地图上查看餐厅位置
- 点击侧边栏的餐厅快速定位
- 点击地图上的标记查看信息
- 使用搜索框查找餐厅

### 收藏
- 在首页或详情页点击收藏按钮
- 访问"我的收藏"查看收藏列表
- 点击收藏可取消收藏

## 常见问题

### Q: 地图不显示怎么办？
A: 需要配置高德地图 API Key：
1. 访问 https://lbs.amap.com/ 注册并申请 Key
2. 在 `frontend/src/views/Map.vue` 中替换 `AMAP_KEY`

### Q: 如何添加更多餐厅？
A: 编辑 `backend/data/restaurants.json`，添加新的餐厅数据

### Q: 数据保存在哪里？
A: 当前使用 JSON 文件存储，适合演示。生产环境建议使用数据库

### Q: 如何自定义样式？
A: 修改 `frontend/src/style.css` 或各组件的 `<style>` 部分

## 项目文件说明

| 文件/目录 | 说明 |
|-----------|------|
| `README.md` | 项目简介 |
| `PROJECT_PLAN.md` | 产品设计方案 |
| `DEPLOYMENT.md` | 部署指南 |
| `SUMMARY.md` | 项目总结 |
| `backend/` | 后端代码 |
| `frontend/` | 前端代码 |

## 下一步

1. 配置高德地图 API Key 启用地图功能
2. 尝试添加评价功能
3. 收藏几个喜欢的餐厅
4. 使用搜索和筛选功能
5. 修改餐厅数据，添加你喜欢的餐厅

## 技术支持

如有问题，请查看：
- `DEPLOYMENT.md` - 部署和配置说明
- 项目源码注释

---

祝你使用愉快！🍜
