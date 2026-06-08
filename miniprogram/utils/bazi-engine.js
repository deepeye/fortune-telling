const { Solar, Lunar } = require('lunar-javascript')

const HOUR_RANGES = [
  [23, 1],  // 子时 0
  [1, 3],   // 丑时 1
  [3, 5],   // 寅时 2
  [5, 7],   // 卯时 3
  [7, 9],   // 辰时 4
  [9, 11],  // 巳时 5
  [11, 13], // 午时 6
  [13, 15], // 未时 7
  [15, 17], // 申时 8
  [17, 19], // 酉时 9
  [19, 21], // 戌时 10
  [21, 23], // 亥时 11
]

const STEM_TO_ELEMENT = {
  甲: '木', 乙: '木',
  丙: '火', 丁: '火',
  戊: '土', 己: '土',
  庚: '金', 辛: '金',
  壬: '水', 癸: '水',
}

const BRANCH_TO_ELEMENT = {
  子: '水', 丑: '土', 寅: '木', 卯: '木',
  辰: '土', 巳: '火', 午: '火', 未: '土',
  申: '金', 酉: '金', 戌: '土', 亥: '水',
}

const GENERATES = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const CONTROLS = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

const DIMENSIONS = {
  career: ['木', '火'],
  wealth: ['土', '金'],
  health: ['水'],
  love: ['火', '土'],
}

const DIMENSION_TIPS = {
  career: { high: '事业运势旺盛，宜主动出击', low: '事业方面需谨慎行事' },
  wealth: { high: '财运亨通，把握理财良机', low: '理财宜保守，避免冲动消费' },
  health: { high: '身心康泰，精力充沛', low: '注意作息规律，养护身体' },
  love: { high: '人际和谐，感情顺遂', low: '感情方面宜包容忍耐' },
}

const NEUTRAL_TIP = '今日宜静不宜动，低调行事为佳'

const LUCKY_RECOMMENDATIONS = {
  木: { colors: ['绿色', '青色'], direction: '东方', number: 3 },
  火: { colors: ['红色', '紫色'], direction: '南方', number: 2 },
  土: { colors: ['黄色', '棕色'], direction: '中央', number: 5 },
  金: { colors: ['白色', '金色'], direction: '西方', number: 4 },
  水: { colors: ['蓝色', '黑色'], direction: '北方', number: 1 },
}

function birthHourToClockHour(birthHour) {
  const [start, end] = HOUR_RANGES[birthHour]
  if (birthHour === 0) return 0
  return (start + end) / 2
}

function elementScore(element, dayMaster) {
  if (element === dayMaster) return 2
  if (GENERATES[element] === dayMaster) return 3
  if (CONTROLS[dayMaster] === element) return 1
  if (GENERATES[dayMaster] === element) return 0
  if (CONTROLS[element] === dayMaster) return -2
  return 0
}

function computeDailyFortune(profile, targetDate) {
  const [year, month, day] = targetDate.split('-').map(Number)
  const solar = Solar.fromYmdHms(year, month, day, 12, 0, 0)
  const lunar = solar.getLunar()
  const baZi = lunar.getBaZi()

  const dayElements = []
  for (const pillar of baZi) {
    dayElements.push(STEM_TO_ELEMENT[pillar[0]])
    dayElements.push(BRANCH_TO_ELEMENT[pillar[1]])
  }

  const dm = profile.dayMaster
  const scores = {}

  for (const [dim, elements] of Object.entries(DIMENSIONS)) {
    let score = 0
    for (const e of dayElements) {
      if (elements.includes(e)) {
        score += elementScore(e, dm)
      }
    }
    scores[dim] = Math.max(1, Math.min(5, Math.round(3 + score / 8)))
  }

  scores.fortuneTip = generateFortuneTip(scores)
  return scores
}

function generateFortuneTip(scores) {
  const dims = Object.keys(scores)
  const maxScore = Math.max(...dims.map(d => scores[d]))
  const minScore = Math.min(...dims.map(d => scores[d]))

  if (maxScore <= 3 && minScore >= 3) return NEUTRAL_TIP

  const strongest = dims.find(d => scores[d] === maxScore)
  const weakest = dims.find(d => scores[d] === minScore)

  if (maxScore >= 4 && minScore <= 2) {
    return DIMENSION_TIPS[strongest].high + '；' + DIMENSION_TIPS[weakest].low
  }

  if (maxScore >= 4) return DIMENSION_TIPS[strongest].high
  if (minScore <= 2) return DIMENSION_TIPS[weakest].low

  return NEUTRAL_TIP
}

function generateLuckyRecommendations(dayMaster) {
  return LUCKY_RECOMMENDATIONS[dayMaster]
}

function computeYearlyTrend(profile, startYear) {
  const trend = []
  for (let i = 0; i < 3; i++) {
    const year = startYear + i
    const dateStr = `${year}-01-15`
    const scores = computeDailyFortune(profile, dateStr)
    trend.push({ year, scores })
  }
  return trend
}

module.exports = { computeDailyFortune, generateLuckyRecommendations, computeYearlyTrend }