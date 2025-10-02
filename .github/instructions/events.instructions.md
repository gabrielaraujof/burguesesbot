---
applyTo: "**/src/modules/events/**"
---

# Events module rules

- Keep controllers small and DI-friendly: depend on ports, not concrete adapters.
- Register new Telegram commands in `events.ts` only when adding commands; no unrelated edits.
- Avoid infra coupling (network/SDK calls) in controllers; delegate via services.
- Prefer small, readable handlers; comment “why,” not “what.”
- Assume I/O can fail; handle errors and return safe messages.

See also: [Module boundaries](../../docs/module-boundaries.md)
