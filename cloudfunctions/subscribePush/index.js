const cloud = require('wx-server-sdk')
const { prepareSubscriptionRecord } = require('./push-service/index')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const openid = event.userInfo.openId
  const record = prepareSubscriptionRecord({ openid })

  await db.collection('subscriptions').add({ data: record })

  return { success: true }
}