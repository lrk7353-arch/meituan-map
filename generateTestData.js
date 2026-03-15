#!/usr/bin/env node

/**
 * 测试数据生成器
 * 运行: node generateTestData.js
 */

const fs = require('fs').promises;
const path = require('path');

// 基础数据
const CUISINE_TYPES = ['中餐', '西餐', '日韩料理', '火锅烧烤', '奶茶甜点'];
const PRICE_LEVELS = [1, 2, 3, 4, 5];
const TAGS = [
  '学生优惠', '套餐划算', '外卖配送', '聚餐首选', '家常菜', '实惠',
  '寿司', '刺身', '环境好', '奶茶', '甜品', '外卖快', '健康',
  '沙拉', '减脂', '蛋糕', '下午茶', '约会', '小吃', '便宜',
  '聚会', '夜宵', '早餐', '午餐', '晚餐', '网红店', '老字号',
  '性价比高', '分量足', '口味正宗', '食材新鲜', '服务态度好'
];

const USERNAMES = ['吃货小王', '美食达人', '在校大学生', '夜宵党', '奶茶控', '日料爱好者', '火锅狂魔', '养生达人', '穷学生', '富二代'];
const REVIEW_TEMPLATES = [
  '味道{rating}，下次还会再来！',
  '性价比{rating}，{dish}特别推荐！',
  '环境{rating}，适合{occasion}。',
  '{dish}是招牌，一定要尝尝。',
  '服务态度{rating}，上菜速度{speed}。',
  '人均消费{priceComment}，值得推荐。',
  '位置{locationComment}，交通便利。',
  '{dish}很好吃，但是{negative}。',
  '周末人{crowdComment}，建议提前预约。',
  '{positive}，{positive}，{positive}！'
];

// 工具函数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateName(cuisine) {
  const prefixes = ['美味', '鲜香', '正宗', '老字号', '网红', '地道', '经典', '新派'];
  const suffixes = ['馆', '餐厅', '小馆', '大排档', '料理', '厨房', '屋', '坊', '轩', '楼'];
  const cuisineNames = {
    '中餐': ['川菜', '湘菜', '粤菜', '鲁菜', '江浙菜', '东北菜', '家常菜', '火锅'],
    '西餐': ['牛排', '意面', '披萨', '汉堡', '法餐', '美式'],
    '日韩料理': ['寿司', '拉面', '烤肉', '炸鸡', '章鱼烧', '石锅拌饭'],
    '火锅烧烤': ['麻辣烫', '串串香', '烤鱼', '烤肉', '海鲜', '自助'],
    '奶茶甜点': ['奶茶', '咖啡', '蛋糕', '甜品', '面包', '冰淇淋']
  };

  const name = randomItem(prefixes) + randomItem(cuisineNames[cuisine] || [cuisine]);
  return name + randomItem(suffixes);
}

function generateAddress() {
  const roads = ['成府路', '中关村大街', '学院路', '知春路', '颐和园路', '清华东路', '圆明园西路', '五道口'];
  const buildingTypes = ['号', '号楼', '大厦', '广场', '中心'];
  return `海淀区${randomItem(roads)}${randomInt(1, 200)}${randomItem(buildingTypes)}`;
}

function generatePhone() {
  return `010-${randomInt(10000000, 99999999)}`;
}

function generateBusinessHours() {
  const openHours = ['09:00', '10:00', '10:30', '11:00'];
  const closeHours = ['21:00', '21:30', '22:00', '22:30', '23:00'];
  return `${randomItem(openHours)}-${randomItem(closeHours)}`;
}

function generatePriceLevel() {
  // 大部分是2-3档
  const weights = [0.1, 0.35, 0.35, 0.15, 0.05];
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random <= sum) return i + 1;
  }
  return 2;
}

function generateAvgPrice(priceLevel) {
  const ranges = {
    1: [15, 25],
    2: [25, 50],
    3: [50, 100],
    4: [100, 200],
    5: [200, 500]
  };
  const [min, max] = ranges[priceLevel] || [25, 50];
  return randomInt(min, max);
}

function generateRating() {
  // 大部分是4.0-4.9
  return randomFloat(3.5, 5.0, 1);
}

function generateLocation() {
  // 北京大学城附近的坐标
  const baseLng = 116.325;
  const baseLat = 39.99;
  const range = 0.02;

  return {
    lng: parseFloat((baseLng + (Math.random() - 0.5) * range).toFixed(4)),
    lat: parseFloat((baseLat + (Math.random() - 0.5) * range).toFixed(4))
  };
}

function generateDishes(cuisine, avgPrice, count = 3) {
  const dishNames = {
    '中餐': ['红烧肉', '麻婆豆腐', '糖醋排骨', '宫保鸡丁', '鱼香肉丝', '水煮鱼', '回锅肉'],
    '西餐': ['澳洲牛排', '意面套餐', '披萨', '沙拉', '奶油意面', '烤鸡', '汉堡'],
    '日韩料理': ['三文鱼刺身', '寿司拼盘', '拉面', '石锅拌饭', '烤肉', '天妇罗', '章鱼小丸子'],
    '火锅烧烤': ['精品羊肉', '麻辣锅底', '烤鸡翅', '烤鱼', '烤串', '海鲜拼盘', '涮牛肉'],
    '奶茶甜点': ['珍珠奶茶', '芋圆奶茶', '草莓千层', '抹茶提拉米苏', '芝士蛋糕', '拿铁咖啡', '水果茶']
  };

  const dishes = [];
  const names = dishNames[cuisine] || dishNames['中餐'];

  for (let i = 0; i < count; i++) {
    const name = names[i % names.length];
    const price = randomInt(Math.floor(avgPrice * 0.6), Math.ceil(avgPrice * 1.4));
    dishes.push({ name, price });
  }

  return dishes;
}

function generateRestaurant(id) {
  const cuisine = randomItem(CUISINE_TYPES);
  const priceLevel = generatePriceLevel();
  const avgPrice = generateAvgPrice(priceLevel);

  return {
    id: id.toString(),
    name: generateName(cuisine),
    cuisine,
    address: generateAddress(),
    phone: generatePhone(),
    businessHours: generateBusinessHours(),
    priceLevel,
    avgPrice,
    rating: generateRating(),
    reviewCount: randomInt(10, 500),
    location: generateLocation(),
    tags: randomItems(TAGS, randomInt(2, 4)),
    images: Array.from({ length: randomInt(1, 4) }, (_, i) =>
      `https://picsum.photos/400/300?random=${id * 10 + i}`
    ),
    recommendedDishes: generateDishes(cuisine, avgPrice)
  };
}

function generateReview(id, restaurantId) {
  const rating = randomInt(3, 5);
  const restaurant = restaurants.find(r => r.id === restaurantId);
  const dish = restaurant ? randomItem(restaurant.recommendedDishes)?.name : '菜品';

  // 填充模板
  let content = randomItem(REVIEW_TEMPLATES);
  content = content.replace('{rating}', rating >= 4 ? '不错' : '一般');
  content = content.replace('{dish}', dish);
  content = content.replace('{occasion}', randomItem(['约会', '聚餐', '工作餐', '夜宵']));
  content = content.replace('{speed}', randomItem(['很快', '适中', '有点慢']));
  content = content.replace('{priceComment}', avgPriceComment(restaurant?.avgPrice));
  content = content.replace('{locationComment}', randomItem(['很好找', '有点偏', '一般']));
  content = content.replace('{negative}', randomItem(['分量有点小', '环境一般', '服务员态度一般']));
  content = content.replace('{crowdComment}', randomItem(['很多', '不多', '还可以']));
  content = content.replace('{positive}', randomItem(['味道好', '环境棒', '服务赞', '性价比高', '食材新鲜']));

  return {
    id: id.toString(),
    restaurantId,
    userId: `user${randomInt(1000, 9999)}`,
    userName: randomItem(USERNAMES),
    avatar: `https://picsum.photos/100/100?random=${randomInt(10000, 99999)}`,
    rating,
    content,
    images: Math.random() > 0.7 ? [generateImage()] : [],
    likes: randomInt(0, 50),
    timestamp: generateTimestamp()
  };
}

function avgPriceComment(price) {
  if (!price) return '适中';
  if (price < 30) return '很便宜';
  if (price < 60) return '合理';
  if (price < 100) return '稍贵';
  return '有点贵';
}

function generateImage() {
  return `https://picsum.photos/300/200?random=${randomInt(10000, 99999)}`;
}

function generateTimestamp() {
  const now = Date.now();
  const daysAgo = randomInt(0, 60);
  const date = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

// 生成数据
const restaurants = [];
const reviews = [];
const restaurantCount = 20; // 生成20家餐厅

console.log('开始生成测试数据...\n');

// 生成餐厅
for (let i = 1; i <= restaurantCount; i++) {
  restaurants.push(generateRestaurant(i));
}
console.log(`✓ 生成 ${restaurantCount} 家餐厅`);

// 生成评价
let reviewId = 1;
restaurants.forEach(restaurant => {
  const reviewCount = randomInt(3, 10);
  for (let i = 0; i < reviewCount; i++) {
    reviews.push(generateReview(reviewId++, restaurant.id));
  }
});
console.log(`✓ 生成 ${reviews.length} 条评价`);

// 保存数据
async function saveData() {
  const dataDir = path.join(__dirname, 'backend/data');

  // 备份原有数据
  try {
    await fs.copyFile(
      path.join(dataDir, 'restaurants.json'),
      path.join(dataDir, 'restaurants.json.backup')
    );
    await fs.copyFile(
      path.join(dataDir, 'reviews.json'),
      path.join(dataDir, 'reviews.json.backup')
    );
    console.log('✓ 已备份原有数据');
  } catch (error) {
    console.log('! 无法备份数据（可能是首次生成）');
  }

  // 保存新数据
  await fs.writeFile(
    path.join(dataDir, 'restaurants.json'),
    JSON.stringify(restaurants, null, 2)
  );
  console.log('✓ 保存餐厅数据到 backend/data/restaurants.json');

  await fs.writeFile(
    path.join(dataDir, 'reviews.json'),
    JSON.stringify(reviews, null, 2)
  );
  console.log('✓ 保存评价数据到 backend/data/reviews.json\n');

  // 统计信息
  console.log('数据统计:');
  console.log(`- 餐厅数量: ${restaurants.length}`);
  console.log(`- 评价数量: ${reviews.length}`);
  console.log(`- 菜系分布:`);
  const cuisineCount = {};
  restaurants.forEach(r => {
    cuisineCount[r.cuisine] = (cuisineCount[r.cuisine] || 0) + 1;
  });
  Object.entries(cuisineCount).forEach(([cuisine, count]) => {
    console.log(`  - ${cuisine}: ${count}家`);
  });

  const avgRating = restaurants.reduce((sum, r) => sum + r.rating, 0) / restaurants.length;
  console.log(`- 平均评分: ${avgRating.toFixed(2)}`);
  console.log('\n数据生成完成！');
}

saveData().catch(console.error);
