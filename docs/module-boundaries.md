# Module boundaries and public APIs

This document inventories the current source files and defines the public API surface for each logical module under `src/modules/`.

Goal
- Provide a clear mapping from existing files to module folders under `src/modules/`.
- Define exported public API (functions, types) for each module so callers rely only on these contracts.
- Provide a migration-safe wrapper (module index files) that re-exports current functions. This allows a gradual move of implementations into the module folder in later PRs.

Conventions
- Keep local relative imports with `.js` extensions in TypeScript sources (matches existing repo convention).
- Module index files live under `src/modules/<name>/index.ts` and re-export a curated public API.

Modules

1) modules/bot
- Purpose: create and configure the Telegraf bot instance.
- Files (bridging): `src/bot.ts`
- Public API:
  - `default export`: `(token: string) => Telegraf`

2) modules/events
- Purpose: command handlers / controllers for Telegram commands and callback queries.
- Files: `src/events.ts`
- Public API:
  - `longweek(ctx: Context): Promise<void>`
  - `freegame(ctx: Context): Promise<void>`
  - `trivia(ctx: Context): Promise<void>`
  - `whosplaying(ctx: Context): Promise<void>`
  - `onCallbackQuery(ctx: Context<Update.CallbackQueryUpdate>): Promise<void>`

3) modules/ai
- Purpose: LLM generation port and helpers.
- Files: `src/ai/engine.ts`, `src/ai/output.ts`, `src/ai/history.ts`, `src/ai/system.prompt.ts`
- Public API:
  - `generate(input: string, system: string, history?: Content[]): Promise<GenerateContentResult>`
  - `text(result: GenerateContentResult): string`
  - `whosplayingHistory: Content[]`
  - `triviaExpert: string`, `whosplayingExpert: string`

4) modules/freegames
- Purpose: fetch and format free game promotions
- Files: `src/freegames/freegames.service.ts`, `src/freegames/freegames.helper.ts`, `src/freegames/freegames.interface.ts`
- Public API:
  - `getFreeGames(): Promise<FreeGame[]>`
  - Helpers (pure): `freeOffers`, `toFreeGame`, `freeGameOnly`, `activeCompareFn`, `formatDate`, `gameCard`

5) modules/trivia
- Purpose: trivia question retrieval and UI helper builders
- Files: `src/trivia/trivia.service.ts`, `src/trivia/trivia.helper.ts`, `src/trivia/trivia.interface.ts`
- Public API:
  - `getQuestions(opts): Promise<Quiz[]>`
  - `display(opts?): string`
  - `mainMenu(opts?): Markup`
  - `categoryMenu`, `difficultyMenu`, `toQuiz`, `buildGnerationInput`

6) modules/whosplaying
- Purpose: Discord guild presence adapter and helpers
- Files: `src/whosplaying/guild.service.ts`, `src/whosplaying/guild.helper.ts`, `src/whosplaying/guild.interface.ts`
- Public API:
  - `getOnlineMembers(): Promise<MemberLite[]>`
  - `toMemberLite`, `isPlaying`, `isOnline`, `hasRole`, `getRoleByName`

7) modules/utils
- Purpose: misc utilities used by the bot
- Files: `src/utils.ts`
- Public API (example): `maintenance` (a command handler)

Migration notes
- These module index files are intentionally non-invasive: they re-export existing implementations (no behaviour change). Later work should move implementations into `src/modules/<name>/` and update these re-exports to keep the public API stable.

Next steps
- Create DI factory to inject adapters (AI, Discord, HTTP client) and refactor `src/events.ts` into per-module controllers that receive ports (see milestone #31).
- Implement AI provider port and mock adapters (see milestone #32).
