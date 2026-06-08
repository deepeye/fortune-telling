const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const openid = event.userInfo.openId

  const res = await db.collection('subscriptions')
    .where({
      openid,
      active: true,
    })
    .count()

  return { isSubscribed: res.total > 0 }
}