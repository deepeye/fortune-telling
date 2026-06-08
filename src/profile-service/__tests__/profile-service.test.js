const { prepareUserRecord, prepareBaziProfileRecord } = require("../index");

describe("prepareUserRecord", () => {
  test("creates user record from birth input", () => {
    const input = {
      birthDate: "1990-01-15",
      birthHour: 6,
      calendarType: "solar",
    };

    const record = prepareUserRecord(input);

    expect(record.birth_date).toBe("1990-01-15");
    expect(record.birth_hour).toBe(6);
    expect(record.birth_calendar_type).toBe("solar");
    expect(record.created_at).toBeDefined();
  });

  test("records uncertain birth hour as -1", () => {
    const input = {
      birthDate: "1990-01-15",
      birthHour: -1,
      calendarType: "solar",
    };

    const record = prepareUserRecord(input);

    expect(record.birth_hour).toBe(-1);
  });
});

describe("prepareBaziProfileRecord", () => {
  test("creates bazi_profile record from computed profile", () => {
    const input = {
      birthDate: "1990-01-15",
      birthHour: 6,
      calendarType: "solar",
    };

    const computedProfile = {
      yearPillar: { stem: "己", branch: "巳" },
      monthPillar: { stem: "丁", branch: "丑" },
      dayPillar: { stem: "庚", branch: "辰" },
      hourPillar: { stem: "壬", branch: "午" },
      dayMaster: "金",
      fiveElementsDistribution: { 木: 0, 火: 3, 土: 3, 金: 1, 水: 1 },
      isHourEstimated: false,
    };

    const record = prepareBaziProfileRecord(input, computedProfile);

    expect(record.year_pillar).toBe("己巳");
    expect(record.month_pillar).toBe("丁丑");
    expect(record.day_pillar).toBe("庚辰");
    expect(record.hour_pillar).toBe("壬午");
    expect(record.day_master).toBe("金");
    expect(record.five_elements_distribution).toEqual({ 木: 0, 火: 3, 土: 3, 金: 1, 水: 1 });
    expect(record.is_hour_estimated).toBe(false);
    expect(record.calculated_at).toBeDefined();
  });

  test("flags estimated when birth hour is uncertain", () => {
    const input = {
      birthDate: "1990-01-15",
      birthHour: -1,
      calendarType: "solar",
    };

    const computedProfile = {
      yearPillar: { stem: "己", branch: "巳" },
      monthPillar: { stem: "丁", branch: "丑" },
      dayPillar: { stem: "庚", branch: "辰" },
      hourPillar: { stem: "丙", branch: "子" },
      dayMaster: "金",
      fiveElementsDistribution: { 木: 0, 火: 2, 土: 3, 金: 1, 水: 2 },
      isHourEstimated: true,
    };

    const record = prepareBaziProfileRecord(input, computedProfile);

    expect(record.is_hour_estimated).toBe(true);
  });
});