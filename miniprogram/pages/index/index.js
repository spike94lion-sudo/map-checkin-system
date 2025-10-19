// pages/index/index.js
Page({
  data: {
    longitude: 116.397428,
    latitude: 39.90923,
    scale: 15,
    markers: [],
    circles: [],
    showLocation: true,
    loading: false,
    userLocation: null,
    selectedLocation: null,
    recommendations: []
  },

  onLoad() {
    this.getCurrentLocation()
  },

  onShow() {
    // 页面显示时刷新推荐列表
    if (this.data.userLocation) {
      this.searchNearby()
    }
  },

  // 获取当前位置
  getCurrentLocation() {
    this.setData({ loading: true })
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res
        this.setData({
          latitude,
          longitude,
          userLocation: { latitude, longitude },
          loading: false
        })
        
        // 添加用户位置标记
        this.addUserMarker()
        
        // 自动搜索周边
        this.searchNearby()
        
        wx.showToast({
          title: '定位成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
        this.setData({ loading: false })
        
        wx.showModal({
          title: '定位失败',
          content: '无法获取您的位置，请检查定位权限设置',
          showCancel: false
        })
      }
    })
  },

  // 添加用户位置标记
  addUserMarker() {
    const { latitude, longitude } = this.data.userLocation
    const markers = [{
      id: 'user',
      latitude,
      longitude,
      iconPath: '/images/user-location.png',
      width: 30,
      height: 30,
      title: '我的位置'
    }]
    
    this.setData({ markers })
  },

  // 地图点击事件
  onMapTap(e) {
    const { latitude, longitude } = e.detail
    this.selectLocation('地图选点', '', longitude, latitude)
  },

  // 地图长按事件
  onMapLongPress(e) {
    const { latitude, longitude } = e.detail
    this.selectLocation('当前选中地点', '', longitude, latitude)
    
    wx.showToast({
      title: '已选中：当前选中地点',
      icon: 'success'
    })
  },

  // 地图区域变化
  onRegionChange(e) {
    if (e.type === 'end') {
      // 地图移动结束后搜索周边
      this.searchNearby()
    }
  },

  // 选择地点
  selectLocation(name, address, longitude, latitude) {
    const { userLocation } = this.data
    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      latitude,
      longitude
    )

    this.setData({
      selectedLocation: {
        name,
        address,
        longitude,
        latitude,
        distance
      }
    })

    // 添加选中地点标记
    this.addSelectedMarker(longitude, latitude)
    
    // 跳转到打卡页面
    wx.navigateTo({
      url: `/pages/checkin/checkin?name=${name}&address=${address}&longitude=${longitude}&latitude=${latitude}&distance=${distance}`
    })
  },

  // 添加选中地点标记
  addSelectedMarker(longitude, latitude) {
    const markers = [...this.data.markers]
    
    // 移除之前的选中标记
    const filteredMarkers = markers.filter(marker => marker.id !== 'selected')
    
    // 添加新的选中标记
    filteredMarkers.push({
      id: 'selected',
      latitude,
      longitude,
      iconPath: '/images/selected-location.png',
      width: 30,
      height: 30,
      title: '选中地点'
    })

    // 添加400米范围圈
    const circles = [{
      latitude,
      longitude,
      radius: 400,
      color: '#4caf50',
      fillColor: '#4caf50',
      strokeWidth: 2,
      fillOpacity: 0.15
    }]

    this.setData({ 
      markers: filteredMarkers,
      circles
    })
  },

  // 搜索周边地点
  searchNearby() {
    const { latitude, longitude } = this.data.userLocation || this.data
    if (!latitude || !longitude) return

    // 模拟推荐数据（实际项目中应该调用API）
    const mockRecommendations = [
      {
        name: '星巴克咖啡',
        address: '北京市朝阳区三里屯街道',
        latitude: latitude + 0.001,
        longitude: longitude + 0.001,
        distance: 120,
        canCheckin: true
      },
      {
        name: '麦当劳',
        address: '北京市朝阳区工体北路',
        latitude: latitude + 0.002,
        longitude: longitude - 0.001,
        distance: 250,
        canCheckin: true
      },
      {
        name: '肯德基',
        address: '北京市朝阳区三里屯SOHO',
        latitude: latitude - 0.001,
        longitude: longitude + 0.002,
        distance: 380,
        canCheckin: true
      },
      {
        name: '海底捞火锅',
        address: '北京市朝阳区三里屯太古里',
        latitude: latitude + 0.003,
        longitude: longitude + 0.003,
        distance: 450,
        canCheckin: false
      }
    ]

    this.setData({ recommendations: mockRecommendations })
  },

  // 选择推荐地点
  selectRecommendation(e) {
    const { index } = e.currentTarget.dataset
    const item = this.data.recommendations[index]
    
    this.selectLocation(item.name, item.address, item.longitude, item.latitude)
  },

  // 计算两点间距离（米）
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000 // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c)
  }
})
