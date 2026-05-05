import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { streamText, type LanguageModel } from "ai";

export type ProviderId = "anthropic" | "openai";

const DEFAULT_MODELS: Record<ProviderId, string> = {
  anthropic: "claude-haiku-4-5",
  openai: "gpt-5.4-mini",
};

export type ResolvedModel = {
  provider: ProviderId;
  modelId: string;
  model: LanguageModel;
};

export function resolveModel(override?: string): ResolvedModel {
  if (override) {
    const slash = override.indexOf("/");
    if (slash > 0) {
      const prefix = override.slice(0, slash);
      const id = override.slice(slash + 1);
      if (prefix === "anthropic") return { provider: "anthropic", modelId: id, model: anthropic(id) };
      if (prefix === "openai") return { provider: "openai", modelId: id, model: openai(id) };
      throw new Error(`Unknown provider prefix: ${prefix}. Use "anthropic/<id>" or "openai/<id>".`);
    }
    if (process.env.ANTHROPIC_API_KEY) return { provider: "anthropic", modelId: override, model: anthropic(override) };
    if (process.env.OPENAI_API_KEY) return { provider: "openai", modelId: override, model: openai(override) };
    throw new Error("No API key found. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.");
  }

  if (process.env.ANTHROPIC_API_KEY) {
    const id = DEFAULT_MODELS.anthropic;
    return { provider: "anthropic", modelId: id, model: anthropic(id) };
  }
  if (process.env.OPENAI_API_KEY) {
    const id = DEFAULT_MODELS.openai;
    return { provider: "openai", modelId: id, model: openai(id) };
  }
  throw new Error(
    "No API key found. Set ANTHROPIC_API_KEY or OPENAI_API_KEY before invoking penwick.",
  );
}

export async function streamToStdout(opts: {
  model: LanguageModel;
  system: string;
  prompt: string;
}): Promise<void> {
  const result = streamText({
    model: opts.model,
    system: opts.system,
    prompt: opts.prompt,
    onError({ error }) {
      process.stderr.write(`\n[penwick] streaming error: ${stringifyError(error)}\n`);
    },
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
  process.stdout.write("\n");
}

function stringifyError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
