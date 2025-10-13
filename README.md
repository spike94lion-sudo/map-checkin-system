# map-checkin-system

# 地图打卡系统

一个基于高德地图API的智能打卡系统，支持周边服务搜索、地点选择、距离检测和打卡记录管理。

## 功能特性

### 🗺️ 地图功能
- 自动获取用户当前位置
- 集成高德地图API显示地图
- 支持地图缩放和拖拽操作
- 实时显示用户位置标记

### 🔍 周边服务搜索
- 搜索周边餐饮、购物、生活服务等
- 显示地点名称、地址和距离信息
- 支持点击选择地点

### 📍 智能打卡
- 400米距离限制检测
- 实时计算用户与选中地点的距离
- 打卡成功/失败状态提示
- 自动保存打卡记录

### 📊 打卡记录管理
- 查看历史打卡记录
- 显示打卡地点、时间和距离
- 本地存储，数据持久化

## 使用方法

### 1. 获取API密钥
1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册账号并创建应用
3. 获取Web服务API密钥
4. 在 `index.html` 中替换 `YOUR_API_KEY` 为你的实际API密钥

### 2. 部署系统
1. 将所有文件上传到Web服务器
2. 确保服务器支持HTTPS（地理位置API需要安全连接）
3. 在浏览器中访问 `index.html`

### 3. 使用流程
1. **获取位置**: 系统会自动获取你的当前位置
2. **搜索周边**: 点击"搜索周边服务"按钮
3. **选择地点**: 从搜索结果中点击选择要打卡的地点
4. **执行打卡**: 点击"打卡"按钮
5. **查看记录**: 点击"查看我的打卡"查看历史记录

## 技术实现

### 前端技术
- **HTML5**: 页面结构
- **CSS3**: 响应式设计和动画效果
- **JavaScript ES6+**: 核心功能实现
- **高德地图API**: 地图服务和周边搜索

### 核心功能
- **地理位置API**: 获取用户当前位置
- **距离计算**: 使用Haversine公式计算两点间距离
- **本地存储**: 使用localStorage保存打卡记录
- **响应式设计**: 支持移动端和桌面端

### 距离检测算法
```javascript
calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
```

## 文件结构

```
地图打卡系统/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 功能脚本
└── README.md           # 说明文档
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 注意事项

1. **HTTPS要求**: 地理位置API需要安全连接，请确保使用HTTPS
2. **API密钥**: 请替换为有效的高德地图API密钥
3. **权限设置**: 首次使用需要允许浏览器获取位置信息
4. **网络连接**: 需要稳定的网络连接以加载地图和搜索服务

## 自定义配置

### 修改打卡距离限制
在 `script.js` 中找到以下代码并修改距离值：
```javascript
if (distance <= 400) { // 修改400为所需距离（米）
    // 打卡成功逻辑
}
```

### 修改搜索范围
在 `searchNearbyServices()` 方法中修改搜索半径：
```javascript
service.searchNearBy('', [this.userLocation.lng, this.userLocation.lat], 1000, ...);
// 修改1000为所需搜索半径（米）
```

### 自定义地图样式
在 `initMap()` 方法中修改地图样式：
```javascript
this.map = new AMap.Map('mapContainer', {
    zoom: 15,
    center: [116.397428, 39.90923],
    mapStyle: 'amap://styles/normal' // 修改为其他样式
});
```

## 许可证

MIT License

