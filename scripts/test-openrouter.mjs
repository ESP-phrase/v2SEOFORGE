// Smoke test: confirms our createLLMClient() actually hits OpenRouter.
// Run: node scripts/test-openrouter.mjs
import { createLLMClient, resolveModel } from "../src/lib/llmClient.ts";

const client = createLLMClient();
const model = resolveModel("claude-haiku-4-5-20251001");
console.log(`Using model: ${model}`);

const resp = await client.messages.create({
  model,
  max_tokens: 60,
  messages: [{ role: "user", content: "Reply with exactly: OPENROUTER_OK" }],
});

const text = resp.content.find((b) => b.type === "text");
console.log("Response:", text?.text);
console.log("Usage:", resp.usage);
console.log(text?.text?.includes("OPENROUTER_OK") ? "✓ PASS" : "✗ FAIL");
