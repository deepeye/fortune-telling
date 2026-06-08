const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const openid = event.userInfo.openId
  const { dimension } = event

  const res = await db.collection('ai_content')
    .where({
      openid,
      dimension,
    })
    .limit(1)
    .get()

  if (res.data.length > 0) {
    return { text: res.data[0].text }
  }
  return { text: null }
}