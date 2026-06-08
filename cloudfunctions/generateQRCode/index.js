const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const result = await cloud.openapi.wxacode.getUnlimitedQRCode({
    scene: 'home',
    page: 'pages/index/index',
    width: 280,
    isHyaline: false,
  })

  // result is a Buffer containing the QR code image
  // Upload to cloud storage so frontend can access via URL
  const uploadRes = await cloud.uploadFile({
    cloudPath: `qrcode/home_${Date.now()}.png`,
    fileContent: result,
  })

  return {
    fileID: uploadRes.fileID,
    tempFileURL: uploadRes.fileID,
  }
}