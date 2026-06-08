const cloud = require('wx-server-sdk')
const axios = require('axios')
const { computeBaZiProfile, computeDailyFortune } = require('./bazi-engine/index')
const { buildQwenRequestBody, parseQwenResponse, QWEN_API_URL } = require('./qwen-service/index')
const { formatPrompt } = require('./qwen-prompts/index')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// Read API key from env.json (excluded from git)
let apiKey = ''
try {
  const envConfig = require('./env.json')
  apiKey = envConfig.QWEN_API_KEY
} catch (e) {
  apiKey = process.env.QWEN_API_KEY || ''
}

exports.main = async (event, context) => {
  const openid = event.userInfo.openId || event.openid
  const { dimension } = event

  if (!apiKey) {
    return { dimension, text: '解读内容暂时无法生成，请稍后重试。' }
  }

  const profileRes = await db.collection('bazi_profiles')
    .where({ openid })
    .limit(1)
    .get()

  if (profileRes.data.length === 0) {
    return { error: 'Profile not found' }
  }

  const baziRecord = profileRes.data[0]
  const profile = reconstructProfile(baziRecord)

  const today = getToday()
  const fortune = computeDailyFortune(profile, today)

  const prompt = formatPrompt(dimension, profile, fortune)
  const requestBody = buildQwenRequestBody(prompt)

  try {
    const response = await axios.post(QWEN_API_URL, requestBody, {
      timeout: 50000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    const parsed = parseQwenResponse(response.data)

    await cacheAIContent(openid, dimension, parsed.text)

    return { dimension, text: parsed.text }
  } catch (e) {
    return {
      dimension,
      text: '解读内容暂时无法生成，请稍后重试。',
    }
  }
}

async function cacheAIContent(openid, dimension, text) {
  const existing = await db.collection('ai_content')
    .where({ openid, dimension })
    .count()

  if (existing.total > 0) {
    const dataRes = await db.collection('ai_content')
      .where({ openid, dimension })
      .get()

    await db.collection('ai_content')
      .doc(dataRes.data[0]._id)
      .update({ data: { text, generated_at: new Date().toISOString() } })
  } else {
    await db.collection('ai_content').add({
      data: { openid, dimension, text, generated_at: new Date().toISOString() },
    })
  }
}

function getToday() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function reconstructProfile(baziRecord) {
  return {
    yearPillar: { stem: baziRecord.year_pillar[0], branch: baziRecord.year_pillar[1] },
    monthPillar: { stem: baziRecord.month_pillar[0], branch: baziRecord.month_pillar[1] },
    dayPillar: { stem: baziRecord.day_pillar[0], branch: baziRecord.day_pillar[1] },
    hourPillar: { stem: baziRecord.hour_pillar[0], branch: baziRecord.hour_pillar[1] },
    dayMaster: baziRecord.day_master,
    fiveElementsDistribution: baziRecord.five_elements_distribution,
  }
}