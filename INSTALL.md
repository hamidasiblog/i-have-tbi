# How to install

i-have-tbi uses the same layout and mechanisms as [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd). Only Claude Code is written out in full here. For the other runtimes the entry points are listed below; follow that project's `INSTALL.md` for the runtime and replace `i-have-adhd` with `i-have-tbi` and `ayghri` with `hamidasiblog`.

This is output shaping, not medical advice. See the disclaimer in [README.md](README.md).

## Claude Code

### Install

```bash
claude plugin marketplace add hamidasiblog/i-have-tbi
claude plugin install i-have-tbi@i-have-tbi
```

Restart Claude Code.

### Turn on and off

```text
/i-have-tbi          turn on for this session
stop tbi mode       turn off for this session ("normal mode" also works)
TBIモード終了        same, in Japanese ("TBIモードオフ" and "通常モード" also work)
```

### Always-on (optional)

A `SessionStart` hook loads the full ruleset at the start of every session, with no `/i-have-tbi` needed:

```bash
touch ~/.claude/.i-have-tbi-always
```

If you use a custom Claude configuration directory, create the flag there instead:

```bash
touch "$CLAUDE_CONFIG_DIR/.i-have-tbi-always"
```

Back to on-demand:

```bash
rm ~/.claude/.i-have-tbi-always
```

The hook only fires when the flag file exists, so installing the plugin changes nothing by itself. "stop tbi mode" still turns it off for the current session.

### Uninstall

```bash
claude plugin uninstall i-have-tbi
claude plugin marketplace remove i-have-tbi
```

## Other runtimes

| Runtime | Entry point in this repository |
| --- | --- |
| Codex | `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, `hooks/hooks.json` |
| Cursor | `.cursor/skills/i-have-tbi/SKILL.md` |
| OpenCode | `.opencode/plugins/i-have-tbi.mjs`, `.opencode/command/i-have-tbi.md` (flag file: `~/.config/opencode/.i-have-tbi-always`) |
| Gemini CLI | `gemini-extension.json`, `GEMINI.md` |
| Kimi Code CLI | `kimi.plugin.json` |
| Qwen Code | `qwen-extension.json` |
| Pi / OMP | `package.json`, `extensions/i-have-tbi.ts` (`/i-have-tbi [on|off]`, `--tbi` flag) |

Only the hook scripts have been run in this repository's tests. The other entry points are adapted from i-have-adhd by renaming and have not been exercised in each runtime.
