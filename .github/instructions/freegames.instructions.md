---
applyTo: "**/src/modules/freegames/**"
---

# FreeGames module rules

- Depend on the `FreeGamesProvider` port; keep controllers/services provider-agnostic.
- Implement provider adapters under the module; do not leak raw API types past the adapter.
- Handle I/O failures gracefully: return safe empty results and log context; no crashes.
- Write tests with `MockFreeGamesProvider`; cover empty/no-promo cases.
- Any retries/backoff/rate limits belong in the adapter, not in controllers/services.

See also: [Providers](../../docs/providers.md)
