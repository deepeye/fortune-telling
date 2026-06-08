const { computeBaZiProfile, computeDailyFortune, generateFortuneTip, generateLuckyRecommendations, computeYearlyTrend } = require("../index");

describe("computeBaZiProfile", () => {
  test("computes Four Pillars from solar birth date with known birth hour", () => {
    // 1990-01-15, 午时 (hour index 6)
    const profile = computeBaZiProfile({
      birthDate: "1990-01-15",
      birthHour: 6,
      calendarType: "solar",
    });

    expect(profile.yearPillar).toEqual({ stem: "己", branch: "巳" });
    expect(profile.monthPillar).toEqual({ stem: "丁", branch: "丑" });
    expect(profile.dayPillar).toEqual({ stem: "庚", branch: "辰" });
    expect(profile.hourPillar).toEqual({ stem: "壬", branch: "午" });
    expect(profile.isHourEstimated).toBe(false);
  });

  test("computes same Four Pillars from lunar birth date as equivalent solar", () => {
    // Lunar 1989-12-19 = Solar 1990-01-15, 午时
    const lunarProfile = computeBaZiProfile({
      birthDate: "1989-12-19",
      birthHour: 6,
      calendarType: "lunar",
    });

    const solarProfile = computeBaZiProfile({
      birthDate: "1990-01-15",
      birthHour: 6,
      calendarType: "solar",
    });

    expect(lunarProfile.yearPillar).toEqual(solarProfile.yearPillar);
    expect(lunarProfile.monthPillar).toEqual(solarProfile.monthPillar);
    expect(lunarProfile.dayPillar).toEqual(solarProfile.dayPillar);
    expect(lunarProfile.hourPillar).toEqual(solarProfile.hourPillar);
  });

  test("defaults to 子时 and flags estimated when birth hour is uncertain", () => {
    // birthHour = -1 means uncertain, should default to 子时 (0)
    const profile = computeBaZiProfile({
      birthDate: "1990-01-15",
      birthHour: -1,
      calendarType: "solar",
    });

    // 子时 hour pillar for 1990-01-15: 丙子
    expect(profile.hourPillar).toEqual({ stem: "丙", branch: "子" });
    expect(profile.isHourEstimated).toBe(true);
  });

  test("extracts Day Master element from Day Pillar stem", () => {
    // 1990-01-15: Day Pillar stem = 庚 → 金
    const profile = computeBaZiProfile({
      birthDate: "1990-01-15",
      birthHour: 6,
      calendarType: "solar",
    });

    expect(profile.dayMaster).toBe("金");

    // 1985-06-20: Day Pillar stem = 庚 → 金 (same stem)
    const profile2 = computeBaZiProfile({
      birthDate: "1985-06-20",
      birthHour: 7,
      calendarType: "solar",
    });

    expect(profile2.dayMaster).toBe("金");
  });

  test("computes Five Elements distribution across Four Pillars", () => {
    // 1990-01-15 午时: 己巳/丁丑/庚辰/壬午
    // Stem elements: 己→土, 丁→火, 庚→金, 壬→水
    // Branch elements: 巳→火, 丑→土, 辰→土, 午→火
    // Distribution: 木=0, 火=3, 土=3, 金=1, 水=1 (8 positions total)
    const profile = computeBaZiProfile({
      birthDate: "1990-01-15",
      birthHour: 6,
      calendarType: "solar",
    });

    expect(profile.fiveElementsDistribution).toEqual({
      木: 0, 火: 3, 土: 3, 金: 1, 水: 1,
    });
  });
});

describe("computeDailyFortune", () => {
  test("computes four-dimension star ratings from profile and target date", () => {
    // 1990-01-15 profile: Day Master 金
    // Target date: 2025-06-01 (午时 as standard reference)
    // Target pillars: 乙巳/辛巳/辛丑/甲午
    // Position elements: 乙(木),巳(火),辛(金),巳(火),辛(金),丑(土),甲(木),午(火)
    // For 金 Day Master: 木→+1, 火→-2, 土→+3, 金→+2, 水→0
    // career(木火): 木×2(+2) + 火×3(-6) = -4 → stars=3
    // wealth(土金): 土×1(+3) + 金×2(+4) = +7 → stars=4
    // health(水): none present → 0 → stars=3
    // love(火土): 火×3(-6) + 土×1(+3) = -3 → stars=3
    const profile = computeBaZiProfile({
      birthDate: "1990-01-15",
      birthHour: 6,
      calendarType: "solar",
    });

    const fortune = computeDailyFortune(profile, "2025-06-01");

    expect(fortune.career).toBe(3);
    expect(fortune.wealth).toBe(4);
    expect(fortune.health).toBe(3);
    expect(fortune.love).toBe(3);
    expect(fortune.fortuneTip).toBeDefined();
  });
});

describe("generateFortuneTip", () => {
  test("returns cautious tip when most dimensions are neutral", () => {
    const scores = { career: 3, wealth: 3, health: 3, love: 3 };
    const tip = generateFortuneTip(scores);
    expect(tip).toContain("宜静");
  });

  test("returns wealth-focused tip when wealth is strongest", () => {
    const scores = { career: 2, wealth: 5, health: 3, love: 3 };
    const tip = generateFortuneTip(scores);
    expect(tip).toContain("财");
  });

  test("returns career-focused tip when career is strongest", () => {
    const scores = { career: 5, wealth: 2, health: 3, love: 3 };
    const tip = generateFortuneTip(scores);
    expect(tip).toContain("事业");
  });
});

describe("generateLuckyRecommendations", () => {
  test("returns recommendations based on Day Master element", () => {
    // Day Master 金: lucky colors include white/gold, direction west, numbers 4/9
    const recs = generateLuckyRecommendations("金");

    expect(recs.colors).toBeDefined();
    expect(recs.colors.length).toBeGreaterThan(0);
    expect(recs.direction).toBeDefined();
    expect(recs.number).toBeDefined();
  });

  test("returns different recommendations for different elements", () => {
    const goldRecs = generateLuckyRecommendations("金");
    const woodRecs = generateLuckyRecommendations("木");

    expect(goldRecs.colors).not.toEqual(woodRecs.colors);
    expect(goldRecs.direction).not.toEqual(woodRecs.direction);
  });
});

describe("computeYearlyTrend", () => {
  test("returns 3-year trend with scores for each year and dimension", () => {
    const profile = computeBaZiProfile({
      birthDate: "1990-01-15",
      birthHour: 6,
      calendarType: "solar",
    });

    const trend = computeYearlyTrend(profile, 2025);

    expect(trend.length).toBe(3);
    expect(trend[0].year).toBe(2025);
    expect(trend[1].year).toBe(2026);
    expect(trend[2].year).toBe(2027);
    expect(trend[0].scores).toBeDefined();
    expect(trend[0].scores.career).toBeGreaterThanOrEqual(1);
    expect(trend[0].scores.career).toBeLessThanOrEqual(5);
  });
});