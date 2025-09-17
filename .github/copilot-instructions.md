````instructions
## BurguesesBot — Copilot instructions

Purpose: give an AI coding agent the minimal, concrete knowledge to be productive in this repository.

- Big picture
  - This is an ESM TypeScript Telegram bot (Telegraf) with two main runtimes:
    - Long-polling/local: `src/index.ts` creates a bot via factories and calls `bot.launch()`.
    - Serverless webhook: `src/modules/infra/function.ts` exports a Lambda `handler` (wrapped by `serverless-http`) and is deployed via `serverless.yml` to AWS Lambda (`dist/modules/infra/function.handler`).
  - Architecture (v2.0+): Dependency Injection with controllers and adapters, now wired through factories:
    - `src/modules/bot/bot.ts` — bot factories (`createBotWithDeps`, `createBot` for prod, `createDevBot` for dev) that register handlers.
    - `src/modules/events/events.ts` — `createEvents(dependencies)` to expose command handlers from controllers.
    - `src/modules/infra/controllers/events.controllers.ts` — pure business logic handlers with injected dependencies.
    - `src/modules/infra/adapters/service.adapters.ts` — adapters to wrap domain services (`createServiceAdapters`, `createDevServiceAdapters`).
    - Domains unchanged but relocated: `src/modules/ai/*`, `src/modules/freegames/*`, `src/modules/trivia/*`, `src/modules/whosplaying/*`.

- How the architecture works
  - Dependency flow: `createServiceAdapters()` → `createControllers(adapters)` → `createEvents(controllers)` → `createBotWithDeps(token, deps)` registers events → run bot.
  - `createBot(token)` uses production adapters; `createDevBot(token)` swaps in `MockAiProvider` (others real) for local/testing.
  - Testing: Controllers are testable with mock services (see `tests/controllers.test.ts`, `src/modules/infra/mocks/ai.mock.ts`).
  - AI provider port: Controllers depend on `AiProvider` (provider-agnostic). Adapters wrap the SDK using `generate()` and `text()` internally and return `{ text }`.

- Important conventions and gotchas
  1. ESM + TypeScript: `package.json` has `"type": "module"`. Keep `.js` extensions on all relative imports so Node ESM resolves compiled files in `dist/`.
  2. Runtime & toolchain: transpile with `swc` (see `npm run build`). Dev uses `@swc-node/register` (`npm run develop`) and Nodemon (`npm run dev`).
  3. Serverless deploy expects compiled `dist/`: `serverless.yml` references `dist/modules/infra/function.handler` and excludes `src/**`. Always build first.
  4. Testing with Vitest: `npm test`, `npm run test:watch`, `npm run test:cov`.
  5. Env vars (no secrets in repo):
     - `BOT_TOKEN`, `WEBHOOK_SECRET_PATH`
     - `FREE_GAMES_PROMOTIONS_URL`, `PRODUCT_STORE_URL`
     - `OPEN_TRIVIA_DB_URL`, `VERTEXAI_API_KEY`
     - `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`
     - Optional dev toggle: `USE_MOCKS=true` to boot `createDevBot` in `src/index.ts`.
  6. Node version: `.nvmrc` pins Node; run `nvm install && nvm use`.

- Common workflows
  - Install:
    ```bash
    npm install
    ```
  - Local development (watch):
    ```bash
    npm run dev    # nodemon -> runs `npm run develop`
    # or run once without watch
    npm run develop
    # develop runs: node --import @swc-node/register/esm-register ./src/index.ts
    ```
  - Use mock AI locally (optional):
    ```bash
    USE_MOCKS=true npm run develop
    ```
  - Build (produce `dist/` for Serverless/production):
    ```bash
    npm run build  # swc ./src -q -d dist --strip-leading-paths
    ```
  - Deploy to AWS via Serverless (ensure `dist/` exists and env vars are set):
    ```bash
    npm run build
    npx serverless deploy --stage=prod
    ```
  - Webhook debugging: webhook lambda isn’t tested locally (no serverless-offline). Deploy to test real webhook behavior.

- Code patterns to follow
  - Keep `.js` in relative imports between local files:
    ```ts
    import { createControllers } from '../infra/controllers/events.controllers.js'
    import { createServiceAdapters } from '../infra/adapters/service.adapters.js'
    ```
  - Events factory and bot wiring:
    ```ts
    // events
    export const createEvents = (deps: ControllerDependencies) => {
      const controllers = createControllers(deps)
      return { longweek: controllers.longweek, /* ... */ }
    }

    // bot
    export const createBotWithDeps = (token: string, deps: ControllerDependencies) => {
      const bot = new Telegraf(token)
      const events = createEvents(deps)
      bot.command('freegames', events.freegame)
      // ... register others
      return bot
    }
    ```
  - AI usage pattern (controllers): build prompt input → `aiProvider.generate(input, { system, history? })` → use `AiResponse.text` → reply.
  - AI usage pattern (adapters): map neutral types to provider SDK → call `generate()`/chat with `systemInstruction` and `history` → map back with `text(result)`.
  - Testing pattern: use interfaces and mocks (`src/modules/infra/mocks/ai.mock.ts`) to test controllers in isolation.

- Where to look when changing behavior
  - Command registration: `src/modules/bot/bot.ts` (factories register handlers).
  - Business logic: `src/modules/infra/controllers/events.controllers.ts` (testable, DI-driven).
  - Service integration: `src/modules/infra/adapters/service.adapters.ts` (adapters + dev adapters).
  - Domains: `src/modules/freegames/*`, `src/modules/trivia/*`, `src/modules/whosplaying/*`.
  - AI port and types: `src/modules/ai/ai/provider.interface.ts` (AiProvider, ChatMessage, CommonGenerationConfig, AiResponse).
  - LLM adjustments: `src/modules/ai/ai/engine.ts`, `system.prompt.ts`, `history.ts` (history uses provider-agnostic `ChatMessage[]`).
  - Lambda/webhook: `src/modules/infra/function.ts` and `serverless.yml`.

- Tests & linting
  - Vitest with TS support (`vitest.config.ts`).
  - Run tests: `npm test`, `npm run test:watch`, `npm run test:cov`.
  - Mocks: `src/modules/infra/mocks/*.mock.ts` (e.g., `MockAiProvider`).

- Safety and secrets
  - Do not commit API keys. Use `serverless.yml` and dotenv to wire env values in CI/deploy. `serverless-dotenv-plugin` is configured.

If anything here is unclear or you’d like more detail (e.g., adding serverless-offline or a bundler), tell me what to expand and I’ll iterate.
