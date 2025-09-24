---
applyTo: "**/src/modules/ai/**"
---

# AI module rules

- Prefer streaming (`if (provider.generateStream) for await (...)`) and fall back to `generate`.
- Normalize provider failures to `AiError` codes: `timeout`, `rate_limited`, `unauthorized`, `blocked`, `network`, `internal`.
- Keep adapters behind ports; no direct SDK usage in controllers.
- Never expose secrets/keys in code or logs; handle I/O with try/catch.
- Return small, typed results; avoid leaky abstractions between engine and services.

See also: [AI ports and providers](../../docs/ai-port.md)
