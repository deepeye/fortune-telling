const { getPrivacyPolicyContent } = require('../../../utils/settings-service')

Page({
  data: {
    sections: [],
  },

  onLoad() {
    const policy = getPrivacyPolicyContent()
    this.setData({ sections: policy.sections })
  },
})