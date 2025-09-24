## BurguesesBot — Copilot Instructions (concise)

- Context: ESM TypeScript Telegraf bot on AWS Lambda (Serverless). Uses long polling locally.
- Architecture: Respect DI boundaries—controllers depend on ports; adapters implement ports. Keep controllers small/pure and avoid infra coupling.
- Adding features: Create services behind ports, wire via `createServiceAdapters`, and only touch `events.ts` to register new commands.
- AI: Prefer streaming (`if (provider.generateStream) for await (...)`) else `generate`. Normalize provider failures to `AiError` codes: `timeout`, `rate_limited`, `unauthorized`, `blocked`, `network`, `internal`.
- Integrations: Telegram commands in `createBotWithDeps` are `freegames`, `semanalonga`, `trivia`, `whosplaying`, plus callback queries. `whosplaying` Discord presence goes through the service interface.
- Code style: KISS, DRY, YAGNI. Descriptive names. Single responsibility. Comment “why,” not “what.” Prefer small, readable functions over cleverness.
- Error handling: Assume I/O can fail. Use structured handling (try/catch or Result-like) and map provider errors to `AiError`.
- Testing: Use Vitest (AAA). Mock external deps (network/SDKs). Cover happy path and edge cases.
- Response prefs: Be concise. Generate complete, idiomatic ESM TypeScript. Don’t introduce unrequested features or heavy formatting; include minimal wiring notes when multiple files change.

Whitespace is ignored; keep these bullets as-is for reliability.

