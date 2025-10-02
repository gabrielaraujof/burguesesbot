# BurguesesBot

An ESM TypeScript Telegram bot built with Telegraf, deployed to AWS Lambda via Serverless, and organized as a modular monolith with dependency injection.

## Python monorepo scaffold (Poetry + Monoranger)

This repo now also hosts a minimal Python monorepo scaffold to support multiple MCP services alongside the Telegram bot app. It's intentionally simple and defers non-essential tooling to future issues.

Structure:

```
apps/
	telegram-bot/
		pyproject.toml
		src/telegram_bot/__init__.py
services/
	gaming-social-mcp/
		pyproject.toml
		src/gaming_social_mcp/__init__.py
	content-deals-mcp/
		pyproject.toml
		src/content_deals_mcp/__init__.py
libs/
	common/
		pyproject.toml
		src/common/__init__.py
	mcp_utils/
		pyproject.toml
		src/mcp_utils/__init__.py

pyproject.toml   # root: Poetry in non-package mode + Monoranger workspace packages
```

Root `pyproject.toml` config:

- Poetry package-mode disabled (dependency/env mgmt only)
- Monoranger workspace package list under `[tool.monoranger]`

Minimal bootstrap (per package):

1) Install Poetry if needed (https://python-poetry.org/docs/#installation)
2) In each package directory (e.g. `apps/telegram-bot`):

```bash
poetry install
poetry run python -c "import sys; print(sys.version)"
```

Note: Monoranger is configured at the root via `[tool.monoranger]` and can be wired later for workspace-aware operations.

## Prerequisites
- Node version from `.nvmrc` (use `nvm install && nvm use`)
- Environment variables (see `.env.example`)

## Install

```bash
npm install
```

## Local development (long polling)

```bash
# Watch mode (nodemon -> runs develop)
npm run dev

# One-shot dev run
npm run develop

# Use mock AI locally
USE_MOCKS=true npm run develop
```

`src/index.ts` creates a bot via factories (`createBot` for prod or `createDevBot` when `USE_MOCKS=true`) and calls `bot.launch()`.

## Build

```bash
npm run build
```

Outputs compiled ESM to `dist/`. Keep `.js` extensions on local imports so Node ESM resolves compiled files correctly.

## Deploy (Serverless → AWS Lambda)

```bash
npm run build
npx serverless deploy --stage=prod
```

Serverless uses the compiled Lambda handler at `dist/modules/infra/function.handler` (see `serverless.yml`).

## Webhook setup (Telegram)

If deploying the webhook-based Lambda, configure a public domain with your `WEBHOOK_SECRET_PATH`, then set the webhook:

```bash
curl -F "url=https://<YOURDOMAIN.EXAMPLE>/<WEBHOOK_SECRET_PATH>" \
	https://api.telegram.org/bot<YOURTOKEN>/setWebhook
```

Note: Webhook Lambda is not tested locally (no serverless-offline configured). Use long-polling locally and deploy to test webhooks.

## Project structure (high-level)
- `src/modules/bot/bot.ts`: bot factories (`createBotWithDeps`, `createBot`, `createDevBot`).
- `src/modules/events/events.ts`: `createEvents(dependencies)` wires controllers to handlers.
- `src/modules/infra/controllers/events.controllers.ts`: pure business logic, DI-based.
- `src/modules/infra/adapters/service.adapters.ts`: service adapters (`createServiceAdapters`, `createDevServiceAdapters`).
- Domains: `src/modules/{ai,freegames,trivia,whosplaying}`.
- Lambda entrypoint: `src/modules/infra/function.ts`.

## Copilot custom instructions

- Global rules: `.github/copilot-instructions.md` (short, DI and wiring rules).
- Scoped rules: `.github/instructions/*.instructions.md` with `applyTo` globs, for example:
	- AI: `.github/instructions/ai.instructions.md` → `**/src/modules/ai/**`
	- Events: `.github/instructions/events.instructions.md` → `**/src/modules/events/**`
	- Infra/Adapters: `.github/instructions/adapters.instructions.md` → `**/src/modules/infra/**`
- Enable in VS Code: turn on “Use instruction files” (`github.copilot.chat.codeGeneration.useInstructionFiles`).
- View/edit: Chat → Configure Chat → Instructions.

Verification (manual):
- Open a file under `src/modules/ai/` and invoke Copilot Chat to generate code; confirm AI module rules (streaming first, `AiError` normalization) are followed.
- Open a file under `src/modules/events/` and generate a handler; confirm controller stays thin and commands are registered only in `events.ts`.
- If rules aren’t applied, confirm the setting above is enabled and the workspace contains the files listed here.

## Testing

```bash
npm test           # run once
npm run test:watch # watch mode
npm run test:cov   # with coverage
```

Controllers are tested with mock services (see `src/modules/infra/mocks/ai.mock.ts`).

### AI provider port

- Controllers depend on a provider-agnostic `AiProvider` returning `{ text }`.
- Adapters map neutral `ChatMessage[]` and simple `CommonGenerationConfig` to the underlying SDK and extract text internally.
- History helpers like `whosplayingHistory` are provider-agnostic.

### Deterministic mock AI

Enable the mock provider with `USE_MOCKS=true`. The `MockAiProvider`:

- Allows explicit seeding via `setMockResponse(input, output)`
- Produces a stable fallback hash (`mock:<hex16>`) based on `(input, system, history, config)` using stable key ordering when not seeded

Example:

```ts
const mock = new MockAiProvider()
const a = await mock.generate('hello', { system: 's' })
const b = await mock.generate('hello', { system: 's' })
// a.text === b.text (deterministic)
```

## License

[MIT](LICENSE)

