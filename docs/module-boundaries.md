# Module boundaries and public APIs

This document inventories the source files and defines the public API surface for each logical module under `src/modules/` after the DI factory refactor.

Goal
- Map files to module folders under `src/modules/`.
- Define exported public API (functions, types) so callers rely only on these contracts.
- Keep `.js` extensions on relative imports for Node ESM runtime.

Conventions
- Local relative imports include `.js` extensions.
- Module index files live under `src/modules/<name>/index.ts` and re-export a curated public API.

Modules

1) modules/bot
- Purpose: create and configure the Telegraf bot instance using dependency injection.
- Files: `src/modules/bot/bot.ts`, `src/modules/bot/index.ts`
- Public API:
  - `createBotWithDeps(token: string, deps: ControllerDependencies): Telegraf`
  - `createBot(token: string): Telegraf` (production adapters)
  - `createDevBot(token: string): Telegraf` (mock AI + real services)

2) modules/events
- Purpose: expose command handlers constructed from injected controllers.
- Files: `src/modules/events/events.ts`, `src/modules/events/index.ts`
- Public API:
  - `createEvents(dependencies: ControllerDependencies)` returning:
    - `longweek(ctx: Context): Promise<void>`
    - `freegame(ctx: Context): Promise<void>`
    - `trivia(ctx: Context): Promise<void>`
    - `whosplaying(ctx: Context): Promise<void>`
    - `onCallbackQuery(ctx: Context<Update.CallbackQueryUpdate>): Promise<void>`

3) modules/infra (controllers, adapters, utils)
- Purpose: orchestration and DI wiring surfaces.
- Files:
  - Controllers: `src/modules/infra/controllers/events.controllers.ts`
  - Adapters: `src/modules/infra/adapters/service.adapters.ts`
  - Mocks: `src/modules/infra/mocks/ai.mock.ts`
  - Utils: `src/modules/infra/utils.ts`
- Public API:
  - Controllers factory: `createControllers(deps)`
  - Adapters factories: `createServiceAdapters()`, `createDevServiceAdapters()`
  - Types: `AiService`, `FreeGamesService`, `TriviaService`, `WhosplayingService`, `ControllerDependencies`
  - Utils: `maintenance(ctx)`

4) modules/ai
- Purpose: LLM generation and helpers.
- Files: `src/modules/ai/ai/engine.ts`, `src/modules/ai/ai/output.ts`, `src/modules/ai/ai/history.ts`, `src/modules/ai/ai/system.prompt.ts`, `src/modules/ai/index.ts`
- Public API:
  - `generate(input: string, system: string, history?: Content[]): Promise<GenerateContentResult>`
  - `text(result: GenerateContentResult): string`
  - `whosplayingHistory: Content[]`
  - `triviaExpert: string`, `whosplayingExpert: string`

5) modules/freegames
- Purpose: fetch and format free game promotions
- Files: `src/modules/freegames/freegames/*`, `src/modules/freegames/index.ts`
- Public API:
  - `getFreeGames(): Promise<FreeGame[]>`
  - Helpers (pure): `freeOffers`, `toFreeGame`, `freeGameOnly`, `activeCompareFn`, `formatDate`, `gameCard`

6) modules/trivia
- Purpose: trivia question retrieval and UI helper builders
- Files: `src/modules/trivia/trivia/*`, `src/modules/trivia/index.ts`
- Public API:
  - `getQuestions(opts): Promise<Quiz[]>`
  - `display(opts?): string`
  - `mainMenu(opts?): Markup`
  - `categoryMenu`, `difficultyMenu`, `toQuiz`, `buildGnerationInput`

7) modules/whosplaying
- Purpose: Discord guild presence adapter and helpers
- Files: `src/modules/whosplaying/whosplaying/*`, `src/modules/whosplaying/index.ts`
- Public API:
  - `getOnlineMembers(): Promise<MemberLite[]>`
  - `toMemberLite`, `isPlaying`, `isOnline`, `hasRole`, `getRoleByName`

8) modules/infra/function (lambda)
- Purpose: serverless webhook entrypoint
- Files: `src/modules/infra/function.ts`
- Public API:
  - `handler(event, context, cb)`

Notes
- `src/index.ts` selects `createBot` (prod) or `createDevBot` (dev) based on `USE_MOCKS=true` and calls `bot.launch()` for long polling.
