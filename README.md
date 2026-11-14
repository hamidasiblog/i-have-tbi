# i-have-tbi

**Output shaped for a reader living with the cognitive effects of a brain injury. The assistant carries the load, function by function.**

[日本語](.github/readme/README.ja.md)

> **Not medical advice.** This is an output-style skill for AI coding assistants. It is not a diagnosis, a treatment, rehabilitation, or a medical device, and it has not been clinically tested. It does not replace your doctor or rehabilitation team. The effects of brain injury differ from person to person; nothing here describes any individual.

## What it does

A skill for your coding assistant. When it is on, the assistant takes over specific pieces of cognitive work, so you can spend your energy on the decision itself.

The rules are organized by **function**, not by time since injury or by severity:

| Function | What the assistant carries |
| --- | --- |
| Memory | Acts as the notebook. Restates the state every reply. Never says "as mentioned earlier". Answers a repeated question in full. Leaves a carry-over note when work stops. |
| Attention: sustained | Short replies. Work split into parts with an end. |
| Attention: selective | The one thing that matters comes first. No side notes. |
| Attention: divided | One thing at a time. One instruction per step. One question per reply. |
| Attention: switching | Closes one item before opening another. Announces every switch in words. |
| Executive function | States the goal before the steps. Makes the plan and sets the order. Checks the work against the goal. Verifies results itself. |
| Processing speed | Short sentences, one idea each. Conclusion first. No rushing. |
| Fatigue | Stopping points built in. State saved at each, so stopping costs nothing. |
| Social and emotional cues | Literal wording, no sarcasm or idiom. Calm tone. No arguing, no pep talk. |
| Self-monitoring | Checks are built into the steps. Slips are stated without blame. |

Full text: [skills/i-have-tbi/SKILL.md](./skills/i-have-tbi/SKILL.md). It is one file, and it is the only place the rules live.

## On and off

There is no configuration. The skill is on or off.

- `/i-have-tbi` turns it on for the session.
- `stop tbi mode` (or `normal mode`) turns it off. Japanese also works: `TBIモード終了`, `TBIモードオフ` or `通常モード`.
- Always on: create the empty flag file `~/.claude/.i-have-tbi-always`. Delete the file to go back to on-demand.

See [INSTALL.md](INSTALL.md).

## Sources

The rules are design choices for how an assistant should write. They are informed by the sources below, but they are not taken from them as clinical recommendations, and none of the sources evaluated an AI assistant.

Only pages that were actually opened and read while writing this (2026-11-13) are listed.

### Japanese public guidance: 国立障害者リハビリテーションセンター 高次脳機能障害情報・支援センター

- 高次脳機能障害を理解する (definition, diagnostic criteria): https://www.rehab.go.jp/brain_fukyu/rikai
- 主要症状の解説: https://www.rehab.go.jp/brain_fukyu/rikai/shoujou
- 医学的リハビリテーションプログラム: https://www.rehab.go.jp/brain_fukyu/how04/medlegal
- 訓練を行う: https://www.rehab.go.jp/brain_fukyu/how04/rehab/training
- よくあるご質問: https://www.rehab.go.jp/brain_fukyu/qa

What these pages say, and what the skill does with it:

| Skill section | What the pages say | 
| --- | --- |
| Scope | Traumatic brain injury is named as one cause of 高次脳機能障害. The main symptoms are given as four: memory, attention, executive function, and social behaviour. |
| Memory | New events are not retained; the same question is asked repeatedly. External aids, environmental adjustment and errorless learning are listed as approaches; memos and a fixed place for often-used things are recommended. |
| Attention | Described: difficulty concentrating and being drawn to other stimuli; difficulty sustaining attention; confusion when doing two things at once. Advice: narrow to one task, do not do two things at once, use short tasks and rest. |
| Executive function | Action starts before a goal is set; self-monitoring of one's own action is impaired; activity can continue when instructions are given step by step. Approaches listed: break the process down and make it routine, use a manual, give feedback on results. |
| Fatigue | Easy fatigability appears as an item to check, and "an environment that does not tire" as an adjustment. It is not described as a separate symptom on the pages read. |
| Processing speed | Mentioned only briefly (things can still be done, but slower). |
| Social and emotional cues | Listed under social behaviour: reduced initiative, difficulty controlling emotion, literal thinking and difficulty with sarcasm or abstract references, persistence on one way of doing things. Advice: confronting anger head-on can make it worse; urging does not help low initiative, show concretely what to do. |
| Self-monitoring | The person is often not aware of the difficulty. |

Two honest gaps:

- The four-way split of attention (sustained, selective, divided, switching) is the organizing frame of this skill. The pages read describe sustained attention, distractibility and dual-task confusion in text. Difficulty switching is described there under executive function and persistence, not under attention.
- The processing-speed and fatigue rules rest on brief mentions. They are design choices more than sourced claims.

### Research papers (abstracts only)

Only the abstracts were read. The full texts were not accessible, so nothing here relies on details beyond the abstracts.

- Levine B, Robertson IH, Clare L, et al. Rehabilitation of executive functioning: an experimental-clinical validation of Goal Management Training. *J Int Neuropsychol Soc.* 2000;6(3):299-312.
  https://doi.org/10.1017/S1355617700633052
  https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=10824502&retmode=xml
- Stamenova V, Levine B. Effectiveness of goal management training® in improving executive functions: A meta-analysis. *Neuropsychol Rehabil.* 2019;29(10):1569-1599.
  https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=29540124&retmode=xml
- Cicerone KD, Goldin Y, Ganci K, et al. Evidence-Based Cognitive Rehabilitation: Systematic Review of the Literature From 2009 Through 2014. *Arch Phys Med Rehabil.* 2019;100(8):1515-1533.
  https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=30926291&retmode=xml

How they are used:

- Levine et al. describe Goal Management Training (GMT) as derived from Duncan's theory of goal neglect, and report support for it in people with brain injury. The skill's "state the goal first, then check the work against the goal" rules take the idea of guarding against goal neglect. **The skill is not GMT.** GMT is a training programme delivered to a person; here the assistant simply does the goal-keeping itself. The steps of GMT were not in the abstract and are not reproduced.
- Stamenova and Levine's meta-analysis concludes that GMT is an effective intervention for executive functions, with effects in all measured domains except speed of processing. That exception is one reason the processing-speed rules here only reduce the need for speed.
- Cicerone et al. list, among their Practice Standards, compensatory strategies for mild memory deficits and metacognitive strategy training for deficits in executive functioning. The skill borrows the direction (compensate externally; make the goal and the check explicit). The recommendations are about rehabilitation by clinicians, for people with TBI or stroke, and say nothing about AI assistants.

## What it deliberately does not do

- It does not assess, diagnose, or track the reader.
- It does not give advice on symptoms, medication, rehabilitation or recovery, and tells the assistant to decline if asked.
- It does not mention the reader's condition unless the reader does.
- It makes no claim that using it improves any function.

## Credits

Modelled on [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) by Ayoub Ghriss (MIT). The repository layout, the `SessionStart` hooks, the Pi/OMP extension, the OpenCode plugin and the runtime manifests are adapted from that project; the original copyright notice is kept in [LICENSE](LICENSE) and in the adapted files. The rules in `SKILL.md` are new.

This project is not affiliated with the original author, and the original author has not reviewed or endorsed it.

## License

[MIT](LICENSE).
