# Codex Harness Workflow

## Purpose
- Use this file as the repo entrypoint for repeated Codex work.
- Keep the default loop explicit: `살펴보기 (Inspect) -> 계획 (Plan) -> 구현 (Implement) -> 검증 (Verify) -> 검토 (Review)`.
- Assume the local default model is `gpt-5.5` unless repo-local config explicitly overrides it.

## Project Snapshot
- Primary stack: Node.js or web app
- Existing guidance docs detected: AGENTS.md, README.md
- Likely run command: `npm.cmd run dev`
- Likely verification command: `npm.cmd run test`

## GPT-5.5 Operating Profile
- Use stronger judgment to reduce visible ceremony, not to add more artifacts.
- For small work, inspect only until the next safe edit and proof path are clear.
- For medium work, keep the work contract short: `Goal`, `Boundary`, `Proof`, `Risk`, `Stop Rule`.
- For architecture, security, data, cross-stack, destructive, or release-sensitive work, load `gates.md` before editing.
- Prefer one direct proof plus one adjacent regression check over broad validation by default.

## Subagents
- Use subagents only when the user explicitly asks for them or the task clearly has independent scopes worth delegating.
- Keep the immediate blocking task in the main session; delegate sidecar exploration, review, or disjoint implementation that can run in parallel.
- Split by ownership boundaries such as separate files, modules, services, screens, or verification responsibilities.
- Do not have multiple worker agents edit the same files or shared generated outputs at the same time.
- For broad reviews, use mapper/research/reviewer roles first, then an integration review before handoff when changes were parallel.
- For broad implementation, assign workers only when each write set is isolated and the prompt includes context, owned files, forbidden files, expected output, and verification commands.
- Keep recursive delegation disabled by default; one parent session coordinating direct child agents is the normal pattern.

## 살펴보기 (Inspect)
1. Read `AGENTS.md`, fallback agent docs, the nearest `README`, and setup or verification docs.
2. Identify the active app, package, service, or crate before editing.
3. Map the request across layers: UI, API, data, jobs, build, deploy, or external services.
4. Use `rg` and `rg --files` for text and file search before slower recursive alternatives.
5. Choose the narrowest direct proof that demonstrates the requested behavior.
6. Stop exploring once the next safe action is clear.
7. If the change looks broad or risky, load `gates.md` before editing.

## 계획 (Plan)
1. Reproduce the failure or define the success condition concretely.
2. Lock a short work contract before editing: `Goal`, `Boundary`, `Proof`, `Risk`, `Stop Rule`.
3. Keep the implementation inside that contract unless new evidence forces a scope update.
4. Keep the contract internal unless surfacing it improves coordination.
5. If the blast radius is non-trivial, use `gates.md` to call out contract, data, environment, or release risks up front.

## 구현 (Implement)
1. Make the smallest safe change at the layer where the evidence is strongest.
2. Keep the change inside the planned boundary unless new evidence forces a contract update.
3. Replace guessed commands or assumptions with repo-owned facts as soon as they are known.

## 검증 (Verify)
1. Run the direct proof first.
2. Run one adjacent regression check on the nearest risky neighbor.
3. Prefer repo-owned commands such as tests, typechecks, request replays, or targeted UI checks over ad hoc validation.
4. Use `evaluation.md` to capture verified facts and blocked checks.

## 검토 (Review)
1. Review the patch with a failure mindset before handoff.
2. Look for contract drift, missing edge cases, stale callers, silent fallback behavior, and release-specific gaps.
3. If the blast radius is non-trivial, run `/review` or an equivalent review pass before handoff.
4. Report only findings grounded in code, behavior, or validation evidence.
5. State what remains unknown instead of implying it was proved.

## Stack Heuristics
- If the task changes UI behavior, prove the affected route, component, or browser path directly before broader checks.
- If the repo also owns backend code, verify the request path and the nearest schema or serializer boundary.
- Prefer repo-owned commands such as lint, typecheck, test, or build over ad hoc shell checks.

## Codebase Anchors
- Likely source directories: app, components, lib
- Likely test directories: tests

## Harness Files
- `workflow.md`: entrypoint and the five-stage loop
- `gates.md`: planning gates for broad or high-stakes changes
- `evaluation.md`: verification and review structure
- `task-template.md`: scoping template for ambiguous work and short work contracts

## Longrun Mode
- For multi-sprint, multi-session, or highly cross-stack work, load `longrun/overview.md`.
- Use the lean longrun loop: `spec -> sprint contract -> implement -> scorecard -> handoff`.
- Skip longrun for one-off bugfixes, small edits, or work that comfortably fits in one normal loop.

## Notes To Refine
- Replace guessed commands with repo-owned commands after the first successful run.
- Add recurring gotchas and the fastest trusted smoke path once they are known.
