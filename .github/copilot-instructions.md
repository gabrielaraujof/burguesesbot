## BurguesesBot — Copilot instructions

Purpose: give an AI coding agent the minimal, concrete knowledge to be productive in this repository.

- Big picture
  - This is an ESM TypeScript Telegram bot (Telegraf) with two main runtimes:
    - Long-polling/local: `src/index.ts` calls `bot.launch()` (used for local dev).
    - Serverless webhook: `src/function.ts` exports a Lambda `handler` (wrapped by `serverless-http`) and is deployed via `serverless.yml` to AWS Lambda (`dist/function.handler`).
  - Key components:
    - `src/index.ts` — entry for long-polling/local runs.
    - `src/bot.ts` — creates the `Telegraf` instance and registers commands/handlers.
    - `src/events.ts` — command handlers and callback logic (core business flows).
    - `src/function.ts` — lambda webhook adapter for deployment.
    - `src/ai/*` — LLM integration helpers (`engine.ts`, `history.ts`, `output.ts`, `system.prompt.ts`).
    - `src/freegames/*`, `src/trivia/*`, `src/whosplaying/*` — domain services for integrations.

- How the pieces talk
  - `events.ts` orchestrates flows: it calls services (`getFreeGames`, `getQuestions`, `getOnlineMembers`) and the AI layer (`generate` in `src/ai/engine.ts`).
  - AI `generate` returns a `GenerateContentResult`; `src/ai/output.ts` exposes `text(result)` which returns the plain text response.
  - `whosplaying` uses `discord.js` (see `src/whosplaying/guild.service.ts`) to log in and fetch member presences.

- Important repository conventions and gotchas (do not change unless you understand consequences)
  1. ESM + TypeScript: `package.json` has `"type": "module"`. Source files are TypeScript but imports reference `.js` extensions on local modules intentionally (for Node ESM runtime). Example: `src/index.ts` imports the bot with `import createBot from './bot.js'` — keep using `.js` in imports so runtime paths match after compilation.
  2. Runtime & build toolchain: code is transpiled using `swc` (see `npm run build`). Development uses `@swc-node/register` for on-the-fly execution (`npm run develop`) and Nodemon for watch (`npm run dev` via `nodemon.json`).
  3. Serverless deploy expects compiled `dist/` output: `serverless.yml` references `dist/function.handler` and excludes `src/**` from package. Always run `npm run build` before deploying.
  4. Environment variables are required for runtime integrations (no secrets in repo):
     - `BOT_TOKEN` (Telegram)
     - `WEBHOOK_SECRET_PATH` (webhook path for serverless)
     - `FREE_GAMES_PROMOTIONS_URL`, `PRODUCT_STORE_URL` (free games service)
     - `OPEN_TRIVIA_DB_URL` (trivia API)
     - `VERTEXAI_API_KEY` (Google Generative AI)
     - `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID` (discord presence)
  5. Node version management: this repo uses `nvm` to pin the Node version via a `.nvmrc` file. Before running scripts or building, run:
     ```bash
     nvm install   # installs the version in .nvmrc if missing
     nvm use       # switches to the repository Node version
     ```
     The Serverless provider uses `nodejs20.x` at runtime; `.nvmrc` should match the intended local Node version for development.

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
  - Keep `.js` in relative imports between local files. Example from `src/bot.ts` usage:
    ```ts
    import { longweek, freegame } from './events.js'
    // register
    bot.command('freegames', freegame)
    ```
  - AI usage pattern (example from `src/events.ts`):
    - Build prompt input: `buildGnerationInput(quiz)` (see `src/trivia/trivia.helper.ts`).
    - Call `generate(input, system, history?)` from `src/ai/engine.ts`.
    - Convert generated result: `const message = text(generatedMessage)` and send with `ctx.reply(message)`.
  - When creating new modules, follow the existing folder structure and export style (mostly named exports; `src/bot.ts` uses default export for factory).

- Where to look first when changing behavior
  - Command registration and small behavior changes: `src/bot.ts` and `src/events.ts`.
  - External integrations: `src/freegames/*`, `src/trivia/*`, `src/whosplaying/*`.
  - LLM adjustments: `src/ai/engine.ts`, `src/ai/system.prompt.ts`, and `src/ai/history.ts`.
  - Lambda/webhook changes: `src/function.ts` and `serverless.yml` (packaging and env mapping).

- Tests & linting
  - There are no automated tests or lint rules in the repo (see `package.json` scripts: tests are placeholders). Do not assume a test harness exists.

- Safety and secrets
  - Do not commit API keys. Use `serverless.yml` and dotenv to wire env values in CI/deploy. `serverless-dotenv-plugin` is configured.

If anything in this document is unclear or you'd like more detail on a specific area (local webhook testing, adding serverless-offline, or migrating imports), tell me which area to expand and I will iterate.
