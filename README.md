# BurguesesBot

An ESM TypeScript Telegram bot built with Telegraf, deployed to AWS Lambda via Serverless, and organized as a modular monolith with dependency injection.

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

## Testing

```bash
npm test           # run once
npm run test:watch # watch mode
npm run test:cov   # with coverage
```

Controllers are tested with mock services (see `src/modules/infra/mocks/ai.mock.ts`).

## License

[MIT](LICENSE)

