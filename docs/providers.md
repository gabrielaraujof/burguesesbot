# Provider Ports: Trivia and FreeGames

This document introduces provider interfaces that decouple domain services from external APIs and enable easy mocking.

## FreeGamesProvider

- Interface: `FreeGamesProvider`
- Method: `getPromotions(): Promise<FreeGamesPromotionsResponse>`
- Mock: `MockFreeGamesProvider`

Example
```ts
import { MockFreeGamesProvider } from '../src/modules/freegames/index.js'

const provider = new MockFreeGamesProvider({
  data: { Catalog: { searchStore: { elements: [], paging: { count: 0, total: 0 } } } }
} as any)

const res = await provider.getPromotions()
```

## TriviaProvider

- Interface: `TriviaProvider`
- Method: `getQuestions(params: { amount?, difficulty?, category? }): Promise<TriviaResponse>`
- Mock: `MockTriviaProvider`

Example
```ts
import { MockTriviaProvider } from '../src/modules/trivia/index.js'

const provider = new MockTriviaProvider({ response_code: 0, results: [] })
const res = await provider.getQuestions({ amount: 1 })
```

## Usage

- These ports don’t replace existing services yet; they pave the way to inject providers under adapters (`createServiceAdapters`) and to use mocks in `createDevServiceAdapters`.
- Future work may refactor services to depend on these providers internally.
