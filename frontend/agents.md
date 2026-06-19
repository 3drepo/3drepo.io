# Frontend agent instructions

## Scope
- Package path: `/home/runner/work/3drepo.io/3drepo.io/frontend`
- Main areas:
  - `src/v5/`: current frontend application code.
  - `src/v4/`: legacy frontend code.
  - `test/`: Jest test suites.

## Setup
1. Read `/home/runner/work/3drepo.io/3drepo.io/frontend/package.json` and use the Node.js version from `engines.node`.
2. Install dependencies from `/home/runner/work/3drepo.io/3drepo.io/frontend`:

```bash
yarn install --network-timeout 100000 --frozen-lockfile --immutable --immutable-cache --non-interactive
```

## Default validation
Run these from `/home/runner/work/3drepo.io/3drepo.io/frontend`:

```bash
yarn lint
yarn test
```

## Errors encountered in onboarding
1. **Frontend test timeout flake observed**
   - Error seen in `yarn test`:
     - `test/viewer/viewer.sagas.spec.ts` exceeded `500 ms` timeout (2 tests).
   - Workaround:
     - Re-run after system load decreases.
     - When debugging locally, run the affected suite with a higher timeout.

## Practical tips
- Prefer `src/v5` unless the task explicitly targets legacy v4 behavior.
- For most changes, start with targeted Jest coverage near the changed area before broad validation.
