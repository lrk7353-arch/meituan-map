# 性能优化指南

本文档提供"大学城美食地图"项目的性能优化建议。

## 前端优化

### 1. 图片优化

#### 问题
当前使用的是 Lorem Picsum 的随机图片，可能加载较慢。

#### 解决方案
```javascript
// 1. 使用 WebP 格式
<img src="image.webp" alt="餐厅图片" />

// 2. 懒加载
<el-image
  :src="restaurant.images[0]"
  lazy
  :preview-src-list="restaurant.images"
/>

// 3. 响应式图片
<picture>
  <source srcset="image-480w.webp" media="(max-width: 480px)">
  <source srcset="image-768w.webp" media="(max-width: 768px)">
  <img src="image-1200w.webp" alt="餐厅图片" />
</picture>

// 4. 图片压缩
// 使用工具如 imagemin 或 tinypng 压缩图片
```

### 2. 代码分割

#### 当前状态
所有页面组件在首次加载时都会被下载。

#### 优化方案
```javascript
// router/index.js - 使用动态导入
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import('../views/Map.vue')
  }
];
```

### 3. 路由懒加载

Vite 默认支持代码分割，但可以进一步优化：

```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'element-plus': ['element-plus'],
        'vue-vendor': ['vue', 'vue-router', 'pinia'],
        'map': ['views/Map.vue']
      }
    }
  }
}
```

### 4. 虚拟滚动

当餐厅列表很长时，使用虚拟滚动只渲染可视区域的元素：

```javascript
// 安装 vue-virtual-scroller
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
```

### 5. 防抖和节流

搜索和滚动事件应该使用防抖/节流：

```javascript
// utils/index.js
export const debounce = (fn, delay) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

// 使用
<input @input="debounce(handleSearch, 300)" />
```

### 6. 请求优化

```javascript
// 并行请求
const [restaurants, reviews] = await Promise.all([
  getRestaurants(),
  getReviews()
]);

// 请求缓存
import { setupCache } from 'axios-cache-interceptor';
const api = setupCache(axios, { ttl: 1000 * 60 * 5 }); // 5分钟缓存
```

### 7. 状态管理优化

```javascript
// 使用 computed 缓存计算结果
const expensiveData = computed(() => {
  return restaurants.value.filter(/* 复杂逻辑 */);
});

// 使用 shallowRef/shallowReact 减少响应式开销
const largeData = shallowRef([]);
```

## 后端优化

### 1. 数据库优化

#### 当前状态
使用 JSON 文件存储，每次读取都需要解析整个文件。

#### 优化方案
```javascript
// 使用索引文件快速查找
// data/index.json
{
  "restaurants": {
    "byId": {
      "1": { "index": 0 },
      "2": { "index": 1 }
    },
    "byCuisine": {
      "中餐": ["1", "2"],
      "西餐": ["3"]
    }
  }
}
```

### 2. 响应压缩

```javascript
// server.js
const compression = require('compression');
app.use(compression());
```

### 3. CDN 加速

将静态资源（图片、字体）上传到 CDN：

```javascript
// 使用 CDN 图片
const imageBaseUrl = 'https://cdn.example.com/images/';
restaurant.images = [
  imageBaseUrl + 'restaurant1.jpg'
];
```

### 4. 分页加载

```javascript
// routes/restaurants.js
router.get('/', async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const start = (page - 1) * pageSize;
  const end = start + parseInt(pageSize);

  const data = restaurants.slice(start, end);

  res.json({
    success: true,
    data,
    total: restaurants.length,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  });
});
```

## 地图优化

### 1. 按需加载

只在进入地图页时加载地图 API：

```javascript
// views/Map.vue
const loadMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

onMounted(() => {
  loadMapScript().then(initMap);
});
```

### 2. 标记聚合

当餐厅很多时，使用标记聚合：

```javascript
// 使用 Aap.MarkerClusterer
import AMapMarkerClusterer from '@amap/amap-jsapi-loader/dist/utils/MarkerClusterer';

const cluster = new AMap.MarkerClusterer(map, markers, {
  gridSize: 60,
  maxZoom: 15
});
```

## 通用优化

### 1. 浏览器缓存

```javascript
// 设置响应头
app.use((req, res, next) => {
  if (req.path.includes('static')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  next();
});
```

### 2. Service Worker

实现离线缓存：

```javascript
// sw.js
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('meituan-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/restaurants',
        '/api/restaurants'
      ]);
    })
  );
});
```

### 3. 性能监控

```javascript
// 添加性能监控
const perfObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('[Performance]', entry.name, entry.duration);
  }
});

perfObserver.observe({ entryTypes: ['measure', 'navigation'] });
```

## 监控指标

### 关键性能指标 (KPI)

- **FCP (First Contentful Paint)**: 首次内容绘制 < 1.8s
- **LCP (Largest Contentful Paint)**: 最大内容绘制 < 2.5s
- **FID (First Input Delay)**: 首次输入延迟 < 100ms
- **CLS (Cumulative Layout Shift)**: 累积布局偏移 < 0.1
- **TTI (Time to Interactive)**: 可交互时间 < 3.8s

### 测试工具

- Chrome DevTools Lighthouse
- WebPageTest
- GTmetrix
- PageSpeed Insights

## 优化优先级

### 高优先级
1. 图片懒加载
2. 代码分割
3. 请求防抖
4. 响应压缩

### 中优先级
1. 虚拟滚动
2. 请求缓存
3. 分页加载

### 低优先级
1. CDN 加速
2. Service Worker
3. 标记聚合
