const { parseQwenResponse, buildQwenRequestBody } = require("../index");
const { computeBaZiProfile, computeDailyFortune } = require("../../bazi-engine/index");
const { formatPrompt } = require("../../qwen-prompts/index");

describe("buildQwenRequestBody", () => {
  test("constructs OpenAI-compatible request body with single prompt", () => {
    const profile = computeBaZiProfile({
      birthDate: "1990-01-15",
      birthHour: 6,
      calendarType: "solar",
    });
    const fortune = computeDailyFortune(profile, "2025-06-01");
    const prompt = formatPrompt("career", profile, fortune);

    const body = buildQwenRequestBody(prompt);

    expect(body.model).toBe("qwen-plus");
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].role).toBe("user");
    expect(body.messages[0].content).toContain("日主五行：金");
    expect(body.temperature).toBe(0.7);
    expect(body.max_tokens).toBe(512);
    expect(body.stream).toBe(false);
  });
});

describe("parseQwenResponse", () => {
  test("extracts text from OpenAI-compatible response format", () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: "日主为金，事业方面具有果断决策的特点。五行中火土偏旺，事业竞争中需注意稳中求进。",
          },
        },
      ],
    };

    const parsed = parseQwenResponse(mockResponse);

    expect(parsed.text).toBeDefined();
    expect(parsed.text.length).toBeGreaterThan(0);
  });

  test("returns fallback when response is empty", () => {
    const parsed = parseQwenResponse({ choices: [{ message: { content: "" } }] });

    expect(parsed.text).toBe("解读内容暂时无法生成，请稍后重试。");
  });
});