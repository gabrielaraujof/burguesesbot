````instructions
## BurguesesBot — Copilot instructions

Purpose: give an AI coding agent the minimal, concrete knowledge to be productive in this repository.

- Big picture
  - This is an ESM TypeScript Telegram bot (Telegraf) with two main runtimes:
    - Long-polling/local: `src/index.ts` calls `bot.launch()` (used for local dev).
    - Serverless webhook: `src/function.ts` exports a Lambda `handler` (wrapped by `serverless-http`) and is deployed via `serverless.yml` to AWS Lambda (`dist/function.handler`).
  - **New Architecture (v2.0+)**: Uses dependency injection with controllers and adapters pattern:
    - `src/bot.ts` — creates the `Telegraf` instance and registers commands/handlers.
    - `src/events.ts` — thin orchestration layer that wires adapters → controllers → bot.
    - `src/controllers/events.controllers.ts` — pure business logic handlers with injected dependencies.
    - `src/adapters/service.adapters.ts` — bridge between controllers and existing services.
    - `src/ai/*`, `src/freegames/*`, `src/trivia/*`, `src/whosplaying/*` — domain services (unchanged).

- How the new architecture works
  - **Dependency flow**: `events.ts` creates `serviceAdapters` → `controllers` → exports command handlers.
  - **Controllers** receive dependencies via constructor injection (AI service, freegames service, etc.)
  - **Adapters** wrap existing services (`getFreeGames`, `getQuestions`, etc.) to implement controller interfaces.
  - **Testing**: Controllers are now testable with mock services (see `tests/controllers.test.ts`, `src/mocks/ai.mock.ts`).
  - AI integration unchanged: `generate()` returns `GenerateContentResult`, use `text(result)` to extract response.

- Important repository conventions and gotchas (do not change unless you understand consequences)
  1. **ESM + TypeScript**: `package.json` has `"type": "module"`. Source files are TypeScript but imports reference `.js` extensions on local modules intentionally (for Node ESM runtime). Example: `src/events.ts` imports controllers with `import { createControllers } from './controllers/events.controllers.js'` — keep using `.js` in imports.
  2. **Runtime & build toolchain**: code is transpiled using `swc` (see `npm run build`). Development uses `@swc-node/register` for on-the-fly execution (`npm run develop`) and Nodemon for watch (`npm run dev` via `nodemon.json`).
  3. **Serverless deploy** expects compiled `dist/` output: `serverless.yml` references `dist/function.handler` and excludes `src/**` from package. Always run `npm run build` before deploying.
  4. **Testing with Vitest**: Run `npm test` (once), `npm run test:watch` (watch), `npm run test:cov` (coverage). Tests use dependency injection pattern — see `tests/controllers.test.ts` for examples with mock services.
  5. **Environment variables** are required for runtime integrations (no secrets in repo):
     - `BOT_TOKEN` (Telegram), `WEBHOOK_SECRET_PATH` (webhook path for serverless)
     - `FREE_GAMES_PROMOTIONS_URL`, `PRODUCT_STORE_URL` (free games service)
     - `OPEN_TRIVIA_DB_URL` (trivia API), `VERTEXAI_API_KEY` (Google Generative AI)
     - `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID` (discord presence)
  6. **Node version management**: this repo uses `nvm` to pin the Node version via a `.nvmrc` file. Before running scripts, run:
     ```bash
     nvm install && nvm use
     ```

- Common workflows (concrete commands)
  - Install:
    ```bash
    npm install
    ```
  - Local development (watch):
    ```bash
    npm run dev    # nodemon -> runs `npm run develop`
    # or run once with the same command used by develop
    npm run develop
    # develop runs: node --import @swc-node/register/esm-register ./src/index.ts
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
  - Quick runtime debug:
    - For local polling mode set `BOT_TOKEN` in env and run `npm run develop`.
    - The webhook lambda cannot be tested locally without adding serverless-offline; currently the repo uses a compiled lambda (`dist/function.handler`) and expects you to deploy to test real webhook behavior.

- Code patterns and examples agents should follow
  - **Keep `.js` in relative imports** between local files. Example from `src/events.ts`:
    ```ts
    import { createControllers } from './controllers/events.controllers.js'
    import { createServiceAdapters } from './adapters/service.adapters.js'
    ```
  - **Dependency injection pattern** for controllers (example from `src/controllers/events.controllers.ts`):
    ```ts
    export const createWhosplayingController = (deps: { 
      aiService: AiService, whosplayingService: WhosplayingService 
    }) => {
      return async (ctx: Context) => {
        const members = await deps.whosplayingService.getOnlineMembers()
        const message = text(await deps.aiService.generate(...))
        await ctx.reply(message)
      }
    }
    ```
  - **AI usage pattern**: Build prompt input → `generate(input, system, history?)` → `text(generatedMessage)` → reply.
  - **Testing pattern**: Use interfaces and mock implementations (see `src/mocks/ai.mock.ts`) to test controllers in isolation.
  - **Module organization**: Follow `src/modules/*/index.ts` pattern for public APIs when adding new domains.

- Where to look first when changing behavior
  - **Command registration**: `src/bot.ts` registers handlers, `src/events.ts` wires dependencies to controllers.
  - **Business logic**: `src/controllers/events.controllers.ts` contains testable command handlers.
  - **Service integration**: `src/adapters/service.adapters.ts` wraps domain services for dependency injection.
  - **External integrations**: `src/freegames/*`, `src/trivia/*`, `src/whosplaying/*` (domain services unchanged).
  - **LLM adjustments**: `src/ai/engine.ts` (Google Generative AI), `src/ai/system.prompt.ts`, `src/ai/history.ts`.
  - **Lambda/webhook changes**: `src/function.ts` and `serverless.yml` (packaging and env mapping).

- Tests & linting
  - **Vitest testing framework** with full TypeScript support and coverage (`vitest.config.ts`).
  - **Run tests**: `npm test` (once), `npm run test:watch` (watch), `npm run test:cov` (coverage).
  - **Mock services**: Use interfaces (`AiService`, `FreeGamesService`, etc.) and mocks (`src/mocks/*.mock.ts`) for testing.
  - **Test structure**: Controllers are tested in isolation with injected mock dependencies.

- Safety and secrets
  - Do not commit API keys. Use `serverless.yml` and dotenv to wire env values in CI/deploy. `serverless-dotenv-plugin` is configured.

If anything in this document is unclear or you'd like more detail on a specific area (local webhook testing, adding serverless-offline, or migrating imports), tell me which area to expand and I will iterate.
