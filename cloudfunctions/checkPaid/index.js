const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const openid = event.userInfo.openId
  const { reportType } = event

  const res = await db.collection('orders')
    .where({
      openid,
      report_type: reportType,
      payment_status: 'paid',
    })
    .count()

  return { hasPaid: res.total > 0 }
}