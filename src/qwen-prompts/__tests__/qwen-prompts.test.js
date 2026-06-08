const { formatPrompt, formatAllPrompts } = require("../index");
const { computeBaZiProfile, computeDailyFortune } = require("../../bazi-engine/index");

describe("formatPrompt", () => {
  test("interpolates BaZi data into career prompt template", () => {
    const profile = computeBaZiProfile({
      birthDate: "1990-01-15",
      birthHour: 6,
      calendarType: "solar",
    });
    const fortune = computeDailyFortune(profile, "2025-06-01");

    const prompt = formatPrompt("career", profile, fortune);

    expect(prompt).toContain("日主五行：金");
    expect(prompt).toContain("木0、火3、土3、金1、水1");
    expect(prompt).toContain("事业运星级：3星");
    expect(prompt).not.toContain("{dayMaster}");
  });
});

describe("formatAllPrompts", () => {
  test("returns prompts for all four dimensions", () => {
    const profile = computeBaZiProfile({
      birthDate: "1990-01-15",
      birthHour: 6,
      calendarType: "solar",
    });
    const fortune = computeDailyFortune(profile, "2025-06-01");

    const prompts = formatAllPrompts(profile, fortune);

    expect(prompts.career).toBeDefined();
    expect(prompts.wealth).toBeDefined();
    expect(prompts.health).toBeDefined();
    expect(prompts.love).toBeDefined();

    expect(prompts.wealth).toContain("财运星级：4星");
  });
});