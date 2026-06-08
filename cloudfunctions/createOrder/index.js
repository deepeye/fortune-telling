const cloud = require('wx-server-sdk')
const { prepareOrderRecord, REPORT_PRICES_FEN } = require('./order-service/index')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { reportType } = event
  const openid = event.userInfo.openId

  const orderRecord = prepareOrderRecord({ openid, reportType })
  const addRes = await db.collection('orders').add({ data: orderRecord })
  const orderId = addRes._id

  const totalFee = REPORT_PRICES_FEN[reportType]
  const nonceStr = Math.random().toString(36).substr(2, 32)

  const payRes = await cloud.cloudPay.unifiedOrder({
    body: '知命-八字命盘深度解读',
    outTradeNo: orderId,
    totalFee,
    spbillCreateIp: '127.0.0.1',
    nonceStr,
    tradeType: 'JSAPI',
    openid,
    envId: cloud.DYNAMIC_CURRENT_ENV,
    functionName: 'payCallback',
  })

  return {
    orderId,
    payment: payRes.payment,
  }
}