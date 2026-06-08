const { prepareOrderRecord, isContentUnlocked, markOrderPaid } = require("../index");

describe("prepareOrderRecord", () => {
  test("creates bazi_report order record with correct fields", () => {
    const record = prepareOrderRecord({
      openid: "test-openid-123",
      reportType: "bazi_report",
    });

    expect(record.openid).toBe("test-openid-123");
    expect(record.report_type).toBe("bazi_report");
    expect(record.amount).toBe(9.9);
    expect(record.payment_status).toBe("pending");
    expect(record.created_at).toBeDefined();
  });

  test("creates annual_update order record with lower amount", () => {
    const record = prepareOrderRecord({
      openid: "test-openid-456",
      reportType: "annual_update",
    });

    expect(record.report_type).toBe("annual_update");
    expect(record.amount).toBe(4.9);
  });
});

describe("isContentUnlocked", () => {
  test("unlocks bazi_report content when paid order exists", () => {
    const orders = [
      { report_type: "bazi_report", payment_status: "paid" },
    ];

    expect(isContentUnlocked(orders, "bazi_report")).toBe(true);
  });

  test("does not unlock when order is pending", () => {
    const orders = [
      { report_type: "bazi_report", payment_status: "pending" },
    ];

    expect(isContentUnlocked(orders, "bazi_report")).toBe(false);
  });

  test("does not unlock when no order exists", () => {
    expect(isContentUnlocked([], "bazi_report")).toBe(false);
  });

  test("unlocks annual_update independently from bazi_report", () => {
    const orders = [
      { report_type: "bazi_report", payment_status: "paid" },
    ];

    expect(isContentUnlocked(orders, "annual_update")).toBe(false);
  });
});

describe("markOrderPaid", () => {
  test("updates order record to paid status with transaction id", () => {
    const order = prepareOrderRecord({
      openid: "test-openid-123",
      reportType: "bazi_report",
    });

    const paid = markOrderPaid(order, "wx-txn-abc123");

    expect(paid.payment_status).toBe("paid");
    expect(paid.wechat_transaction_id).toBe("wx-txn-abc123");
  });
});