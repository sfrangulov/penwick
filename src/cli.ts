#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { eulogize } from "./eulogize.js";
import { judge } from "./judge.js";
import { narrate } from "./narrate.js";

const HELP = `penwick — a pipe utility narrated by the late Mortimer J. Penwick (1939–1987).

Usage:
  <command-with-output> | penwick <subcommand> [--model <id>]

Subcommands:
  narrate     Brief observations on what passes through the pipe.
  eulogize    An obituary for what has died — deprecated, unused, deleted.
  judge       A judgment, less ceremonial than an obituary.

Options:
  --model <id>     Override the model. Format: "<provider>/<id>"
                   where provider is anthropic, openai, or deepseek.
  -h, --help       Show this message.
  -v, --version    Show version.

Environment (provider auto-detection, in priority order):
  ANTHROPIC_API_KEY   default model: claude-haiku-4-5
  OPENAI_API_KEY      default model: gpt-5.4-mini
  DEEPSEEK_API_KEY    default model: deepseek-chat

Examples:
  git log --oneline -20 | penwick narrate
  npm outdated | penwick eulogize
  npx skill-graveyard audit --json | penwick eulogize
`;

type Args = { subcommand: string | null; model?: string; help: boolean; version: boolean };

export function parseArgs(argv: string[]): Args {
  const out: Args = { subcommand: null, help: false, version: false };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i]!;
    if (arg === "-h" || arg === "--help") {
      out.help = true;
    } else if (arg === "-v" || arg === "--version") {
      out.version = true;
    } else if (arg === "--model") {
      out.model = argv[++i];
    } else if (arg.startsWith("--model=")) {
      out.model = arg.slice("--model=".length);
    } else if (!out.subcommand && !arg.startsWith("-")) {
      out.subcommand = arg;
    }
    i++;
  }
  return out;
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

async function readVersion(): Promise<string> {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, join } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  const pkgPath = join(here, "..", "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8")) as { version: string };
  return pkg.version;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || (!args.subcommand && !args.version)) {
    process.stdout.write(HELP);
    return;
  }
  if (args.version) {
    process.stdout.write(`${await readVersion()}\n`);
    return;
  }

  const stdin = await readStdin();
  if (!stdin.trim()) {
    process.stderr.write("penwick: no input on stdin. Pipe something through me, sir.\n");
    process.exit(2);
  }

  switch (args.subcommand) {
    case "narrate":
      await narrate(stdin, { model: args.model });
      return;
    case "eulogize":
      await eulogize(stdin, { model: args.model });
      return;
    case "judge":
      await judge(stdin, { model: args.model });
      return;
    default:
      process.stderr.write(`penwick: unknown subcommand "${args.subcommand}".\n\n${HELP}`);
      process.exit(2);
  }
}

function isEntrypoint(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isEntrypoint()) {
  main().catch((err) => {
    process.stderr.write(`penwick: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  });
}
