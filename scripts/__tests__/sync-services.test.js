const { getSyncMappings } = require("../sync-services");

describe("getSyncMappings", () => {
  test("returns all src-to-cloudfunction mappings for duplicated services", () => {
    const mappings = getSyncMappings();

    expect(mappings.length).toBe(4);

    // order-service: src → createOrder
    expect(mappings).toContainEqual({
      src: expect.stringContaining("src/order-service/index.js"),
      dest: expect.stringContaining("cloudfunctions/createOrder/order-service/index.js"),
    });

    // push-service: src → sendDailyPush + subscribePush
    expect(mappings).toContainEqual({
      src: expect.stringContaining("src/push-service/index.js"),
      dest: expect.stringContaining("cloudfunctions/sendDailyPush/push-service/index.js"),
    });

    expect(mappings).toContainEqual({
      src: expect.stringContaining("src/push-service/index.js"),
      dest: expect.stringContaining("cloudfunctions/subscribePush/push-service/index.js"),
    });

    // settings-service: src → deleteUserData
    expect(mappings).toContainEqual({
      src: expect.stringContaining("src/settings-service/index.js"),
      dest: expect.stringContaining("cloudfunctions/deleteUserData/settings-service/index.js"),
    });
  });

  test("every mapping src file actually exists", () => {
    const fs = require("fs");
    const mappings = getSyncMappings();

    mappings.forEach(({ src }) => {
      expect(fs.existsSync(src)).toBe(true);
    });
  });
});