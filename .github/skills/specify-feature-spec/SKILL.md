---
name: specify-feature-spec
description: 'Execute the Specify phase for spec-driven development. Use when you need to convert a feature id like F1 or F3 into a structured markdown spec file with goal, scope, acceptance criteria, and open questions. Reads feature files from .github/specs/features and writes spec files to .github/specs/specs.'
argument-hint: 'Feature id, for example: F3'
user-invocable: true
---

# Specify Phase - Feature to Spec File

Use this skill to convert a feature id into a structured specification markdown file.

## When to Use

- User asks to run the Specify phase for a known feature id.
- User asks to generate a structured spec document from feature scenarios.
- User asks for acceptance criteria and scope from an existing feature file.

## Input

- Primary input is the feature id from invocation arguments.
- Treat both `$ARGUMENTS` and `$ARGUMENT` as the user-provided id string.
- Expected format is `F<number>` (for example `F3`, `f3`, ` F3 `).

## Procedure

Precondition: run the project constitution validator and abort if validation reports errors. Example:

```bash
node .github/skills/sdd-project-constitution/validate.js
```

If the validator exits with errors, return diagnostics and stop.

1. Parse and normalize feature id.
- Trim whitespace.
- Uppercase the id.
- Validate against pattern `^F[0-9]+$`.
- If invalid, stop and return: `Invalid feature id. Use format F<number>, for example F3.`

2. Resolve source feature file.
- Extract feature number N from `F<N>`.
- Find exactly one file that matches: `.github/specs/features/f<N>-*.md`.
- If no file is found, stop and return:
  - `Feature source not found for F<N>. Expected a file like .github/specs/features/f<N>-<slug>.md.`
- If multiple files match, stop and return all matches and ask for disambiguation.

3. Read source feature content and extract:
- Feature name from heading line: `# F<N> - <Feature Name>`.
- Source line from `**Source:** ...`.
- Description line from `**Description:** ...`.
- Scenario titles and Given/When/Then steps.

4. Build output spec path.
- Output folder: `.github/specs/specs`.
- Output file name: lowercase id, for example `f3.md`.
- Full output path: `.github/specs/specs/f<N>.md`.

5. Generate spec content using this required template.

Spec: [Feature Name]

#### Goal
[One sentence: what outcome does this achieve for the user or business?]

#### Scope
**Files:** [Exact file paths - no directories]

**Services:** [Backend services, APIs, databases involved]

**Branch:** [Git branch name]

#### Non-Goals

- [State explicitly what this spec does NOT cover - be ruthless]

#### Current Behaviour
[What happens today. Paste logs, metrics, or screenshots as evidence.]

#### Expected Behaviour
[Precise description of the desired end state.]

#### Acceptance Criteria

- AC-1: [Binary, testable, specific]
- AC-2: [Binary, testable, specific]

#### Open Questions

- **Q1:** [Anything that must be resolved before implementation starts]

6. Fill template with feature-derived content.
- `Spec:` uses extracted feature name.
- `Goal` uses feature description, rewritten into one business-outcome sentence.
- `Scope > Files` must include exact file paths likely touched (not folders). Include at least:
  - Source feature file path.
  - Planned spec output file path.
  - Any directly impacted implementation files only if confidently known.
- `Scope > Services` should list probable components (API, DB tables, auth service) inferred from feature; if unknown, state `TBD`.
- `Scope > Branch` default format: `spec/f<N>-<kebab-feature-name>`.
- `Non-Goals` must exclude adjacent but out-of-scope capabilities.
- `Current Behaviour` must cite evidence from source feature scenarios and existing behavior notes. If runtime evidence is unavailable, state that explicitly.
- `Expected Behaviour` must align exactly with source scenarios.
- `Acceptance Criteria` must be binary and testable, derived from Given/When/Then scenarios.
- `Open Questions` must include unresolved policy or validation details when present.

7. Write output file.
- Create `.github/specs/specs` if missing.
- Write final markdown to `.github/specs/specs/f<N>.md`.
- If file exists, overwrite only when user asked to regenerate; otherwise ask for confirmation.

8. Return completion summary.
- Include source file path used.
- Include output file path created.
- Include count of acceptance criteria and open questions.

## Quality Checks

Before finalizing, verify all of the following:

- All template sections exist exactly once.
- Acceptance criteria are pass/fail testable.
- Non-goals are explicit and not generic.
- No contradiction with source feature scenarios.
- Output path matches `.github/specs/specs/f<N>.md`.

## Note

Replace `$ARGUMENTS` and `$ARGUMENT` with the target feature id when running this skill, for example `F3`.
