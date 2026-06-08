const QWEN_MODEL = "qwen-plus";
const QWEN_API_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const FALLBACK_TEXT = "解读内容暂时无法生成，请稍后重试。";

function buildQwenRequestBody(prompt) {
  return {
    model: QWEN_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 512,
    stream: false,
  };
}

function parseQwenResponse(response) {
  const text = response.choices?.[0]?.message?.content || "";
  return {
    text: text.length > 0 ? text : FALLBACK_TEXT,
  };
}

module.exports = { buildQwenRequestBody, parseQwenResponse, QWEN_API_URL };