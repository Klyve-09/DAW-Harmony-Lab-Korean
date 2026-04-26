# Codex Harness Evaluation

Use this format during `검증 (Verify)` and `검토 (Review)`.

## Evidence Rules
- State the intended change in one sentence.
- Record the direct proof first.
- Record one adjacent regression check second.
- Separate verified facts from assumptions or blocked checks.
- Do not use model confidence as evidence; cite commands, behavior, code paths, screenshots, or blocked checks.

## Template
```markdown
## 검증 (Verify)

### Intended Change
- 

### Files And Layers Touched
- 

### Direct Proof
- Command or check:
- Result:

### Adjacent Regression Check
- Command or check:
- Result:

## 검토 (Review)

### Review Findings
- No findings
```

If there are findings, replace the line above with the actual issues.

```markdown
### Remaining Unknowns
- 

### Release Confidence
- 
```
