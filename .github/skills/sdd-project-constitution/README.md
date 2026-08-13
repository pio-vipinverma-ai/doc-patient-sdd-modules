# SDD Project Constitution Skill

This skill enforces the repository Project Constitution used by Spec-Driven Development (SDD).

Features

- Validate `.github/constitution.md` for presence, frontmatter version, and principle uniqueness.
- Create a canonical `.github/constitution.md` template if missing.
- Append new principles idempotently (no-op if id exists) and bump patch version.

Usage

- Validate (exit code 0 on success, 2 on errors):

```bash
node .github/skills/sdd-project-constitution/validate.js [repoRoot]
```

- Ensure file exists:

```bash
node .github/skills/sdd-project-constitution/mutate.js ensureExists
```

- Append principle (idempotent):

```bash
node .github/skills/sdd-project-constitution/mutate.js append --id P001 --title "Write spec first" --desc "Describe behavior before implementation"
```

Notes

- The scripts are intentionally minimal and dependency-free to work in most CI environments.
- The mutate tool appends a `### <id> - <title>` section to the end of the file and bumps the patch version in frontmatter.
