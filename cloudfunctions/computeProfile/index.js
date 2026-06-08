const cloud = require('wx-server-sdk')
const { computeBaZiProfile } = require('./bazi-engine/index')
const { prepareUserRecord, prepareBaziProfileRecord } = require('./profile-service/index')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { birthDate, birthHour, calendarType } = event
  const openid = event.userInfo.openId

  const computedProfile = computeBaZiProfile({
    birthDate,
    birthHour,
    calendarType,
  })

  const userRecord = prepareUserRecord({ birthDate, birthHour, calendarType })
  userRecord.openid = openid

  const profileRecord = prepareBaziProfileRecord(
    { birthDate, birthHour, calendarType },
    computedProfile
  )
  profileRecord.openid = openid

  await db.collection('users').add({ data: userRecord })
  await db.collection('bazi_profiles').add({ data: profileRecord })

  return {
    profile: computedProfile,
    userRecord,
    profileRecord,
  }
}