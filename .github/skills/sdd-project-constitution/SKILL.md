name: sdd-project-constitution
summary: Enforce and mutate the repository Project Constitution used by Spec-Driven Development workflows.
description: |
  This skill ensures the repository maintains a canonical `constitution.md` (stored at `.github/constitution.md`) that describes the project's Spec-Driven Development (SDD) rules, principles, and amendment history.

  The skill provides two primary capabilities:
  - Validation: `validate()` - checks that the constitution exists, is well-formed, and that principles are uniquely identified.
  - Safe mutation: `ensureExists()`, `appendPrinciple()`, `versionIncrement()` - create or append without altering existing content.

inputs:
  - name: repoRoot
    type: string
    required: false
    description: Path to repository root (defaults to current working directory)
outputs:
  - name: diagnostics
    type: json
    description: Validation diagnostics or mutation results.
examples:
  - run: node .github/skills/sdd-project-constitution/validate.js
  - run: node .github/skills/sdd-project-constitution/mutate.js ensureExists
  - run: node .github/skills/sdd-project-constitution/mutate.js append --id P001 --title "Keep specs first" --desc "Write spec before code"

notes: |
  - The skill is designed to be idempotent: calling `appendPrinciple()` with an existing `id` is a no-op.
  - The skill avoids rewriting or normalizing existing body content; it only appends new principle sections and updates frontmatter metadata.
