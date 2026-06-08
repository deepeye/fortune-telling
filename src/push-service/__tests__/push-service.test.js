const { formatPushContent, TEMPLATE_ID_DAILY_FORTUNE, processDailyPushes, prepareSubscriptionRecord } = require("../index");

// Stub computeDailyFortune for pure-function testing (no lunar-javascript dependency)
function stubComputeDailyFortune(profile, date) {
  return {
    career: 3,
    wealth: 4,
    health: 3,
    love: 3,
    fortuneTip: `今日运势 ${profile.dayMaster}`,
  };
}

describe("formatPushContent", () => {
  test("formats daily fortune into subscription message template data", () => {
    const content = formatPushContent({
      fortune: {
        career: 3,
        wealth: 4,
        health: 3,
        love: 3,
        fortuneTip: "财运亨通，把握理财良机",
      },
      date: "2025-06-02",
    });

    expect(content.date.value).toBe("2025-06-02");
    expect(content.career.value).toBe("★★★☆☆");
    expect(content.wealth.value).toBe("★★★★☆");
    expect(content.health.value).toBe("★★★☆☆");
    expect(content.love.value).toBe("★★★☆☆");
    expect(content.tip.value).toBe("财运亨通，把握理财良机");
  });

  test("every template data field has value property matching WeChat subscribeMessage.send format", () => {
    const content = formatPushContent({
      fortune: { career: 3, wealth: 4, health: 3, love: 3, fortuneTip: "test" },
      date: "2025-06-02",
    });

    const templateFields = ['date', 'career', 'wealth', 'health', 'love', 'tip'];
    templateFields.forEach((key) => {
      expect(content[key]).toHaveProperty("value");
      expect(typeof content[key].value).toBe("string");
    });
  });

  test("returns landing page path for push notification", () => {
    const content = formatPushContent({
      fortune: { career: 3, wealth: 4, health: 3, love: 3, fortuneTip: "test" },
      date: "2025-06-02",
    });

    expect(content.page).toBe("/pages/fortune/fortune");
  });
});

describe("TEMPLATE_ID_DAILY_FORTUNE", () => {
  test("is defined as a constant for cloud function configuration", () => {
    expect(TEMPLATE_ID_DAILY_FORTUNE).toBeDefined();
    expect(typeof TEMPLATE_ID_DAILY_FORTUNE).toBe("string");
  });
});

describe("processDailyPushes", () => {
  const subscribers = [
    { openid: 'user1', templateId: TEMPLATE_ID_DAILY_FORTUNE },
    { openid: 'user2', templateId: TEMPLATE_ID_DAILY_FORTUNE },
  ];

  const profiles = {
    user1: {
      yearPillar: { stem: '甲', branch: '子' },
      monthPillar: { stem: '丙', branch: '寅' },
      dayPillar: { stem: '戊', branch: '辰' },
      hourPillar: { stem: '庚', branch: '申' },
      dayMaster: '土',
      fiveElementsDistribution: { 木: 2, 火: 2, 土: 2, 金: 2, 水: 2 },
    },
    user2: {
      yearPillar: { stem: '壬', branch: '亥' },
      monthPillar: { stem: '甲', branch: '子' },
      dayPillar: { stem: '丙', branch: '寅' },
      hourPillar: { stem: '戊', branch: '辰' },
      dayMaster: '火',
      fiveElementsDistribution: { 木: 2, 火: 2, 土: 1, 金: 1, 水: 2 },
    },
  };

  test("returns push payloads for each subscriber with profile", () => {
    const result = processDailyPushes({ subscribers, profiles, date: '2025-06-05', computeDailyFortune: stubComputeDailyFortune });

    expect(result).toHaveLength(2);
    expect(result[0].touser).toBe('user1');
    expect(result[1].touser).toBe('user2');
  });

  test("each payload includes templateId, page, and data", () => {
    const result = processDailyPushes({ subscribers, profiles, date: '2025-06-05', computeDailyFortune: stubComputeDailyFortune });

    result.forEach((payload) => {
      expect(payload.touser).toBeDefined();
      expect(payload.templateid).toBe(TEMPLATE_ID_DAILY_FORTUNE);
      expect(payload.page).toBe('/pages/fortune/fortune');
      expect(payload.data).toBeDefined();
      expect(payload.data.date.value).toBe('2025-06-05');
      expect(payload.data.tip.value).toBeDefined();
    });
  });

  test("skips subscribers without a profile", () => {
    const subscribersWithMissing = [
      { openid: 'user1', templateId: TEMPLATE_ID_DAILY_FORTUNE },
      { openid: 'user_no_profile', templateId: TEMPLATE_ID_DAILY_FORTUNE },
    ];

    const result = processDailyPushes({ subscribers: subscribersWithMissing, profiles, date: '2025-06-05', computeDailyFortune: stubComputeDailyFortune });

    expect(result).toHaveLength(1);
    expect(result[0].touser).toBe('user1');
  });
});

describe("prepareSubscriptionRecord", () => {
  test("creates subscription record with openid, templateId, active status, and timestamp", () => {
    const record = prepareSubscriptionRecord({ openid: 'user1' });

    expect(record.openid).toBe('user1');
    expect(record.templateId).toBe(TEMPLATE_ID_DAILY_FORTUNE);
    expect(record.active).toBe(true);
    expect(record.subscribed_at).toBeDefined();
  });
});