import { anthropic } from "@ai-sdk/anthropic";
import { deepseek } from "@ai-sdk/deepseek";
import { openai } from "@ai-sdk/openai";
import { streamText, type LanguageModel } from "ai";

export type ProviderId = "anthropic" | "openai" | "deepseek";

const DEFAULT_MODELS: Record<ProviderId, string> = {
  anthropic: "claude-haiku-4-5",
  openai: "gpt-5.4-mini",
  deepseek: "deepseek-chat",
};

const PROVIDERS: Record<ProviderId, (id: string) => LanguageModel> = {
  anthropic,
  openai,
  deepseek,
};

const ENV_VAR: Record<ProviderId, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
};

const PRIORITY: ProviderId[] = ["anthropic", "openai", "deepseek"];

export type ResolvedModel = {
  provider: ProviderId;
  modelId: string;
  model: LanguageModel;
};

function isProviderId(s: string): s is ProviderId {
  return s === "anthropic" || s === "openai" || s === "deepseek";
}

function detectProvider(): ProviderId | null {
  for (const p of PRIORITY) {
    if (process.env[ENV_VAR[p]]) return p;
  }
  return null;
}

function noKeyError(): Error {
  return new Error(
    `No API key found. Set one of: ${PRIORITY.map((p) => ENV_VAR[p]).join(", ")}.`,
  );
}

export function resolveModel(override?: string): ResolvedModel {
  if (override) {
    const slash = override.indexOf("/");
    if (slash > 0) {
      const prefix = override.slice(0, slash);
      const id = override.slice(slash + 1);
      if (!isProviderId(prefix)) {
        throw new Error(
          `Unknown provider prefix: ${prefix}. Use one of: ${PRIORITY.join(", ")}.`,
        );
      }
      return { provider: prefix, modelId: id, model: PROVIDERS[prefix](id) };
    }
    const detected = detectProvider();
    if (!detected) throw noKeyError();
    return { provider: detected, modelId: override, model: PROVIDERS[detected](override) };
  }

  const detected = detectProvider();
  if (!detected) throw noKeyError();
  const id = DEFAULT_MODELS[detected];
  return { provider: detected, modelId: id, model: PROVIDERS[detected](id) };
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
