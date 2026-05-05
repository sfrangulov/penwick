import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { parseArgs } from "./cli.js";

describe("parseArgs", () => {
  it("parses subcommand", () => {
    const a = parseArgs(["narrate"]);
    assert.equal(a.subcommand, "narrate");
    assert.equal(a.help, false);
  });

  it("parses --help", () => {
    const a = parseArgs(["--help"]);
    assert.equal(a.help, true);
  });

  it("parses --model with separate arg", () => {
    const a = parseArgs(["eulogize", "--model", "openai/gpt-5.4-mini"]);
    assert.equal(a.subcommand, "eulogize");
    assert.equal(a.model, "openai/gpt-5.4-mini");
  });

  it("parses --model=value", () => {
    const a = parseArgs(["judge", "--model=anthropic/claude-haiku-4-5"]);
    assert.equal(a.subcommand, "judge");
    assert.equal(a.model, "anthropic/claude-haiku-4-5");
  });

  it("parses --version", () => {
    const a = parseArgs(["--version"]);
    assert.equal(a.version, true);
  });

  it("subcommand wins only on first non-flag arg", () => {
    const a = parseArgs(["--model", "openai/gpt-5.4-mini", "narrate"]);
    assert.equal(a.subcommand, "narrate");
    assert.equal(a.model, "openai/gpt-5.4-mini");
  });
});
