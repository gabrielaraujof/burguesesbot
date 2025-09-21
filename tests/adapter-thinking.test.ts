import { describe } from 'vitest'

// Legacy test for thinking-config detection that applied to the removed direct Google adapter.
// The current adapter is LangChain-based and does not expose `supportsThinkingConfig` on the public `AiProvider`.
describe.skip('supportsThinkingConfig (legacy - removed)', () => {
  // kept as archival reference
})
