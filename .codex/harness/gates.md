# Codex Harness Gates

Use these gates during `계획 (Plan)` before broad, cross-stack, or risky changes.

## Deep Reasoning Triggers
- Architecture, security, auth, permissions, migrations, data loss, concurrency, billing, deployment, or destructive operations.
- Symptoms that cross UI, API, data, cache, build, or environment boundaries.
- Any change where the likely regression is outside the first file you would edit.
- When these triggers appear, reason deeper before editing, but keep the visible plan short.

## Scope Gate
- What exactly is changing?
- Which user-visible path or contract must be correct when done?
- What is the smallest safe implementation boundary?

## Environment Gate
- Which command proves the target behavior directly?
- Which command is the fastest credible adjacent regression check?
- Which credentials, services, devices, or environments could block local proof?

## Contract Gate
- Which route, schema, serializer, API, job payload, or shared type is the real contract boundary?
- Which callers or consumers could silently break if that contract drifts?

## Data And State Gate
- Does the change affect persistence, caching, background jobs, queue payloads, or generated artifacts?
- Is there a rollback or compatibility concern?

## Security And Secrets Gate
- Does the change touch auth, permissions, tokens, secrets, or user data?
- Is there a new failure mode that would leak privileged behavior or data?

## Build And Dependency Gate
- Does the change rely on a generated file, lockfile, config default, toolchain, or runtime flag?
- Could CI, packaging, or deployment differ from the local environment?

## Performance And UX Gate
- Could the change add latency, heavy rendering, extra queries, poor loading behavior, or noisy retries?
- For UI work, were empty, loading, and error states considered?

## Release Gate
- What is still unverified?
- What is the most likely regression if this ships now?
- What evidence would raise confidence before release?

## Stack Notes
- Check route, component, state, and request boundaries together when the same repo owns frontend and backend code.
- Watch for bundler, environment, and generated-client drift when dependencies or config change.
