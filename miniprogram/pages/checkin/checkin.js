// pages/checkin/checkin.js
Page({
  data: {
    locationName: '',
    locationAddress: '',
    longitude: 0,
    latitude: 0,
    distance: 0,
    canCheckin: false,
    checking: false,
    checkinResult: null
  },

  onLoad(options) {
    const { name, address, longitude, latitude, distance } = options
    this.setData({
      locationName: decodeURIComponent(name || ''),
      locationAddress: decodeURIComponent(address || ''),
      longitude: parseFloat(longitude) || 0,
      latitude: parseFloat(latitude) || 0,
      distance: parseInt(distance) || 0
    })
    
    // 检查是否可以打卡
    this.checkCanCheckin()
  },

  onShow() {
    // 页面显示时重新检查打卡条件
    this.checkCanCheckin()
  },

  // 检查是否可以打卡
  checkCanCheckin() {
    const { distance } = this.data
    const canCheckin = distance <= 400
    
    this.setData({ canCheckin })
    
    if (!canCheckin) {
      this.setData({
        checkinResult: {
          success: false,
          message: '距离过远，无法打卡',
          detail: `当前位置距离选中地点${distance}米，需要在400米以内才能打卡`
        }
      })
    } else {
      this.setData({ checkinResult: null })
    }
  },

  // 执行打卡
  performCheckin() {
    if (!this.data.canCheckin) {
      wx.showToast({
        title: '距离过远，无法打卡',
        icon: 'error'
      })
      return
    }

    this.setData({ checking: true })

    // 获取当前位置进行最终验证
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res
        const distance = this.calculateDistance(
          latitude,
          longitude,
          this.data.latitude,
          this.data.longitude
        )

        if (distance <= 400) {
          // 打卡成功
          this.saveCheckinRecord(distance)
          this.setData({
            checkinResult: {
              success: true,
              message: '打卡成功！',
              detail: `地点: ${this.data.locationName}\n距离: ${distance}米`
            },
            checking: false
          })

          wx.showToast({
            title: '打卡成功',
            icon: 'success'
          })

          // 分享打卡成功
          this.shareCheckinSuccess()
        } else {
          // 距离验证失败
          this.setData({
            checkinResult: {
              success: false,
              message: '打卡失败',
              detail: `当前位置距离选中地点${distance}米，需要在400米以内才能打卡`
            },
            checking: false
          })

          wx.showToast({
            title: '距离过远，无法打卡',
            icon: 'error'
          })
        }
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
        this.setData({ checking: false })
        
        // 根据错误类型给出不同提示
        let errorMsg = '无法获取当前位置'
        if (err.errMsg.includes('auth deny')) {
          errorMsg = '定位权限被拒绝，请开启定位权限'
        } else if (err.errMsg.includes('system deny')) {
          errorMsg = '系统定位服务未开启'
        }
        
        wx.showModal({
          title: '定位失败',
          content: errorMsg + '，无法完成打卡验证',
          confirmText: '去设置',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  },

  // 保存打卡记录
  saveCheckinRecord(distance) {
    const checkinRecord = {
      id: Date.now(),
      locationName: this.data.locationName,
      locationAddress: this.data.locationAddress,
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      distance: distance,
      checkinTime: new Date().toLocaleString('zh-CN'),
      timestamp: Date.now()
    }

    // 获取现有记录
    let checkinHistory = wx.getStorageSync('checkinHistory') || []
    
    // 添加新记录到开头
    checkinHistory.unshift(checkinRecord)
    
    // 限制记录数量（最多100条）
    if (checkinHistory.length > 100) {
      checkinHistory = checkinHistory.slice(0, 100)
    }
    
    // 保存到本地存储
    wx.setStorageSync('checkinHistory', checkinHistory)
    
    // 更新全局数据
    const app = getApp()
    app.globalData.checkinHistory = checkinHistory
  },

  // 分享打卡成功
  shareCheckinSuccess() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 返回地图
  goBack() {
    wx.navigateBack({
      delta: 1
    })
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
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: `我在${this.data.locationName}打卡成功！`,
      path: '/pages/index/index',
      imageUrl: '/images/share-checkin.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: `我在${this.data.locationName}打卡成功！`,
      imageUrl: '/images/share-checkin.png'
    }
  }
})
