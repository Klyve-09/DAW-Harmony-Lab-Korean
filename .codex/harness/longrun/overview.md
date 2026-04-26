# Codex Longrun Mode

Use this add-on only for work that is likely to span multiple sprints, multiple sessions, or multiple layers of the stack.
Keep `workflow.md` as the default entrypoint for normal work.
With GPT-5.5, prefer one capable session moving through planner, builder, and evaluator roles sequentially before adding coordination overhead.

## Default Lean Loop
1. Write or refresh the product spec from the user brief.
2. Open exactly one sprint with a concrete sprint contract.
3. Implement only that sprint.
4. Evaluate the sprint against the contract with real evidence.
5. Write a handoff before pausing or moving to the next sprint.

## Roles
- Planner: expands the brief into a practical spec and sprint backlog.
- Builder: implements the current sprint.
- Evaluator: checks the sprint against the contract using repo-owned verification plus browser or QA checks when needed.

The same Codex session can play all three roles sequentially through files.
Do not add orchestration or subagents unless the work is truly large enough to justify it or the user explicitly asks for them.
If subagents are used, split by independent ownership boundaries, keep write sets separate, and run an integration review before handoff.

## When To Use
- The task cannot be completed safely in one normal `Inspect -> Plan -> Implement -> Verify -> Review` loop.
- The work crosses UI, API, data, and verification boundaries.
- You need a durable handoff because the task will continue later.
- The user wants a product-style build with visible sprint checkpoints.

## When Not To Use
- Single bugfixes
- Small refactors
- Narrow feature edits with one clear proof path
- Tasks where the overhead of writing sprint artifacts is larger than the implementation itself

## Efficiency Rules
- Keep one active sprint at a time.
- Keep sprint scope small enough to verify in one pass.
- Prefer 3 to 7 concrete deliverables in a sprint contract.
- If the evaluator finds only minor defects, fix once and rerun the scorecard instead of reopening the whole planning step.
- Use repo-owned verification first: `npm.cmd run test`
- Use the likely run path when needed: `npm.cmd run dev`

## Artifacts
- `spec-template.md`: planner output for the longrun task
- `sprint-contract-template.md`: the current sprint definition of done
- `scorecard-template.md`: evaluator result for the sprint
- `handoff-template.md`: durable state for the next session or sprint

## Stack Context
- Primary stack guess: Node.js or web app
