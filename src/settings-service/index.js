function getDeletionCollections() {
  return ["users", "bazi_profiles", "orders", "subscriptions", "ai_content"];
}

function validateBirthDateUpdate(input) {
  const errors = [];

  if (!input.birthDate) {
    errors.push("出生日期不能为空");
  }

  if (input.birthHour === undefined) {
    errors.push("出生时辰不能为空");
  } else if (input.birthHour !== -1 && (input.birthHour < 0 || input.birthHour > 11)) {
    errors.push("时辰必须在0-11之间或-1（不确定）");
  }

  if (!input.calendarType) {
    errors.push("历法类型不能为空");
  }

  return { valid: errors.length === 0, errors };
}

function getPrivacyPolicyContent() {
  return {
    sections: [
      {
        title: "我们收集哪些数据",
        content: "我们仅收集以下必要信息：openid（微信唯一标识，用于识别用户身份）、出生日期和时辰（用于计算八字命盘和每日运势）。我们不收集姓名、手机号、地址等额外个人信息。",
      },
      {
        title: "数据如何使用",
        content: "您的出生日期用于计算八字命盘（四柱天干地支、五行分布），结果存储在云数据库中避免重复计算。openid 用于关联您的命盘和订单数据。每日运势基于您的命盘与当日五行关系推算。",
      },
      {
        title: "数据如何存储",
        content: "所有数据存储在微信云开发的安全数据库中，与您的微信账号绑定。数据不会传输至任何第三方服务器。",
      },
      {
        title: "如何删除您的数据",
        content: "您可以在设置页面点击「删除我的数据」，一键删除所有个人信息（用户记录、命盘、订单、订阅、解读内容）。删除后数据不可恢复，您将回到初始输入页面。",
      },
    ],
  }
}

module.exports = { getDeletionCollections, validateBirthDateUpdate, getPrivacyPolicyContent };