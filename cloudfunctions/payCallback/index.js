const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { resultCode, outTradeNo, transactionId } = event

  if (resultCode === 'SUCCESS') {
    await db.collection('orders').doc(outTradeNo).update({
      data: {
        payment_status: 'paid',
        wechat_transaction_id: transactionId,
      },
    })
  }

  return { errcode: 0, errmsg: 'ok' }
}