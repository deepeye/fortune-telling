const { generateLuckyRecommendations, computeYearlyTrend } = require('../../utils/bazi-engine')

const ELEMENT_COLORS = {
  木: '#4caf50',
  火: '#ef5350',
  土: '#8d6e63',
  金: '#ffc107',
  水: '#42a5f5',
};

const AI_DIMENSIONS = [
  { name: 'career', label: '事业运解读' },
  { name: 'wealth', label: '财运解读' },
  { name: 'health', label: '健康运解读' },
  { name: 'love', label: '感情运解读' },
];

Page({
  data: {
    profile: null,
    pillarElements: null,
    distributionList: null,
    trend: null,
    lucky: null,
    aiDimensions: AI_DIMENSIONS.map(d => ({
      name: d.name,
      label: d.label,
      loading: true,
      text: '',
    })),
  },

  onLoad() {
    const profile = wx.getStorageSync('baziProfile')
    if (!profile) {
      wx.redirectTo({ url: '/pages/index/index' })
      return
    }

    const stemElementMap = { 甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水' }
    const branchElementMap = { 子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水' }

    const pillarElements = {
      year: stemElementMap[profile.yearPillar.stem] + branchElementMap[profile.yearPillar.branch],
      month: stemElementMap[profile.monthPillar.stem] + branchElementMap[profile.monthPillar.branch],
      day: stemElementMap[profile.dayPillar.stem] + branchElementMap[profile.dayPillar.branch],
      hour: stemElementMap[profile.hourPillar.stem] + branchElementMap[profile.hourPillar.branch],
    }

    const dist = profile.fiveElementsDistribution
    const total = Object.values(dist).reduce((a, b) => a + b, 0)
    const distributionList = Object.entries(dist).map(([element, count]) => ({
      element,
      count,
      percent: total > 0 ? Math.round(count / total * 100) : 0,
      color: ELEMENT_COLORS[element],
    }))

    const now = new Date()
    const startYear = now.getFullYear()
    const trend = computeYearlyTrend(profile, startYear)

    const lucky = generateLuckyRecommendations(profile.dayMaster)

    this.setData({
      profile,
      pillarElements,
      distributionList,
      trend,
      lucky,
    })

    this.loadAIContent()
  },

  async loadAIContent() {
    const promises = this.data.aiDimensions.map((dim, i) =>
      this.loadDimension(dim, i)
    )
    await Promise.all(promises)
  },

  async loadDimension(dim, index) {
    try {
      // Check cached content first
      const cached = await this.getCachedContent(dim.name)
      if (cached) {
        this.updateAIDimension(index, false, cached)
        return
      }

      // Generate fresh content via cloud function (with 1 retry)
      const text = await this.generateWithRetry(dim.name)
      this.updateAIDimension(index, false, text)
    } catch (e) {
      this.updateAIDimension(index, false, '解读内容暂时无法生成，请稍后重试。')
    }
  },

  async generateWithRetry(dimension) {
    const maxRetries = 1
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await wx.cloud.callFunction({
          name: 'generateAIContent',
          data: { dimension },
          timeout: 60000,
        })

        if (res.result.text && !res.result.error) {
          return res.result.text
        }

        // API returned but with error — retry once
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000))
          continue
        }
      } catch (e) {
        // Cloud function call itself failed — retry once
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000))
          continue
        }
      }
    }
    throw new Error('All attempts failed')
  },

  async getCachedContent(dimension) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getCachedAIContent',
        data: { dimension },
      })

      return res.result.text || null
    } catch (e) {
      return null
    }
  },

  updateAIDimension(index, loading, text) {
    const aiDimensions = this.data.aiDimensions.slice()
    aiDimensions[index] = {
      ...aiDimensions[index],
      loading,
      text,
    }
    this.setData({ aiDimensions })
  },
})