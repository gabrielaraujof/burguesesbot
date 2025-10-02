---
applyTo: "**/src/modules/trivia/**"
---

# Trivia module rules

- Use the `TriviaProvider` port; services/controllers should not call external APIs directly.
- Validate inputs (amount, difficulty, category) and default sensibly.
- Treat provider/network failures as recoverable; return friendly messages and avoid throwing in controllers.
- Test with `MockTriviaProvider`; include zero-questions and invalid-params cases.
- Keep transformations (mapping provider → domain types) inside adapters.

See also: [Providers](../../docs/providers.md)
