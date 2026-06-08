const { getDeletionCollections, validateBirthDateUpdate, getPrivacyPolicyContent } = require("../index");

describe("getDeletionCollections", () => {
  test("returns all collections that contain user data", () => {
    const collections = getDeletionCollections();

    expect(collections).toContain("users");
    expect(collections).toContain("bazi_profiles");
    expect(collections).toContain("orders");
    expect(collections).toContain("subscriptions");
    expect(collections).toContain("ai_content");
    expect(collections.length).toBe(5);
  });
});

describe("validateBirthDateUpdate", () => {
  test("returns valid for a proper solar date update", () => {
    const result = validateBirthDateUpdate({
      birthDate: "1985-06-20",
      birthHour: 5,
      calendarType: "solar",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("returns invalid when birth date is missing", () => {
    const result = validateBirthDateUpdate({
      birthHour: 5,
      calendarType: "solar",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("returns valid when birth hour is uncertain (-1)", () => {
    const result = validateBirthDateUpdate({
      birthDate: "1985-06-20",
      birthHour: -1,
      calendarType: "solar",
    });

    expect(result.valid).toBe(true);
  });

  test("returns invalid when birth hour is out of range", () => {
    const result = validateBirthDateUpdate({
      birthDate: "1985-06-20",
      birthHour: 12,
      calendarType: "solar",
    });

    expect(result.valid).toBe(false);
  });
});

describe("getPrivacyPolicyContent", () => {
  test("returns structured privacy policy with all required sections", () => {
    const policy = getPrivacyPolicyContent();

    expect(policy.sections).toBeDefined();
    expect(policy.sections.length).toBeGreaterThanOrEqual(3);
  });

  test("includes data collection section listing openid and birth date", () => {
    const policy = getPrivacyPolicyContent();

    const collectionSection = policy.sections.find(s => s.title.includes("收集"));
    expect(collectionSection).toBeDefined();
    expect(collectionSection.content).toContain("openid");
    expect(collectionSection.content).toContain("出生日期");
  });

  test("includes data deletion statement", () => {
    const policy = getPrivacyPolicyContent();

    const deletionSection = policy.sections.find(s => s.title.includes("删除") || s.title.includes("清除"));
    expect(deletionSection).toBeDefined();
  });
});