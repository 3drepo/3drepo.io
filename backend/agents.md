# Backend agent instructions

## Scope
- Package path: `/home/runner/work/3drepo.io/3drepo.io/backend`
- Main areas:
  - `src/v5/`: current backend APIs and services.
  - `src/v4/`: legacy backend code.
  - `tests/v5/`: Jest suites for the active backend test configuration.
  - `tests/v4/`: legacy Mocha suites; do not use by default unless the task explicitly targets v4.

## Setup
1. Read `/home/runner/work/3drepo.io/3drepo.io/backend/package.json` and use the Node.js version from `engines.node`.
2. Install dependencies from `/home/runner/work/3drepo.io/3drepo.io/backend`:

```bash
yarn install --network-timeout 100000 --frozen-lockfile --immutable --immutable-cache --non-interactive
```

## Default validation
Run these from `/home/runner/work/3drepo.io/3drepo.io/backend`:

```bash
yarn lint
yarn test:v5
```

## Errors encountered in onboarding
1. **`test:v5` queue tests fail without RabbitMQ**
   - Error seen:
     - `QUEUE_CONNECTION_ERROR`
     - `Max number of retries reached.`
   - Workaround:
     - Start RabbitMQ before running `yarn test:v5`.
     - CI uses a `rabbitmq:3.10.5-management` service in `.github/workflows/automaticTesting.yml`.

## Practical tips
- Prefer `src/v5` unless the task explicitly targets legacy v4 behavior.
- If backend tests fail around queue handlers or messaging, verify RabbitMQ before changing code.
