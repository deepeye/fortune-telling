const { isFreeMode } = require("../index");

describe("isFreeMode", () => {
  test("returns true when FREE_MODE is enabled — all content accessible without payment", () => {
    expect(isFreeMode()).toBe(true);
  });
});