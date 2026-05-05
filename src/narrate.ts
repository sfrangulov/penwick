import { resolveModel, streamToStdout } from "./llm.js";
import { NARRATE_INSTRUCTIONS, PERSONA_CORE } from "./persona.js";

export async function narrate(stdin: string, opts: { model?: string }): Promise<void> {
  const { model } = resolveModel(opts.model);
  await streamToStdout({
    model,
    system: `${PERSONA_CORE}\n\n${NARRATE_INSTRUCTIONS}`,
    prompt: stdin,
  });
}
