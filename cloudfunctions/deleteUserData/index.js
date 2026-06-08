const cloud = require('wx-server-sdk')
const { getDeletionCollections } = require('./settings-service/index')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const openid = event.userInfo.openId
  const collections = getDeletionCollections()

  for (const col of collections) {
    const countRes = await db.collection(col).where({ openid }).count()
    if (countRes.total > 0) {
      // Cloud DB only allows batch remove of up to 20 records per call
      // Must paginate for collections with more records
      const MAX_BATCH = 20
      let remaining = countRes.total
      while (remaining > 0) {
        const dataRes = await db.collection(col).where({ openid }).limit(MAX_BATCH).get()
        for (const doc of dataRes.data) {
          await db.collection(col).doc(doc._id).remove()
        }
        remaining -= dataRes.data.length
      }
    }
  }

  return { success: true }
}