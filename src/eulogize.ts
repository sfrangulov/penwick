import { resolveModel, streamToStdout } from "./llm.js";
import { EULOGIZE_INSTRUCTIONS, PERSONA_CORE } from "./persona.js";

export async function eulogize(stdin: string, opts: { model?: string }): Promise<void> {
  const { model } = resolveModel(opts.model);
  const today = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  await streamToStdout({
    model,
    system: `${PERSONA_CORE}\n\n${EULOGIZE_INSTRUCTIONS}\n\nToday is ${today}.`,
    prompt: stdin,
  });
}
