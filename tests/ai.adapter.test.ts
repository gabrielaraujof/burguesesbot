import { describe } from 'vitest'

// Legacy tests for the removed direct Google GenAI adapter.
// The production code now uses the LangChain adapter by default: `src/modules/infra/adapters/langchain.adapter.ts`
// Keep this file as an archival skipped test to document the previous coverage; do not run.

describe.skip('GoogleGenAiProviderAdapter (legacy - removed)', () => {
  // Intentionally empty - adapter removed. See `langchain.adapter.ts` for current implementation and tests.
})
