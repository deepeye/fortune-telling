const { computeDailyFortune } = require('../../utils/bazi-engine')
const { preparePosterContent } = require('../../utils/poster-service')
const { isFreeMode } = require('../../utils/app-config')

function starsDisplay(score) {
  return '★'.repeat(score) + '☆'.repeat(5 - score)
}

Page({
  data: {
    profile: null,
    fortune: null,
    stars: null,
    hasPaidReport: false,
  },

  async onLoad() {
    const profile = wx.getStorageSync('baziProfile')
    if (profile) {
      const today = this.getToday()
      const fortune = computeDailyFortune(profile, today)

      const hasPaidReport = isFreeMode() ? true : await this.checkPaidStatus()

      this.setData({
        profile,
        fortune,
        hasPaidReport,
        stars: {
          career: starsDisplay(fortune.career),
          wealth: starsDisplay(fortune.wealth),
          health: starsDisplay(fortune.health),
          love: starsDisplay(fortune.love),
        },
      })
    }
  },

  async checkPaidStatus() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'checkPaid',
        data: { reportType: 'bazi_report' },
      })
      return res.result.hasPaid
    } catch (e) {
      return false
    }
  },

  onPreviewTap() {
    wx.navigateTo({ url: '/pages/report/report' })
  },

  getToday() {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  goToInput() {
    wx.redirectTo({ url: '/pages/index/index' })
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  },

  onShare() {
    this.generatePoster()
  },

  async generatePoster() {
    const { profile, fortune } = this.data
    if (!profile || !fortune) return

    wx.showLoading({ title: '生成海报...' })

    let qrCodePath = null
    try {
      const qrRes = await wx.cloud.callFunction({ name: 'generateQRCode' })
      const fileID = qrRes.result.fileID
      const tempUrlRes = await wx.cloud.getTempFileURL({ fileList: [fileID] })
      qrCodePath = tempUrlRes.fileList[0].tempFileURL
    } catch (e) {
      // QR code failed — poster still generated without it
    }

    const content = preparePosterContent({ profile, fortune })
    const ctx = wx.createCanvasContext('posterCanvas')

    // Background
    ctx.setFillStyle('#f5f0e8')
    ctx.fillRect(0, 0, 600, 800)

    // Title
    ctx.setFontSize(32)
    ctx.setFillStyle('#2c2c2c')
    ctx.setTextAlign('center')
    ctx.fillText(content.title, 300, 60)

    // Day Master
    ctx.setFontSize(24)
    ctx.setFillStyle('#8b7355')
    ctx.fillText(`日主五行：${content.dayMaster}`, 300, 100)

    // Star ratings
    ctx.setFontSize(22)
    ctx.setFillStyle('#2c2c2c')
    ctx.setTextAlign('left')
    const startY = 160
    const dims = ['career', 'wealth', 'health', 'love']
    dims.forEach((dim, i) => {
      ctx.fillText(content.starsText[dim], 80, startY + i * 50)
    })

    // Fortune tip
    ctx.setFontSize(20)
    ctx.setFillStyle('#8b7355')
    ctx.setTextAlign('center')
    ctx.fillText(content.fortuneTip, 300, startY + dims.length * 50 + 40)

    // Divider
    ctx.setStrokeStyle('#8b7355')
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.moveTo(80, startY + dims.length * 50 + 80)
    ctx.lineTo(520, startY + dims.length * 50 + 80)
    ctx.stroke()

    // QR code + share prompt
    const qrY = startY + dims.length * 50 + 100
    if (qrCodePath) {
      ctx.drawImage(qrCodePath, 220, qrY, 160, 160)
    }

    ctx.setFontSize(16)
    ctx.setFillStyle('#999')
    ctx.setTextAlign('center')
    ctx.fillText(content.sharePrompt, 300, qrY + (qrCodePath ? 180 : 30))

    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'posterCanvas',
        success: (res) => {
          wx.hideLoading()
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({ title: '海报已保存', icon: 'success' })
            },
            fail: () => {
              wx.showToast({ title: '请授权保存图片', icon: 'none' })
            },
          })
        },
        fail: () => {
          wx.hideLoading()
          wx.showToast({ title: '海报生成失败', icon: 'none' })
        },
      })
    })
  },
})