App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'fortune-telling-d5fn9lvx2fe7d74c',
        traceUser: true,
      })
    }
  },
  globalData: {}
})