# Copilot Cloud Agent Onboarding (3drepo.io)

## Repository layout
- `backend/`: Node.js backend (v4 + v5 APIs, scripts, tests).
- `frontend/`: React/TypeScript frontend (v4 + v5 UI, Jest tests, webpack/storybook build).
- `config/`: runtime/test configuration (`test/`, `testV5/`).
- `.github/workflows/automaticTesting.yml`: best source of truth for CI validation commands.

## How to work efficiently
- This repo is **not** a single root package: run Yarn commands from `backend/` or `frontend/`.
- Follow CI command patterns from `.github/workflows/automaticTesting.yml` when validating.
- Prefer targeted checks in the changed area first, then broader checks.

## Setup commands
```bash
cd backend
yarn install --network-timeout 100000 --frozen-lockfile --immutable --immutable-cache --non-interactive

cd ../frontend
yarn install --network-timeout 100000 --frozen-lockfile --immutable --immutable-cache --non-interactive
```

If the cloud runner Node version is not `22.x.x`, use `--ignore-engines` for install and `YARN_IGNORE_ENGINES=1` for run commands.

## Validation commands (aligned with CI)
Backend:
```bash
cd backend
YARN_IGNORE_ENGINES=1 yarn lint
YARN_IGNORE_ENGINES=1 yarn test:v5
YARN_IGNORE_ENGINES=1 yarn test
```

Frontend:
```bash
cd frontend
YARN_IGNORE_ENGINES=1 yarn lint
YARN_IGNORE_ENGINES=1 yarn test
YARN_IGNORE_ENGINES=1 yarn docs
YARN_IGNORE_ENGINES=1 yarn build:test
```

## Errors encountered in onboarding and workarounds
1. **Node engine mismatch blocks Yarn**
   - Error seen:
     - `The engine "node" is incompatible with this module. Expected version "22.x.x". Got "24.15.0"`
   - Workaround:
     - Install with `--ignore-engines`.
     - Run scripts with `YARN_IGNORE_ENGINES=1`.

2. **`backend` v5 queue tests fail without RabbitMQ**
   - Error seen in `yarn test:v5`:
     - `QUEUE_CONNECTION_ERROR` / `Max number of retries reached.`
   - Workaround:
     - Start RabbitMQ before running backend v5 tests (CI uses `rabbitmq:3.10.5-management` service).

3. **`backend` v4 tests need test env + test data setup**
   - Errors seen in `yarn test`:
     - `[MISSING_ENV_FILE] missing ../config/test/.env file`
     - large timeout/failure set in DB-related unit tests when local prerequisites are missing.
   - Workaround:
     - Ensure `config/test/.env` exists.
     - Ensure MongoDB + RabbitMQ are running.
     - Restore test DB/files as CI does (CI checks out `3drepo/tests` using `backend/testDBVersion` and restores with `mongorestore`).

4. **Frontend test timeout flake observed**
   - Error seen in `frontend yarn test`:
     - `test/viewer/viewer.sagas.spec.ts` exceeded `500 ms` timeout (2 tests).
   - Workaround:
     - Re-run after system load decreases, or run the specific suite with a higher timeout when debugging.

## Practical agent tips
- If backend tests fail around queue/DB, verify services first before changing code.
- Prefer making small scoped changes in `backend/src/v5` or `frontend/src/v5` unless issue explicitly targets legacy v4.
- Keep changes CI-compatible; this repo relies on strict lint + test + build checks in both backend and frontend.
