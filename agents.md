# Copilot Cloud Agent Onboarding (3drepo.io)

## Repository layout
- `backend/`: backend package and tests. See `/home/runner/work/3drepo.io/3drepo.io/backend/agents.md`.
- `frontend/`: frontend package and tests. See `/home/runner/work/3drepo.io/3drepo.io/frontend/agents.md`.
- `config/`: shared runtime and test configuration, including `test/` and `testV5/`.
- `.github/workflows/automaticTesting.yml`: source of truth for CI validation patterns.

## Repo-wide working rules
- This is not a single root package; run package-manager commands from `backend/` or `frontend/`.
- Read the nearest `agents.md` before working in a subfolder.
- Follow existing CI command patterns, but prefer the smallest targeted validation that matches your change.

## Node.js / package manager rules
- `backend/package.json` and `frontend/package.json` each declare the required Node.js version in `engines.node`.
- Before installing dependencies or running scripts in either package, read that package's `package.json` and use the matching Node.js version.
- Never bypass or ignore the `engines` field.

## Errors encountered in onboarding
1. **Node engine mismatch blocks Yarn**
   - Error seen:
     - `The engine "node" is incompatible with this module. Expected version "22.x.x". Got "24.15.0"`
   - Workaround:
     - Switch to the Node.js version required by the relevant package's `package.json`.

# Agent Operating Rules

## General Behavior
- Follow the repository instructions in this file before using any default agent behavior.
- Prefer making the smallest correct change.
- Do not invent issue numbers, task details, or PR content.
- If a required issue number is missing, ask for it before committing or opening a PR.

## Commit Message Rules
When creating any git commit, the commit message must follow this format:

ISSUE #<issue number>: <short description>

Examples:
- ISSUE #1234: Fix login redirect
- ISSUE #8421: Add validation for billing form

Rules:
- Always include the literal prefix `ISSUE #`.
- Always include the issue number.
- Keep the description short and specific.
- Do not commit with a different format.
- If the issue number is unknown, stop and ask for it.

## Pull Request Rules
When creating or editing a pull request, always follow the repository PR template.

Requirements:
- Use the PR template file exactly as provided in the repository.
- Do not delete required template sections.
- Fill in every section that applies.
- Leave a section as `N/A` only when it truly does not apply.
- When editing an existing PR, preserve the template structure and update only the relevant content.

## Pull Request Title Rules
Every PR title must follow this format:

> ISSUE #{issue number} - {description of the task}

Examples:
- ISSUE #1234 - Fix login redirect
- ISSUE #8421 - Add billing form validation

Rules:
- Use the exact `ISSUE #<issue number> -` prefix.
- Keep the description concise and descriptive.
- Do not use brackets, parentheses, or alternate separators.
- Do not invent an issue number.
- If the issue number is missing, ask for it before opening or editing the PR.

## PR Description Rules
The PR description must:
- Follow the repository PR template.
- Clearly explain what changed.
- Include testing performed.
- Note any follow-up work or caveats.
- Mention the issue number near the top when relevant.

## Editing Existing PRs
When asked to update a PR:
- Keep the existing title format unless the issue number or scope changes.
- Keep the PR template intact.
- Update only the sections affected by the change.
- Do not remove reviewer notes, checklist items, or required fields.

## Validation
Before finishing any commit or PR:
- Verify the commit message format.
- Verify the PR title format.
- Verify the PR body matches the template.
- Verify the issue number is correct and not guessed.
