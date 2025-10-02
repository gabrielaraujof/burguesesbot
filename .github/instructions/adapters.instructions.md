---
applyTo: "**/src/modules/infra/**"
---

# Infra/Adapters rules

- Implement ports in adapters; do not add controller logic here.
- Wire implementations via `createServiceAdapters`; keep wiring minimal and explicit.
- Map provider errors to `AiError` codes; never leak raw SDK errors.
- Keep types small and explicit; avoid broad `any` and overexposed interfaces.
- No secrets in code or logs; isolate network/SDK calls and handle retries/timeouts deliberately.

See also: [Providers](../../docs/providers.md) • [Module boundaries](../../docs/module-boundaries.md)
