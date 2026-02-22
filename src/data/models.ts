export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  inputPricePerM: number; // Price per 1 Million tokens
  outputPricePerM: number; // Price per 1 Million tokens
  avgSpeedTokensPerSec: number; // Estimated generation speed
  contextWindow: number;
  codingScore: number; // Estimated coding capability score (0-100)
  color: string;
}

export const DEFAULT_MODELS: LLMModel[] = [
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    inputPricePerM: 3.00,
    outputPricePerM: 15.00,
    avgSpeedTokensPerSec: 60,
    contextWindow: 200000,
    codingScore: 98,
    color: "#D97757",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o (Codex)",
    provider: "OpenAI",
    inputPricePerM: 2.50,
    outputPricePerM: 10.00,
    avgSpeedTokensPerSec: 70,
    contextWindow: 128000,
    codingScore: 95,
    color: "#10A37F",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    inputPricePerM: 3.50,
    outputPricePerM: 10.50,
    avgSpeedTokensPerSec: 80,
    contextWindow: 2000000,
    codingScore: 94,
    color: "#4285F4",
  },
  {
    id: "glm-4",
    name: "GLM-4",
    provider: "Zhipu AI",
    inputPricePerM: 14.00, // Approx converted/estimated
    outputPricePerM: 14.00,
    avgSpeedTokensPerSec: 50,
    contextWindow: 128000,
    codingScore: 88,
    color: "#8E44AD",
  },
  {
    id: "minimax-abab6",
    name: "MiniMax abab6.5",
    provider: "MiniMax",
    inputPricePerM: 1.00, // Estimated competitive pricing
    outputPricePerM: 2.00,
    avgSpeedTokensPerSec: 65,
    contextWindow: 245000,
    codingScore: 85,
    color: "#E67E22",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    inputPricePerM: 0.075,
    outputPricePerM: 0.30,
    avgSpeedTokensPerSec: 150,
    contextWindow: 1000000,
    codingScore: 82,
    color: "#34A853",
  },
];

export interface TaskScenario {
  id: string;
  name: string;
  description: string;
  avgInputTokens: number;
  avgOutputTokens: number;
  iterations: number;
}

export const SCENARIOS: TaskScenario[] = [
  {
    id: "simple-script",
    name: "简单脚本",
    description: "编写一个解析 CSV 的 Python 脚本",
    avgInputTokens: 500,
    avgOutputTokens: 200,
    iterations: 2,
  },
  {
    id: "feature-impl",
    name: "功能实现",
    description: "添加一个新的 API 端点，包含验证和测试",
    avgInputTokens: 3000,
    avgOutputTokens: 800,
    iterations: 5,
  },
  {
    id: "refactor",
    name: "代码重构",
    description: "重构遗留模块（高上下文需求）",
    avgInputTokens: 15000,
    avgOutputTokens: 2000,
    iterations: 3,
  },
  {
    id: "full-app",
    name: "全应用原型",
    description: "使用 React 和 Express 构建待办事项应用",
    avgInputTokens: 8000,
    avgOutputTokens: 5000,
    iterations: 10,
  },
];
