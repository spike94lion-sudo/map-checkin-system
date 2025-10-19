// pages/history/history.js
Page({
  data: {
    checkinHistory: [],
    totalCheckins: 0,
    thisWeekCheckins: 0,
    thisMonthCheckins: 0,
    filterType: 'all'
  },

  onLoad() {
    this.loadCheckinHistory()
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadCheckinHistory()
  },

  // 加载打卡记录
  loadCheckinHistory() {
    const checkinHistory = wx.getStorageSync('checkinHistory') || []
    this.setData({ checkinHistory })
    
    // 计算统计数据
    this.calculateStats(checkinHistory)
  },

  // 计算统计数据
  calculateStats(checkinHistory) {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const thisWeekCheckins = checkinHistory.filter(item => {
      const checkinDate = new Date(item.timestamp)
      return checkinDate >= startOfWeek
    }).length
    
    const thisMonthCheckins = checkinHistory.filter(item => {
      const checkinDate = new Date(item.timestamp)
      return checkinDate >= startOfMonth
    }).length

    this.setData({
      totalCheckins: checkinHistory.length,
      thisWeekCheckins,
      thisMonthCheckins
    })
  },

  // 设置筛选条件
  setFilter(e) {
    const { type } = e.currentTarget.dataset
    this.setData({ filterType: type })
    
    // 根据筛选条件过滤数据
    this.filterHistory(type)
  },

  // 筛选历史记录
  filterHistory(type) {
    let checkinHistory = wx.getStorageSync('checkinHistory') || []
    
    if (type === 'week') {
      const now = new Date()
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
      checkinHistory = checkinHistory.filter(item => {
        const checkinDate = new Date(item.timestamp)
        return checkinDate >= startOfWeek
      })
    } else if (type === 'month') {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      checkinHistory = checkinHistory.filter(item => {
        const checkinDate = new Date(item.timestamp)
        return checkinDate >= startOfMonth
      })
    }
    
    this.setData({ checkinHistory })
  },

  // 查看详情
  viewDetail(e) {
    const { item } = e.currentTarget.dataset
    
    wx.showModal({
      title: item.locationName,
      content: `地址: ${item.locationAddress}\n距离: ${item.distance}米\n时间: ${item.checkinTime}`,
      showCancel: true,
      cancelText: '关闭',
      confirmText: '重新打卡',
      success: (res) => {
        if (res.confirm) {
          // 跳转到地图页面并定位到该地点
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }
    })
  },

  // 去打卡
  goToMap() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 清空历史记录
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有打卡记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('checkinHistory')
          
          // 更新全局数据
          const app = getApp()
          app.globalData.checkinHistory = []
          
          // 刷新页面数据
          this.setData({
            checkinHistory: [],
            totalCheckins: 0,
            thisWeekCheckins: 0,
            thisMonthCheckins: 0
          })
          
          wx.showToast({
            title: '已清空记录',
            icon: 'success'
          })
        }
      }
    })
  },

  // 分享打卡记录
  onShareAppMessage() {
    const { totalCheckins } = this.data
    return {
      title: `我已经打卡${totalCheckins}次了！`,
      path: '/pages/index/index',
      imageUrl: '/images/share-history.png'
    }
  }
})
