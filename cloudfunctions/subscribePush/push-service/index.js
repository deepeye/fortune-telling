const TEMPLATE_ID_DAILY_FORTUNE = 'TEMPLATE_ID_DAILY_FORTUNE'

function starsDisplay(score) {
  return '★'.repeat(score) + '☆'.repeat(5 - score)
}

function formatPushContent({ fortune, date }) {
  return {
    page: '/pages/fortune/fortune',
    date: { value: date },
    career: { value: starsDisplay(fortune.career) },
    wealth: { value: starsDisplay(fortune.wealth) },
    health: { value: starsDisplay(fortune.health) },
    love: { value: starsDisplay(fortune.love) },
    tip: { value: fortune.fortuneTip },
  }
}

function processDailyPushes({ subscribers, profiles, date, computeDailyFortune }) {
  const payloads = []

  for (const sub of subscribers) {
    const profile = profiles[sub.openid]
    if (!profile) continue

    const fortune = computeDailyFortune(profile, date)
    const content = formatPushContent({ fortune, date })

    payloads.push({
      touser: sub.openid,
      templateid: TEMPLATE_ID_DAILY_FORTUNE,
      page: content.page,
      data: content,
    })
  }

  return payloads
}

function prepareSubscriptionRecord({ openid }) {
  return {
    openid,
    templateId: TEMPLATE_ID_DAILY_FORTUNE,
    active: true,
    subscribed_at: new Date().toISOString(),
  }
}

module.exports = { formatPushContent, TEMPLATE_ID_DAILY_FORTUNE, processDailyPushes, prepareSubscriptionRecord };