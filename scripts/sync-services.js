const path = require('path')

const PROJECT_ROOT = path.resolve(__dirname, '..')

function getSyncMappings() {
  return [
    {
      src: path.join(PROJECT_ROOT, 'src/order-service/index.js'),
      dest: path.join(PROJECT_ROOT, 'cloudfunctions/createOrder/order-service/index.js'),
    },
    {
      src: path.join(PROJECT_ROOT, 'src/push-service/index.js'),
      dest: path.join(PROJECT_ROOT, 'cloudfunctions/sendDailyPush/push-service/index.js'),
    },
    {
      src: path.join(PROJECT_ROOT, 'src/push-service/index.js'),
      dest: path.join(PROJECT_ROOT, 'cloudfunctions/subscribePush/push-service/index.js'),
    },
    {
      src: path.join(PROJECT_ROOT, 'src/settings-service/index.js'),
      dest: path.join(PROJECT_ROOT, 'cloudfunctions/deleteUserData/settings-service/index.js'),
    },
  ]
}

module.exports = { getSyncMappings }

// Run as script: node scripts/sync-services.js
if (require.main === module) {
  const fs = require('fs')
  const mappings = getSyncMappings()

  mappings.forEach(({ src, dest }) => {
    const destDir = path.dirname(dest)
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }
    fs.copyFileSync(src, dest)
    console.log(`Synced: ${path.relative(PROJECT_ROOT, src)} → ${path.relative(PROJECT_ROOT, dest)}`)
  })

  console.log(`\nDone. ${mappings.length} files synced.`)
}