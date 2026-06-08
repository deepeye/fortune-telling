const { preparePosterContent } = require("../index");

describe("preparePosterContent", () => {
  test("formats star ratings and fortune tip for poster display", () => {
    const content = preparePosterContent({
      profile: { dayMaster: "金" },
      fortune: {
        career: 3,
        wealth: 4,
        health: 3,
        love: 3,
        fortuneTip: "财运亨通，把握理财良机",
      },
    });

    expect(content.title).toBe("知命 · 今日运势");
    expect(content.starsText.career).toBe("事业 ★★★☆☆");
    expect(content.starsText.wealth).toBe("财运 ★★★★☆");
    expect(content.starsText.health).toBe("健康 ★★★☆☆");
    expect(content.starsText.love).toBe("感情 ★★★☆☆");
    expect(content.fortuneTip).toBe("财运亨通，把握理财良机");
  });

  test("includes Day Master info in poster content", () => {
    const content = preparePosterContent({
      profile: { dayMaster: "木" },
      fortune: {
        career: 5,
        wealth: 2,
        health: 3,
        love: 3,
        fortuneTip: "事业运势旺盛",
      },
    });

    expect(content.dayMaster).toBe("木");
  });

  test("includes sharePrompt text for QR code area", () => {
    const content = preparePosterContent({
      profile: { dayMaster: "金" },
      fortune: {
        career: 3,
        wealth: 4,
        health: 3,
        love: 3,
        fortuneTip: "test",
      },
    });

    expect(content.sharePrompt).toBe("扫码体验「知命」");
  });
});