// Adapted from ayghri/i-have-adhd (https://github.com/ayghri/i-have-adhd), MIT License,
// Copyright (c) 2026 Ayoub Ghriss. See LICENSE.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getAgentDir,
  type ExtensionAPI,
  type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import {
  contextMessages,
  latestMarkerIsActive,
} from "./context-compat";

const EXTENSION_DIR = dirname(fileURLToPath(import.meta.url));
const SKILL_PATH = join(
  EXTENSION_DIR,
  "..",
  "skills",
  "i-have-tbi",
  "SKILL.md",
);
const STATE_ENTRY_TYPE = "i-have-tbi-state";
const RULES_MESSAGE_TYPE = "i-have-tbi-rules";
const DISABLED_MESSAGE_TYPE = "i-have-tbi-disabled";
const STATUS_KEY = "i-have-tbi";
const DISABLE_CONFIRMATION = "TBI mode disabled.";
const STOP_PHRASES = new Set([
  "stop tbi mode",
  "normal mode",
  // Japanese. Stored without spaces; see normalizeInput.
  "tbiモード終了",
  "tbiモードオフ",
  "通常モード",
]);

// Voice input can add full-width letters, extra spaces or a trailing "。".
// NFKC folds full-width letters (ＴＢＩ -> TBI) before lowercasing.
function normalizeInput(text: string): string {
  return text
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s。．.！!]+$/u, "")
    .replace(/\s+/gu, " ");
}

function isStopPhrase(text: string): boolean {
  const input = normalizeInput(text);
  return STOP_PHRASES.has(input) || STOP_PHRASES.has(input.replace(/ /g, ""));
}

const RULES_HEADER =
  'TBI MODE ACTIVE. The ruleset below applies to every response until turned off. "stop tbi mode" or "normal mode" turns it off for this session.';
const DISABLED_NOTICE =
  "TBI MODE OFF. Ignore the i-have-tbi ruleset injected earlier in this conversation and return to your default response style.";

type TbiModeState = {
  enabled: boolean;
};

type TbiConfig = {
  alwaysOn?: boolean;
  hideStatus?: boolean;
};

function loadConfig(): TbiConfig {
  try {
    return JSON.parse(
      readFileSync(join(getAgentDir(), "i-have-tbi.json"), "utf8"),
    );
  } catch {
    return {};
  }
}

function stripFrontmatter(content: string): string {
  return content
    .replace(
      /^---[^\S\r\n]*\r?\n[\s\S]*?\r?\n---[^\S\r\n]*(?:\r?\n|$)/,
      "",
    )
    .trim();
}

function loadRules(): string {
  let content: string;

  try {
    content = readFileSync(SKILL_PATH, "utf8");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Unable to load i-have-tbi rules from ${SKILL_PATH}: ${reason}`,
    );
  }

  const rules = stripFrontmatter(content);
  if (!rules) {
    throw new Error(`The i-have-tbi rules file is empty: ${SKILL_PATH}`);
  }

  return rules;
}

function getSavedState(ctx: ExtensionContext): boolean | undefined {
  let savedState: boolean | undefined;

  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type !== "custom" || entry.customType !== STATE_ENTRY_TYPE) {
      continue;
    }

    const data = entry.data as Partial<TbiModeState> | undefined;
    if (typeof data?.enabled === "boolean") {
      savedState = data.enabled;
    }
  }

  return savedState;
}

/**
 * Whether the rules are still live in the context the model actually receives.
 *
 * Only the newest marker counts: a later "disabled" notice cancels an earlier
 * ruleset, and compaction drops summarized entries so the ruleset has to be
 * injected again.
 */
function rulesAreInContext(ctx: ExtensionContext): boolean {
  return latestMarkerIsActive(
    contextMessages(ctx.sessionManager),
    RULES_MESSAGE_TYPE,
    DISABLED_MESSAGE_TYPE,
  );
}

export default function iHaveTbiExtension(pi: ExtensionAPI) {
  const rules = loadRules();
  const alwaysOnFlag = join(getAgentDir(), ".i-have-tbi-always");
  const config = loadConfig();
  let enabled = false;

  const updateStatus = (ctx: ExtensionContext): void => {
    if (!enabled || config.hideStatus) {
      ctx.ui.setStatus(STATUS_KEY, undefined);
      return;
    }

    const dot = ctx.ui.theme.fg("success", "●");
    const label = ctx.ui.theme.fg("accent", "TBI ON");
    ctx.ui.setStatus(STATUS_KEY, `${dot} ${label}`);
  };

  /**
   * Keep the conversation in sync with the current mode, the way the Claude Code
   * SessionStart hook does: inject the ruleset once, never per request.
   */
  const syncContext = (ctx: ExtensionContext): void => {
    const injected = rulesAreInContext(ctx);

    if (enabled && !injected) {
      pi.sendMessage(
        {
          customType: RULES_MESSAGE_TYPE,
          content: `${RULES_HEADER}\n\n${rules}`,
          display: false,
        },
        { triggerTurn: false },
      );
      return;
    }

    if (!enabled && injected) {
      pi.sendMessage(
        {
          customType: DISABLED_MESSAGE_TYPE,
          content: DISABLED_NOTICE,
          display: false,
        },
        { triggerTurn: false },
      );
    }
  };

  const restoreState = (ctx: ExtensionContext): void => {
    const savedState = getSavedState(ctx);
    const enabledByDefault =
      pi.getFlag("tbi") === true ||
      config.alwaysOn === true ||
      existsSync(alwaysOnFlag);

    enabled = savedState ?? enabledByDefault;
    updateStatus(ctx);
    syncContext(ctx);
  };

  const setEnabled = (nextEnabled: boolean, ctx: ExtensionContext): void => {
    enabled = nextEnabled;
    pi.appendEntry(STATE_ENTRY_TYPE, { enabled } satisfies TbiModeState);
    updateStatus(ctx);
    syncContext(ctx);
    ctx.ui.notify(`TBI mode ${enabled ? "enabled" : "disabled"}`, "info");
  };

  pi.registerFlag("tbi", {
    description: "Start with i-have-tbi output shaping enabled",
    type: "boolean",
    default: false,
  });

  pi.registerCommand("i-have-tbi", {
    description: "Toggle i-have-tbi output shaping for this session",
    handler: async (args, ctx) => {
      const argument = args.trim().toLowerCase();

      if (argument === "") {
        setEnabled(!enabled, ctx);
        return;
      }

      if (argument === "on") {
        setEnabled(true, ctx);
        return;
      }

      if (argument === "off" || argument === "stop") {
        setEnabled(false, ctx);
        return;
      }

      ctx.ui.notify("Usage: /i-have-tbi [on|off]", "warning");
    },
  });

  pi.on("input", async (event, ctx) => {
    const input = event.text.trim().toLowerCase();

    // Keep the built-in skill command working as an alias without letting Pi
    // expand a second copy of the same rules into the conversation.
    if (input === "/skill:i-have-tbi") {
      setEnabled(true, ctx);
      return { action: "handled" };
    }

    if (enabled && isStopPhrase(event.text)) {
      setEnabled(false, ctx);

      if (ctx.hasUI) {
        return { action: "handled" };
      }

      return {
        action: "transform",
        text: `Reply with exactly: ${DISABLE_CONFIRMATION}`,
      };
    }

    return { action: "continue" };
  });

  pi.on("session_start", async (_event, ctx) => restoreState(ctx));
  pi.on("session_tree", async (_event, ctx) => restoreState(ctx));
  pi.on("session_compact", async (_event, ctx) => syncContext(ctx));
}
