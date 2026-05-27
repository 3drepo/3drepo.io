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
