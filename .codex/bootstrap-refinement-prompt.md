# Codex Bootstrap Refinement Prompt

Use this file after `boot` creates the first-pass scaffold.

## Generated Snapshot
- Primary stack guess: Node.js or web app
- Package manager or runtime guess: npm
- Existing guidance docs detected: README.md
- Likely run command: `npm.cmd run dev`
- Likely verification command: `npm.cmd run test`
- Likely source directories: app, components, lib
- Likely test directories: tests

## Suggested Codex Prompt

Copy the prompt below into Codex after opening this repository:

```text
Read `AGENTS.md`, `.codex/config.toml`, `.codex/harness/workflow.md`, `.codex/harness/gates.md`, `.codex/harness/evaluation.md`, `.codex/harness/task-template.md`, `.codex/harness/longrun/overview.md`, the nearest `README`, and any detected fallback agent docs. Then refine the generated Codex guidance for this repository.

Goals:
1. Verify whether the generated run and verification commands are correct.
2. Replace placeholder or guessed guidance with repo-owned commands, entry points, and risk areas.
3. Keep the generated files short and operational. Improve precision rather than adding process bloat.
4. Preserve useful conventions from existing docs instead of creating conflicting rules.
5. If the repository has a clear fast validation path, tighten `workflow.md` so direct proof and adjacent regression checks are narrower than broad root-level scripts.
6. Keep longrun guidance optional and lean so it only activates for genuinely large tasks.
7. Keep the repo on the default `gpt-5.5` profile unless there is a concrete reason to override it.
8. Keep subagent rules aligned with the global default: independent ownership only, isolated worker write sets, and integration review after parallel work.

Constraints:
- Do not change product code unless it is required to verify or correct the local guidance files.
- Prefer the smallest safe edits to the generated guidance.
- If an assumption cannot be verified locally, mark it as unknown instead of pretending it is confirmed.

Return:
- what guidance files you changed
- which commands you verified directly
- what still remains unverified
```
