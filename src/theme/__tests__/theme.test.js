const { getThemeConfig } = require("../index");

describe("getThemeConfig", () => {
  test("returns 新中式 theme with all required style sections", () => {
    const theme = getThemeConfig();

    expect(theme.colors).toBeDefined();
    expect(theme.fonts).toBeDefined();
    expect(theme.animation).toBeDefined();
  });

  test("colors match 新中式 palette — light background, ink accent, dark text", () => {
    const { colors } = getThemeConfig();

    expect(colors.background).toBe("#f5f0e8");
    expect(colors.card).toBe("#faf7f0");
    expect(colors.primary).toBe("#8b7355");
    expect(colors.text).toBe("#2c2c2c");
    expect(colors.muted).toBe("#999");
  });

  test("fonts specify Song/Source Han Serif for 新中式 typography", () => {
    const { fonts } = getThemeConfig();

    expect(fonts.heading).toContain("Source Han Serif");
    expect(fonts.heading).toContain("宋体");
    expect(fonts.body).toContain("Source Han Serif");
  });

  test("animation config defines durations for fortune page transitions", () => {
    const { animation } = getThemeConfig();

    expect(animation.fadeIn.duration).toBeGreaterThan(0);
    expect(animation.slideUp.duration).toBeGreaterThan(0);
  });
});