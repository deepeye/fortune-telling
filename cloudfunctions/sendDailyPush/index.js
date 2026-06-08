const cloud = require('wx-server-sdk')
const { computeDailyFortune } = require('./bazi-engine/index')
const { processDailyPushes } = require('./push-service/index')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event) => {
  const today = event.date || getToday()

  const subscribers = await db.collection('subscriptions')
    .where({ active: true })
    .get()

  // Build profile lookup map
  const profileMap = {}
  for (const sub of subscribers.data) {
    try {
      const profileRes = await db.collection('bazi_profiles')
        .where({ openid: sub.openid })
        .limit(1)
        .get()

      if (profileRes.data.length > 0) {
        profileMap[sub.openid] = reconstructProfile(profileRes.data[0])
      }
    } catch (e) {
      console.error('Profile lookup failed for', sub.openid, e)
    }
  }

  const payloads = processDailyPushes({
    subscribers: subscribers.data,
    profiles: profileMap,
    date: today,
    computeDailyFortune,
  })

  for (const payload of payloads) {
    try {
      await cloud.openapi.subscribeMessage.send({
        touser: payload.touser,
        templateid: payload.templateid,
        page: payload.page,
        data: payload.data,
      })
    } catch (e) {
      console.error('Push failed for', payload.touser, e)
    }
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