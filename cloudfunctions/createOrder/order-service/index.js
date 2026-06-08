const REPORT_PRICES = {
  bazi_report: 9.9,
  annual_update: 4.9,
};

const REPORT_PRICES_FEN = {
  bazi_report: 990,
  annual_update: 490,
};

function prepareOrderRecord({ openid, reportType }) {
  return {
    openid,
    report_type: reportType,
    amount: REPORT_PRICES[reportType],
    amount_fen: REPORT_PRICES_FEN[reportType],
    payment_status: "pending",
    wechat_transaction_id: null,
    created_at: new Date().toISOString(),
  };
}

function isContentUnlocked(orders, reportType) {
  return orders.some(
    (o) => o.report_type === reportType && o.payment_status === "paid"
  );
}

function markOrderPaid(order, transactionId) {
  return {
    ...order,
    payment_status: "paid",
    wechat_transaction_id: transactionId,
  };
}

module.exports = { prepareOrderRecord, isContentUnlocked, markOrderPaid, REPORT_PRICES_FEN };