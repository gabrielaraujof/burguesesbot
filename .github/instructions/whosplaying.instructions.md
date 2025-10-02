---
applyTo: "**/src/modules/whosplaying/**"
---

# Whosplaying module rules

- Keep Discord presence behind the service interface; no direct `discord.js` usage outside adapters.
- Controllers remain pure and DI-based; query presence via the service port.
- Handle rate limits/timeouts as adapter concerns; surface normalized errors/results to services.
- Prefer small, typed DTOs for guild/member presence; avoid leaking SDK shapes.
- Write tests using mocks/fakes for presence data; cover empty guild and permission errors.

See also: [Module boundaries](../../docs/module-boundaries.md)
