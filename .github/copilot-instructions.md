# Copilot Instructions — 3drepo.io

## Repository layout

This is **not** a single root package. The two independent packages are:
- `backend/` — Node.js/Express API server
- `frontend/` — React/TypeScript SPA (out of scope for current work)
- `config/` — Shared runtime config consumed by both packages via `NODE_CONFIG_DIR=../config`

Always run package-manager commands from inside `backend/` or `frontend/`, never from the repo root.

---

## Backend

### Node.js version

Read `backend/package.json` → `engines.node` and use that version before running any commands. Currently `24.x.x`.

### Install dependencies

```bash
cd backend
yarn install --network-timeout 100000 --frozen-lockfile --immutable --immutable-cache --non-interactive
```

### Lint

```bash
cd backend
yarn lint          # ESLint with airbnb-base + security + n plugins
yarn lint:fix      # auto-fix
```

### Test

```bash
cd backend
yarn test:v5                # full v5 suite (unit + e2e + drivers + scripts)
yarn test:v5-unit           # unit tests only — no external services needed
yarn test:v5-e2e            # e2e tests — requires RabbitMQ
yarn test:v5-drivers        # driver tests — requires RabbitMQ

# Run a single test file (v5):
cross-env NODE_ENV=testV5 NODE_CONFIG_DIR=../config dotenvx run -f ../config/testV5/.env -- \
  yarn jest -c ./jest.config.unit.js path/to/your.test.js

# Legacy v4 tests (only if task explicitly targets v4):
yarn test          # runs test:unit + test:int (requires MongoDB + test DB dump)
yarn test:one tests/v4/path/to/file.js
```

**RabbitMQ** is required for `test:v5-e2e` and `test:v5-drivers`. CI uses `rabbitmq:3.10.5-management` on ports 5672/15672 with credentials `guest`/`guest`. If queue tests fail with `QUEUE_CONNECTION_ERROR`, start RabbitMQ before rerunning — do not change the code.

### v5 source layout (`backend/src/v5/`)

```
routes/       Express route definitions — thin handlers that call processors
processors/   Business logic layer between routes and models/services
models/       MongoDB data access
middleware/   Auth, permissions, input validation/conversion
services/     External integrations (queue, mailer, elastic, chat, etc.)
handler/      Low-level I/O drivers (db, gridfs, fs, queue)
schemas/      Joi/validation schemas
utils/        Shared helpers, responder, responseCodes, logger, config constants
```

The request lifecycle is: **route handler → middleware (auth/permissions/validation) → processor → model/service → respond**.

### Key conventions

**Response pattern** — All route handlers call `respond(req, res, templates.<code>, payload)` from `utils/responder`. Error codes come from `utils/responseCodes` (`templates` object). Never send raw `res.json()` / `res.send()`.

**Error propagation** — Route handlers are `async` functions that `catch` and pass the error directly to `respond(req, res, err)`. Processors throw using `templates.*` error objects; do not swallow errors.

**Indentation** — Tabs (enforced by ESLint). The backend uses CommonJS (`require`/`module.exports`), not ESM.

**`require-sort`** — The custom ESLint rule (`eslint-rules/`) enforces sorted `require` statements. Run `yarn lint:fix` if you add imports.

**Config** — Runtime config is loaded via `app-config` with `NODE_CONFIG_DIR=../config` and `NODE_ENV` pointing to the config subdirectory (e.g., `testV5`, `development`). The `.env` file in each config directory is loaded with `dotenvx`. Do not hardcode secrets.

**`BYPASS_AUTH`** — A flag (`utils/config.constants`) that disables auth/authz checks. It is only set in internal-facing environments and propagated via `app.get(BYPASS_AUTH)` through route factories.

**Test structure** — Unit tests live in `tests/v5/unit/`, e2e in `tests/v5/e2e/`, mirroring the `src/v5/` directory tree. Coverage is collected only from `src/v5/**/*.js`.

**Legacy v4** — `src/v4/` and `tests/v4/` are legacy. Default to `src/v5/` unless the task explicitly targets v4 behaviour.

### External service dependencies summary

| Service | Used by | CI image |
|---|---|---|
| RabbitMQ | queue handler, eventsManager | `rabbitmq:3.10.5-management` |
| MongoDB | all model tests (v4 e2e) | `mongodb:8.0` |
| Elasticsearch | elastic service | not in CI by default |
