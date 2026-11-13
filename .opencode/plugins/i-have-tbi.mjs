// Adapted from ayghri/i-have-adhd (https://github.com/ayghri/i-have-adhd), MIT License,
// Copyright (c) 2026 Ayoub Ghriss. See LICENSE.
// OpenCode V1 (1.18.29+) uses server(); V2 uses setup().
// Both register the canonical skill, slash command, and opt-in always-on hook.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, '../../skills');
const skillPath = path.join(skillsDir, 'i-have-tbi', 'SKILL.md');
const commandPath = path.join(__dirname, '..', 'command', 'i-have-tbi.md');

const SKILL_ID = 'i-have-tbi';
const FALLBACK_DESCRIPTION =
  "Shape output for a reader living with the cognitive effects of a brain injury: the assistant carries the load for memory, attention, executive function, processing speed, fatigue and social cues, one function at a time.";

// Command frontmatter is JSON so both loaders can share metadata without a YAML parser.
async function commandDefinition() {
  const raw = await fs.promises.readFile(commandPath, 'utf8');
  const match = raw.match(/^---[^\S\r\n]*\r?\n([\s\S]*?)\r?\n---[^\S\r\n]*(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error('Missing command frontmatter');
  return { ...JSON.parse(match[1]), template: match[2].trim() };
}

const flagPath = path.join(
  process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'),
  'opencode',
  '.i-have-tbi-always',
);

// Match the shared hooks' frontmatter stripping and newline handling.
function rulesetBody() {
  return fs
    .readFileSync(skillPath, 'utf8')
    .replace(/^---[^\S\r\n]*\r?\n[\s\S]*?\r?\n---[^\S\r\n]*(?:\r?\n|$)/, '')
    .replace(/(?:\r?\n)+$/, '');
}

function alwaysOnInjection() {
  try {
    if (!fs.existsSync(flagPath)) return null;
    const header =
      'TBI MODE ACTIVE (always-on). The ruleset below applies to every ' +
      'response. "stop tbi mode" or "normal mode" turns it off for this ' +
      'session; delete ' + flagPath + ' to turn always-on off for good.';
    return header + '\n\n' + rulesetBody();
  } catch {
    return null;
  }
}

export default {
  id: SKILL_ID,

  async setup(ctx) {
    try {
      const content = rulesetBody();
      await ctx.skill.transform((editor) => {
        if (editor.get(SKILL_ID)) return;
        editor.add({
          id: SKILL_ID,
          name: SKILL_ID,
          description: FALLBACK_DESCRIPTION,
          path: skillPath,
          content,
        });
      });
    } catch {
      // Keep the command available if skill registration fails.
    }

    try {
      const command = await commandDefinition();
      await ctx.command.transform((editor) => {
        editor.add({
          name: SKILL_ID,
          description: command.description || FALLBACK_DESCRIPTION,
          execute: ({ sessionID, prompt, delivery }) =>
            ctx.session.prompt({
              ...prompt,
              sessionID,
              text: prompt.text ? `${command.template}\n\n${prompt.text}` : command.template,
              delivery,
            }),
        });
      });
    } catch {
      // Keep skill discovery available if command registration fails.
    }

    try {
      await ctx.session.hook('context', (event) => {
        const injected = alwaysOnInjection();
        if (!injected) return;
        event.system.push({ type: 'text', text: injected });
      });
    } catch {
      // Optional hook failures must not block plugin loading.
    }
  },

  async server() {
    return {
      config: async (config) => {
        config.skills = config.skills || {};
        config.skills.paths = config.skills.paths || [];
        if (!config.skills.paths.includes(skillsDir)) config.skills.paths.push(skillsDir);

        // Preserve a native or user-defined command with the same name.
        try {
          config.command = config.command || {};
          if (!config.command[SKILL_ID]) {
            config.command[SKILL_ID] = await commandDefinition();
          }
        } catch {
          // Keep skill discovery available if command registration fails.
        }
      },

      'experimental.chat.system.transform': async (_input, output) => {
        const injected = alwaysOnInjection();
        if (!injected) return;

        if (output.system.length > 0) {
          output.system[output.system.length - 1] += '\n\n' + injected;
        } else {
          output.system.push(injected);
        }
      },
    };
  },
};
