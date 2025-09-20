# Prompt templates (LangChain.js)

We centralize prompts using LangChain `ChatPromptTemplate`/`PromptTemplate` to improve reusability, safety, and consistency.

Key patterns
- Use `ChatPromptTemplate.fromMessages([...])` with tuples like `["system", "..."]`, `["human", "..."]`.
- Use `MessagesPlaceholder("history")` to inject past messages.
- Avoid literal `{`/`}` in template strings; pass large JSON via variables like `{membersJson}`.
- Use `partial()` to inject static sections (e.g., structured output `format_instructions`).
 - For Trivia explanations, we always compose with PipelinePromptTemplate (persona → examples → task) and include two few-shot examples.

Locations
- Builders: `src/modules/ai/prompts.ts`
- Usage: `src/modules/infra/controllers/events.controllers.ts`

Examples
- Longweek: `renderLongweekPrompt({ mood, extra })`
- Whosplaying: `renderWhosplayingPrompt({ membersJson, history })`
- Trivia: `renderTriviaExplanationPrompt({ quizInput, formatInstructions })`

Extending
- Consider `FewShotChatMessagePromptTemplate` to add examples, or `PipelinePromptTemplate` to compose sections.
- Keep persona/system text inside the template to avoid drift vs. controller options.

Few-shot
- Trivia explanations include two in-template examples to guide tone and structure for wrong answers. This is always enabled.

RAG/pipeline (overview)
- RAG: Retrieve context (e.g., stored FAQs about the channel or game descriptions) and inject via `{context}` into a composed prompt. Useful for consistent facts or dynamic game details.
- PipelinePromptTemplate: We standardize on composing persona → examples → user task to allow reusing shared sections and swapping parts without touching controllers.
