# Reviewer Notes

Use this folder to capture the full output of diff reviews and PR preparation.

## Suggested file naming

- `<ticket-or-branch>-review.md`
- `<ticket-or-branch>-pr.md`

## Automatic PR creation

When a branch is pushed, the `.github/workflows/auto-create-pr.yml` workflow will attempt to create a pull request automatically if one does not already exist and if a branch-specific PR body exists at:

- `.github/reviewer-notes/<branch>-pr.md`
- `.github/reviewer-notes/<branch>-review.md`

If GitHub Actions is not permitted to create PRs with `GITHUB_TOKEN`, you can provide a personal access token secret named `PR_CREATOR_TOKEN` with `repo` permissions.

If you are using the `diff-reviewer` agent, produce the review note in one of those file names before pushing the branch.

## Recommended contents

- Summary
- Scope and changed files
- Whether test cases changed
- Test evidence
- Security review
- Observability review
- Feature flag review
- Rollback plan
- Merge decision with explicit reasoning
