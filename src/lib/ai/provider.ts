import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

const DEFAULT_MODELS: Record<string, string> = {
  anthropic: "claude-sonnet-4-5",
  openai: "gpt-4o",
  google: "gemini-2.5-flash",
};

export function getProviderInfo() {
  const provider = process.env.AI_PROVIDER?.toLowerCase() || "anthropic";
  const model = process.env.AI_MODEL || DEFAULT_MODELS[provider] || "";
  return { provider, model };
}

export function getModel(): LanguageModel {
  const { provider, model } = getProviderInfo();
  switch (provider) {
    case "anthropic":
      return anthropic(model);
    case "openai":
      return openai(model);
    case "google":
      return google(model);
    default:
      throw new Error(`Unknown AI_PROVIDER "${provider}" — use anthropic, openai, or google`);
  }
}
