// 地图打卡系统
class CheckinSystem {
    constructor() {
        this.map = null;
        this.userLocation = null;
        this.selectedLocation = null;
        this.searchResults = [];
        this.checkinHistory = this.loadCheckinHistory();
        
        this.init();
    }

    // 初始化系统
    init() {
        this.bindEvents();
        this.initMap();
        this.getUserLocation();
    }

    // 绑定事件
    bindEvents() {
        document.getElementById('searchNearby').addEventListener('click', () => this.searchNearbyServices());
        document.getElementById('getCurrentLocation').addEventListener('click', () => this.getUserLocation());
        document.getElementById('checkinBtn').addEventListener('click', () => this.performCheckin());
        document.getElementById('viewMyCheckins').addEventListener('click', () => this.showMyCheckins());
        
        // 模态框关闭事件
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('myCheckinsModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    // 初始化地图
    initMap() {
        // 使用高德地图API
        this.map = new AMap.Map('mapContainer', {
            zoom: 15,
            center: [116.397428, 39.90923], // 默认北京
            mapStyle: 'amap://styles/normal'
        });

        // 添加地图控件
        this.map.addControl(new AMap.Scale());
        this.map.addControl(new AMap.ToolBar());
    }

    // 获取用户位置
    getUserLocation() {
        const locationElement = document.getElementById('userLocation');
        locationElement.innerHTML = '<span class="loading"></span> 正在获取位置...';

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.userLocation = {
                        lat: latitude,
                        lng: longitude
                    };
                    
                    // 更新地图中心
                    this.map.setCenter([longitude, latitude]);
                    
                    // 添加用户位置标记
                    this.addUserMarker();
                    
                    locationElement.textContent = `当前位置: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                },
                (error) => {
                    console.error('获取位置失败:', error);
                    locationElement.textContent = '获取位置失败，请手动搜索';
                    this.showMessage('无法获取您的位置，请检查浏览器权限设置', 'error');
                }
            );
        } else {
            locationElement.textContent = '浏览器不支持地理位置服务';
            this.showMessage('您的浏览器不支持地理位置服务', 'error');
        }
    }

    // 添加用户位置标记
    addUserMarker() {
        if (this.userLocation) {
            const marker = new AMap.Marker({
                position: [this.userLocation.lng, this.userLocation.lat],
                title: '我的位置',
                icon: new AMap.Icon({
                    size: new AMap.Size(25, 34),
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAyNSAzNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEM1LjU5NjQ0IDAgMCA1LjU5NjQ0IDAgMTIuNUMwIDE5LjQwMzYgNS41OTY0NCAyNSAxMi41IDI1QzE5LjQwMzYgMjUgMjUgMTkuNDAzNiAyNSAxMi41QzI1IDUuNTk2NDQgMTkuNDAzNiAwIDEyLjUgMFoiIGZpbGw9IiM0Q0FGNTAiLz4KPHBhdGggZD0iTTEyLjUgNkM5LjQ2MjQzIDYgNyA4LjQ2MjQzIDcgMTEuNUM3IDE0LjUzNzYgOS40NjI0MyAxNyAxMi41IDE3QzE1LjUzNzYgMTcgMTggMTQuNTM3NiAxOCAxMS41QzE4IDguNDYyNDMgMTUuNTM3NiA2IDEyLjUgNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
                    imageSize: new AMap.Size(25, 34)
                })
            });
            this.map.add(marker);
        }
    }

    // 搜索周边服务
    async searchNearbyServices() {
        if (!this.userLocation) {
            this.showMessage('请先获取您的位置', 'error');
            return;
        }

        const searchBtn = document.getElementById('searchNearby');
        const originalText = searchBtn.textContent;
        searchBtn.innerHTML = '<span class="loading"></span> 搜索中...';
        searchBtn.disabled = true;

        try {
            // 使用高德地图周边搜索API
            const service = new AMap.PlaceSearch({
                type: '餐饮服务|购物服务|生活服务|体育休闲服务|医疗保健服务|住宿服务|风景名胜|商务住宅|政府机构及社会团体|科教文化服务|交通设施服务|金融保险服务|公司企业|道路附属设施|地名地址信息|公共设施',
                pageSize: 20,
                pageIndex: 1
            });

            service.searchNearBy('', [this.userLocation.lng, this.userLocation.lat], 1000, (status, result) => {
                searchBtn.textContent = originalText;
                searchBtn.disabled = false;

                if (status === 'complete' && result.poiList && result.poiList.pois) {
                    this.searchResults = result.poiList.pois;
                    this.displaySearchResults();
                } else {
                    this.showMessage('搜索失败，请重试', 'error');
                }
            });
        } catch (error) {
            console.error('搜索错误:', error);
            searchBtn.textContent = originalText;
            searchBtn.disabled = false;
            this.showMessage('搜索失败，请重试', 'error');
        }
    }

    // 显示搜索结果
    displaySearchResults() {
        const resultsContainer = document.getElementById('searchResults');
        
        if (this.searchResults.length === 0) {
            resultsContainer.innerHTML = '<div class="empty-state">未找到周边服务</div>';
            return;
        }

        resultsContainer.innerHTML = this.searchResults.map((poi, index) => {
            const distance = this.calculateDistance(
                this.userLocation.lat, 
                this.userLocation.lng, 
                poi.location.lat, 
                poi.location.lng
            );

            return `
                <div class="result-item" data-index="${index}">
                    <div class="result-name">${poi.name}</div>
                    <div class="result-address">${poi.address}</div>
                    <div class="result-distance">距离: ${distance.toFixed(0)}米</div>
                </div>
            `;
        }).join('');

        // 绑定点击事件
        resultsContainer.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', () => this.selectLocation(parseInt(item.dataset.index)));
        });
    }

    // 选择地点
    selectLocation(index) {
        // 移除之前的选择
        document.querySelectorAll('.result-item').forEach(item => {
            item.classList.remove('selected');
        });

        // 标记当前选择
        document.querySelector(`[data-index="${index}"]`).classList.add('selected');

        this.selectedLocation = this.searchResults[index];
        
        // 更新选中地点显示
        const selectedDiv = document.getElementById('selectedLocation');
        const distance = this.calculateDistance(
            this.userLocation.lat, 
            this.userLocation.lng, 
            this.selectedLocation.location.lat, 
            this.selectedLocation.location.lng
        );

        selectedDiv.innerHTML = `
            <h4>${this.selectedLocation.name}</h4>
            <p>地址: ${this.selectedLocation.address}</p>
            <p>距离: ${distance.toFixed(0)}米</p>
        `;

        // 启用打卡按钮
        document.getElementById('checkinBtn').disabled = false;

        // 在地图上标记选中地点
        this.addSelectedLocationMarker();
    }

    // 添加选中地点标记
    addSelectedLocationMarker() {
        if (this.selectedLocation) {
            // 清除之前的标记
            this.map.clearMap();
            this.addUserMarker();

            const marker = new AMap.Marker({
                position: [this.selectedLocation.location.lng, this.selectedLocation.location.lat],
                title: this.selectedLocation.name,
                icon: new AMap.Icon({
                    size: new AMap.Size(25, 34),
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAyNSAzNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEM1LjU5NjQ0IDAgMCA1LjU5NjQ0IDAgMTIuNUMwIDE5LjQwMzYgNS41OTY0NCAyNSAxMi41IDI1QzE5LjQwMzYgMjUgMjUgMTkuNDAzNiAyNSAxMi41QzI1IDUuNTk2NDQgMTkuNDAzNiAwIDEyLjUgMFoiIGZpbGw9IiNGRjYwMDAiLz4KPHBhdGggZD0iTTEyLjUgNkM5LjQ2MjQzIDYgNyA4LjQ2MjQzIDcgMTEuNUM3IDE0LjUzNzYgOS40NjI0MyAxNyAxMi41IDE3QzE1LjUzNzYgMTcgMTggMTQuNTM3NiAxOCAxMS41QzE4IDguNDYyNDMgMTUuNTM3NiA2IDEyLjUgNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
                    imageSize: new AMap.Size(25, 34)
                })
            });
            this.map.add(marker);

            // 调整地图视野
            this.map.setFitView([marker]);
        }
    }

    // 执行打卡
    performCheckin() {
        if (!this.selectedLocation || !this.userLocation) {
            this.showMessage('请先选择地点', 'error');
            return;
        }

        const distance = this.calculateDistance(
            this.userLocation.lat, 
            this.userLocation.lng, 
            this.selectedLocation.location.lat, 
            this.selectedLocation.location.lng
        );

        const resultDiv = document.getElementById('checkinResult');
        
        if (distance <= 400) {
            // 打卡成功
            const checkinRecord = {
                id: Date.now(),
                locationName: this.selectedLocation.name,
                address: this.selectedLocation.address,
                latitude: this.selectedLocation.location.lat,
                longitude: this.selectedLocation.location.lng,
                checkinTime: new Date().toLocaleString('zh-CN'),
                distance: Math.round(distance)
            };

            this.checkinHistory.unshift(checkinRecord);
            this.saveCheckinHistory();

            resultDiv.innerHTML = `
                <div class="checkin-result success">
                    ✓ 打卡成功！<br>
                    地点: ${this.selectedLocation.name}<br>
                    距离: ${distance.toFixed(0)}米
                </div>
            `;

            this.showMessage('打卡成功！', 'success');
        } else {
            // 打卡失败
            resultDiv.innerHTML = `
                <div class="checkin-result error">
                    ✗ 打卡失败！<br>
                    距离过远: ${distance.toFixed(0)}米<br>
                    需要在400米以内才能打卡
                </div>
            `;

            this.showMessage('距离过远，无法打卡', 'error');
        }
    }

    // 显示我的打卡记录
    showMyCheckins() {
        const modal = document.getElementById('myCheckinsModal');
        const historyContainer = document.getElementById('checkinsHistory');
        
        if (this.checkinHistory.length === 0) {
            historyContainer.innerHTML = '<div class="empty-state">暂无打卡记录</div>';
        } else {
            historyContainer.innerHTML = this.checkinHistory.map(record => `
                <div class="history-item">
                    <div class="history-info">
                        <div class="history-location">${record.locationName}</div>
                        <div class="history-time">${record.checkinTime}</div>
                    </div>
                    <div class="history-distance">${record.distance}m</div>
                </div>
            `).join('');
        }
        
        modal.style.display = 'block';
    }

    // 关闭模态框
    closeModal() {
        document.getElementById('myCheckinsModal').style.display = 'none';
    }

    // 计算两点间距离（米）
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

    // 显示消息
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        if (type === 'success') {
            messageDiv.style.background = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
        } else if (type === 'error') {
            messageDiv.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
        } else {
            messageDiv.style.background = 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)';
        }

        document.body.appendChild(messageDiv);

        // 3秒后自动移除
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    // 加载打卡历史
    loadCheckinHistory() {
        const history = localStorage.getItem('checkinHistory');
        return history ? JSON.parse(history) : [];
    }

    // 保存打卡历史
    saveCheckinHistory() {
        localStorage.setItem('checkinHistory', JSON.stringify(this.checkinHistory));
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化系统
document.addEventListener('DOMContentLoaded', () => {
    new CheckinSystem();
});

