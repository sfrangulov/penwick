import { resolveModel, streamToStdout } from "./llm.js";
import { JUDGE_INSTRUCTIONS, PERSONA_CORE } from "./persona.js";

export async function judge(stdin: string, opts: { model?: string }): Promise<void> {
  const { model } = resolveModel(opts.model);
  await streamToStdout({
    model,
    system: `${PERSONA_CORE}\n\n${JUDGE_INSTRUCTIONS}`,
    prompt: stdin,
  });
}
