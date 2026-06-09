
const SHICHEN_LIST = [
  '子时 (23:00-01:00)',
  '丑时 (01:00-03:00)',
  '寅时 (03:00-05:00)',
  '卯时 (05:00-07:00)',
  '辰时 (07:00-09:00)',
  '巳时 (09:00-11:00)',
  '午时 (11:00-13:00)',
  '未时 (13:00-15:00)',
  '申时 (15:00-17:00)',
  '酉时 (17:00-19:00)',
  '戌时 (19:00-21:00)',
  '亥时 (21:00-23:00)',
]

Page({
  data: {
    birthDate: '',
    calendarType: 'solar',
    birthHourIndex: -1,
    birthHourDisplay: '',
    birthHourUncertain: false,
    shichenList: SHICHEN_LIST,
  },

  switchToSolar() {
    this.setData({ calendarType: 'solar' })
  },

  switchToLunar() {
    this.setData({ calendarType: 'lunar' })
  },

  onDateChange(e) {
    this.setData({ birthDate: e.detail.value })
  },

  onLunarDateChange(e) {
    this.setData({ birthDate: e.detail.value })
  },

  onShichenChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      birthHourIndex: index,
      birthHourDisplay: SHICHEN_LIST[index],
    })
  },

  onUncertainChange(e) {
    const uncertain = e.detail.value
    this.setData({
      birthHourUncertain: uncertain,
      birthHourDisplay: uncertain ? '不确定' : (this.data.birthHourIndex >= 0 ? SHICHEN_LIST[this.data.birthHourIndex] : ''),
    })
  },

  async onSubmit() {
    const { birthDate, calendarType, birthHourIndex, birthHourUncertain } = this.data

    if (!birthDate) {
      wx.showToast({ title: '请选择出生日期', icon: 'none' })
      return
    }

    if (!birthHourUncertain && birthHourIndex < 0) {
      wx.showToast({ title: '请选择出生时辰', icon: 'none' })
      return
    }

    const birthHour = birthHourUncertain ? -1 : birthHourIndex

    wx.showLoading({ title: '测算中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'computeProfile',
        data: {
          birthDate,
          birthHour,
          calendarType,
        },
      })

      wx.hideLoading()

      if (!res.result || !res.result.profile) {
        wx.showToast({ title: '测算失败，请重试', icon: 'none' })
        return
      }

      const profile = res.result.profile
      wx.setStorageSync('baziProfile', profile)

      wx.redirectTo({
        url: `/pages/fortune/fortune`,
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '测算失败，请重试', icon: 'none' })
      console.error('computeProfile failed:', err)
    }
  },
})