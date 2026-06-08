function starsDisplay(score) {
  return '★'.repeat(score) + '☆'.repeat(5 - score)
}

function preparePosterContent({ profile, fortune }) {
  const starsText = {
    career: `事业 ${starsDisplay(fortune.career)}`,
    wealth: `财运 ${starsDisplay(fortune.wealth)}`,
    health: `健康 ${starsDisplay(fortune.health)}`,
    love: `感情 ${starsDisplay(fortune.love)}`,
  }

  return {
    title: '知命 · 今日运势',
    dayMaster: profile.dayMaster,
    starsText,
    fortuneTip: fortune.fortuneTip,
  }
}

module.exports = { preparePosterContent }