# Browser Bug Audit

Date: 2026-04-28
Branch: `codex/browser-bug-audit`
App URL: `http://localhost:3000`

## Verification Baseline

- `npm.cmd run typecheck`: passed.
- `npm.cmd run test`: passed before fixes, 11 files / 61 tests.
- Post-fix verification: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test` passed, 11 files / 67 tests; `npm.cmd run build` and `npm.cmd run smoke:prod` passed.
- Existing Next dev server detected on port 3000 and used for browser testing.
- Browser surfaces used:
  - Browser Use in-app browser with DOM snapshots, visible screenshot, console log checks.
  - Playwright CLI session `harmony-audit` for fresh-session desktop/mobile route testing.

## Tested Flows

- Desktop home route `/`: hero, progress summary, daily review, skill tree, lesson cards.
- Desktop generator route `/generator`: default progression, option selection, fallback messaging, playback, practice copy, recent history.
- Desktop lesson list `/lessons`: curriculum links, skill tree, route navigation.
- Desktop lesson detail `/lessons/piano-roll-intervals-scales`: example playback, A/B listening, quiz, checklist, completion gating, exercise panel.
- Mobile home at 390x844: header, hero, CTA buttons, horizontal piano-roll preview.
- Mobile lesson detail at 390x844: lesson select navigation, checklist, lesson route switching.

## Confirmed Bugs

### 1. Piano-roll exercise grid width can silently drift from target notes

Severity: Medium

Evidence:
- Fresh Playwright session opened `/lessons/piano-roll-intervals-scales`.
- Exercise panel displays `노트 0개 / 목표 8개`.
- The same panel instructs: `C4부터 C5까지 C major 음을 순서대로` and `목표: 정답 노트 8개를 같은 옥타브와 박자 패턴에 맞춰 배치합니다.`
- The editable `DraggablePianoRoll` is fixed to 4 beats (`BEATS = 4` in `components/piano-roll/DraggablePianoRoll.tsx`).
- Follow-up implementation check corrected the original audit detail: lesson-1 `expectedNotes` are half-beat spaced and end at beat 4, so lesson 1 is not structurally impossible.

Why this is a bug:
- The editor had a hard-coded 4-beat width instead of deriving its width from `expectedNotes` and user notes.
- Without data-driven sizing, a future longer exercise could block completion by making target notes unreachable.
- The UI already supports horizontal scrolling, so the grid should expand when exercise data requires it.

Reproduction:
1. Open `/lessons/piano-roll-intervals-scales` in a fresh session.
2. Complete example/listening/quiz, or just inspect the exercise panel.
3. Inspect `DraggablePianoRoll` grid sizing and exercise target note end beats.
4. Observe that the grid width was hard-coded rather than data-driven.

Likely fix area:
- `components/piano-roll/DraggablePianoRoll.tsx`
- `data/curriculum.ts`
- Make beat count dynamic from `expectedNotes` and user notes.

Implementation update:
- Follow-up implementation check corrected the original audit detail: lesson-1 `expectedNotes` are half-beat spaced and end at beat 4, so lesson 1 is not structurally impossible.
- Fixed the underlying grid-width risk by deriving editable beat count from `expectedNotes` and user notes instead of a hard-coded beat count.
- Added curriculum coverage proving every exercise target end beat fits in the editable piano-roll grid.

### 2. Generator recent history stores duplicate entries for identical generated progressions

Severity: Medium

Evidence:
- In a fresh Playwright session, opened `/generator`.
- Selected `G`, `몽환적`, `로파이`, `중급`.
- Clicked `진행 만들기` twice.
- Recent history showed two identical buttons:
  - `G · 로파이 · IVmaj7 - iii7 - vi7 - V7`
  - `G · 로파이 · IVmaj7 - iii7 - vi7 - V7`

Why this is a bug:
- The history is presented as the recent 5 useful generated progressions, but repeated clicks consume slots with indistinguishable items.
- The duplicate is especially confusing because fallback generation can return the same underlying template for a requested combination.

Reproduction:
1. Open `/generator`.
2. Choose `G / 로파이 / 몽환적 / 중급`.
3. Click `진행 만들기` twice.
4. Check `최근 생성 기록`.

Likely fix area:
- `lib/storage/progressSchema.ts` `addRecentProgression`
- `components/generator/ChordProgressionGenerator.tsx`

Second-pass update:
- Retested fallback history after the first fix.
- Found one remaining duplicate path: `dreamy / lofi / intermediate` falls back to the same underlying `chill / lofi / intermediate` progression, and then generating the exact `chill / lofi / intermediate` progression produced two identical visible history rows.
- Fixed by deduping recent history by actual musical content (`key`, roman numerals, and chord symbols), not requested mood or complexity.
- Browser recheck confirmed the visible `G · 로파이 · IVmaj7 - iii7 - vi7 - V7` row remains single after the fallback/exact generation sequence.

### 3. Generator select controls have weak accessible labels

Severity: Low to Medium

Evidence:
- Browser Use `getByLabel("키 진행을 만들 기준 조성입니다.")` failed to locate the key select.
- Playwright CLI generated labels such as `키진행을 만들 기준 조성입니다.CDEFGABAmDmEm`, `분위기밝음슬픔몽환적어두움긴장감편안함`.
- DOM snapshot exposes the key combobox accessible name as `키 진행을 만들 기준 조성입니다.`, while the visible user-facing label is just `키`.

Why this is a bug:
- Screen-reader and automation names include helper text and option text, not just the visible label.
- This makes the form harder to navigate reliably and produces noisy accessible names.

Reproduction:
1. Open `/generator`.
2. Inspect the select accessible names in a browser snapshot or Playwright locator generation.
3. Observe names are built from wrapper label contents instead of a direct label/select association.

Likely fix area:
- `components/generator/ChordProgressionGenerator.tsx` `Select` helper component.

### 4. Some exercise target pitches were outside the editable piano-roll range

Severity: High

Evidence:
- Third-pass review found exercise targets below and above the fixed MIDI range 48..72.
- Examples included `basslines-slash-chords` low bass notes (`G2`, `A2`, `B2`) and upper notes in later lessons (`D5`, `E5`, `F5`).
- The editor clamped pointer input and rendering to the fixed range, so those target notes could not be placed exactly.

Fix:
- Added dynamic MIDI range sizing with the same data-driven approach used for beat width.
- Updated both editable and read-only piano rolls to derive visible pitch range from their note data.
- Added curriculum coverage proving every exercise target pitch is inside the editable range.
- Browser recheck on `/lessons/basslines-slash-chords` showed the editable roll expanded to `height:660px` and exposed `G2`/`B2`.

### 5. Exact user-drawn notes could be penalized for missing hidden role metadata

Severity: High

Evidence:
- Third-pass review found that newly drawn notes default to `chordTone`, while expected notes can carry `root`, `seventh`, or `tension`.
- The scorer penalized missing bass/tension roles even when the user placed the correct pitch and timing.
- This made exact pitch/timing answers fail in several later lessons.

Fix:
- Updated bass and tension scoring to match the expected role-critical pitches against the user's actual pitch set, not the editor's default role metadata.
- Added coverage proving every lesson's exact expected notes pass even when copied through the editor's default role behavior.

## Non-Bugs / Passed Checks

- Korean text rendered correctly in the browser, despite PowerShell output displaying mojibake for some file reads.
- `typecheck` and unit tests passed before any fixes.
- Home page primary CTAs navigate correctly.
- Generator fallback message is visible when no exact template exists.
- `이 진행으로 실습하기` copies generated notes into the practice piano roll.
- Example playback toggles lesson checklist state in a fresh Playwright session.
- A/B listening and quiz scoring persist scores and update the lesson checklist.
- Lesson completion remains disabled when exercise score is missing or below 80.
- Mobile lesson selector navigates from lesson 1 to lesson 2 correctly.
- Browser console checks showed no app errors or warnings during tested routes.
