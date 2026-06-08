Page({
  data: {
    currentBirthDate: '',
    currentShichen: '',
  },

  onLoad() {
    const profile = wx.getStorageSync('baziProfile')
    if (profile) {
      this.setData({
        currentBirthDate: '已录入',
        currentShichen: profile.isHourEstimated ? '时辰不确定' : '已录入',
      })
    } else {
      this.setData({
        currentBirthDate: '未录入',
        currentShichen: '未录入',
      })
    }
  },

  goToEditBirth() {
    wx.redirectTo({ url: '/pages/index/index' })
  },

  goToPrivacy() {
    wx.navigateTo({ url: '/pages/settings/privacy/privacy' })
  },

  onDeleteData() {
    wx.showModal({
      title: '确认删除',
      content: '删除后所有个人信息将无法恢复，确定要删除吗？',
      confirmText: '确认删除',
      confirmColor: '#ef5350',
      success: async (res) => {
        if (res.confirm) {
          await this.deleteAllData()
        }
      },
    })
  },

  async deleteAllData() {
    wx.showLoading({ title: '删除中...' })
    try {
      await wx.cloud.callFunction({ name: 'deleteUserData' })

      wx.removeStorageSync('baziProfile')
      wx.hideLoading()
      wx.showToast({ title: '数据已删除', icon: 'success' })

      wx.redirectTo({ url: '/pages/index/index' })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '删除失败', icon: 'none' })
    }
  },
})