# penwick

```
   ┌──────────────────────────────────────────────┐
   │                                              │
   │        IBM PERSONNEL RECORD · 04781          │
   │        · · · · · · · · · · · · · · · ·       │
   │                                              │
   │   NAME      Mortimer J. Penwick              │
   │   DEPT      Systems Programming              │
   │   LOC       Poughkeepsie, New York           │
   │   TENURE    1959 — 1987                      │
   │   STATUS    Deceased                         │
   │                                              │
   │   ──────────────────────────────────────     │
   │                                              │
   │   "Define real, sir."                        │
   │                                              │
   └──────────────────────────────────────────────┘
```

A pipe utility narrated by the late **Mortimer J. Penwick** (1939–1987), senior systems programmer at IBM, Poughkeepsie. He retired with arthritis, died of a heart attack the following winter, and now lives in a UNIX pipe. He watches what passes through. He comments on it.

```
$ git log --oneline -20 | penwick narrate

 The gentleman has been busy this week, sir. A flurry of fixes
 to the navigation header — three in two days. I would call this
 indecision, but I have seen worse in COBOL.

 ...
```

## Install

```sh
npm install -g penwick
```

Set one of (priority order):

- `ANTHROPIC_API_KEY` — defaults to `claude-haiku-4-5`
- `OPENAI_API_KEY` — defaults to `gpt-5.4-mini`
- `DEEPSEEK_API_KEY` — defaults to `deepseek-chat`

## Use

```sh
<command-with-output> | penwick <subcommand>
```

### Subcommands

| Command    | What it does                                               |
| ---------- | ---------------------------------------------------------- |
| `narrate`  | Brief observations on what passes through the pipe.        |
| `eulogize` | An obituary, with ASCII border, for what has died.         |
| `judge`    | A judgment. Less ceremonial than an obituary.              |

### Examples

```sh
git log --oneline -20 | penwick narrate
npm outdated | penwick eulogize
npx skill-graveyard audit --json | penwick eulogize
lighthouse https://example.com --output=json | penwick judge
```

### Override model

```sh
some-cmd | penwick narrate --model openai/gpt-5.4-mini
some-cmd | penwick eulogize --model anthropic/claude-sonnet-4-5
some-cmd | penwick judge --model deepseek/deepseek-chat
```

Format: `<provider>/<model-id>` where provider is `anthropic`, `openai`, or `deepseek`.

## License

MIT. See [LICENSE](./LICENSE).

> _Define real, sir._  
> — M.J.P.
