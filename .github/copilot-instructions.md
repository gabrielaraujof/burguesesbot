## BurguesesBot Instructions

Your primary goal is to generate code that is **clean, maintainable, robust, and easy to understand**. Adhere strictly to the following principles and practices in all your suggestions.
This is a ESM TypeScript Telegram bot (Telegraf) with simple DI. Runs on AWS Lambda (Serverless) and uses long polling locally.

---

## 📜 Core Philosophy

* **KISS (Keep It Simple, Stupid):** Always prefer the simplest, most straightforward solution that works. Avoid unnecessary complexity, clever "tricks," or over-engineering. Readability is paramount.
* **DRY (Don't Repeat Yourself):** Actively identify repeated patterns or logic. When you see duplication, suggest abstracting it into a reusable function, class, or module.
* **YAGNI (You Ain't Gonna Need It):** Do not suggest code for functionality that hasn't been explicitly requested or implied by the immediate context. Focus only on solving the current problem.

---

## 💻 Code-Level Practices

* **Descriptive Naming:** Use clear, unambiguous, and self-documenting names for variables, functions, classes, and methods. For example, prefer `isUserEligibleForDiscount` over `checkUser` or `flag`.
* **Single Responsibility:** Generate functions and classes that are small and focused. A function should perform one logical operation. A class should have only one primary reason to change.
* **Commenting:**
	* Do not add comments that explain *what* the code is doing. The code should be clear enough to explain itself.
	* **DO** add comments to explain the *why*—the business logic, compromises, or complex algorithms that aren't immediately obvious from the code.
* **Error Handling:** Always assume operations can fail. For any code that involves I/O, network requests, or other fallible operations, proactively include robust error-handling mechanisms (e.g., `try...catch`, `Result` types, `Go's err` pattern).

---

## 🏛️ Architectural Principles (SOLID)

* **Single Responsibility Principle (S):** Ensure that any class you generate or modify has a single, well-defined purpose.
* **Open/Closed Principle (O):** When asked to add functionality, prefer to do so by extending existing behavior rather than modifying stable, existing code. Suggest solutions using interfaces, inheritance, or composition.
* **Liskov Substitution Principle (L):** When generating subclasses or implementations of an interface, ensure they are fully substitutable for their parent type without altering the correctness of the program.
* **Interface Segregation Principle (I):** Prefer generating several smaller, client-specific interfaces over one large, general-purpose one.
* **Dependency Inversion Principle (D):** Generate code that depends on abstractions (like interfaces or abstract classes), not on concrete implementations. This is crucial for creating decoupled, testable code.

---

## ✅ Testing & Quality Assurance

* **Generate Tests:** When I create a new function or a significant piece of logic, you should proactively suggest corresponding unit tests.
* **Comprehensive Tests:** Your suggested tests should cover not just the "happy path" but also edge cases, invalid inputs, and potential failure modes.
* **Follow Testing Patterns:** Adhere to common testing patterns like Arrange-Act-Assert (AAA).
* **Mocking & Stubbing:** When tests involve external dependencies (like network calls or databases), suggest using mocks or stubs to isolate the unit under test.

---

## Essentials to keep
* **Keep DI boundaries**: controllers depend on ports; adapters provide implementations.
* **Prefer streaming** when available (`if (provider.generateStream) for await (...)`), fallback to `generate`.
* **Normalize AI errors** via `AiError` codes: `timeout`, `rate_limited`, `unauthorized`, `blocked`, `network`, `internal`.

---

## Integrations map
- Telegram commands registered in `createBotWithDeps`: `freegames`, `semanalonga`, `trivia`, `whosplaying`, plus callback queries.
- FreeGames/Trivia/Whosplaying: domain logic stays at controller boundary; providers live under each module and are invoked via infra adapters.
- Discord presence for `whosplaying` uses `discord.js` behind the service interface.

---

## Adding features
- Add new services behind ports, wire them via `createServiceAdapters`, and thread through controller deps.
- Keep controller logic small and DI-friendly; update `events.ts` only when introducing new commands.


By following these instructions, you will act as a true partner in building a high-quality, professional-grade codebase.

