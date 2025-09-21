# AI Port — Streaming and Normalized Errors

This project defines a provider-agnostic `AiProvider` port that supports standard text generation and optional streaming, along with normalized error codes for consistent handling across providers.

## Interface

```
export interface AiProvider {
  generate(input: string, options?: GenerateOptions): Promise<AiResponse>
  generateStream?(input: string, options?: GenerateOptions): AsyncIterable<string>
}
```

`generateStream` is optional; consumers should feature-detect (`if (provider.generateStream)`) and fall back to `generate` when not available.

## Error Normalization

Providers throw `AiError` with `code` in:

- `timeout`
- `rate_limited`
- `unauthorized`
- `blocked`
- `network`
- `internal`

Adapters should map provider SDK errors to these codes, enabling consistent retries and UI feedback.

## Implementations

- LangChain (default): `LangChainGenAiProviderAdapter` using `@langchain/google-genai`.

LangChain is used as the project's default provider for all AI-powered commands. It delegates to the Google Generative models under the hood when configured with `GEMINI_API_KEY`.

Both adapters (historical) support:

- `system` prompts
- conversation `history` (best-effort mapping)
- streaming via `generateStream` and graceful fallback

## Example (stream consumption)

```
const provider: AiProvider = createProvider()
if (provider.generateStream) {
  for await (const token of provider.generateStream('Tell me a joke')) {
    process.stdout.write(token)
  }
} else {
  const { text } = await provider.generate('Tell me a joke')
  console.log(text)
}
```
# AI Provider Port (`AiProvider`)

This document describes the AI provider port and how to use it inside controllers/adapters.

## Interface

```ts
export type Role = 'system' | 'user' | 'assistant'

export type ChatMessage = {
  role: Role
  content: string
}

export type CommonGenerationConfig = {
  temperature?: number
  topP?: number
  topK?: number
  maxTokens?: number
  stopSequences?: string[]
}

export type GenerateOptions = {
  system?: string
  history?: ChatMessage[]
  config?: CommonGenerationConfig
}

export type AiResponse = {
  text: string
}

export interface AiProvider {
  generate(input: string, options?: GenerateOptions): Promise<AiResponse>
}
```

- `input`: user/content string to send to the model.
- `options.system`: system prompt (when the provider supports it).
- `options.history`: prior conversation history.
- `options.config`: provider-agnostic generation config; providers may ignore unsupported fields.

## Usage in controllers

Inject something implementing `AiProvider` and call `generate(...)`. Receive plain text via `AiResponse.text`.

```ts
const controller = (deps: { ai: AiProvider }) => async (ctx: Context) => {
  const result = await deps.ai.generate(JSON.stringify(payload), {
    system: systemPrompt,
    history,
  })
  await ctx.reply(text(result))
}
```

## Adapters

An adapter maps the neutral `AiProvider` contract to a specific vendor SDK. The current production implementation is `LangChainGenAiProviderAdapter` (see `src/modules/infra/adapters/langchain.adapter.ts`) which:

1. Maps `ChatMessage[]` (user/assistant roles) to LangChain message types.
2. Includes `system` messages when provided.
3. Translates `CommonGenerationConfig` → provider params (`temperature`, `maxOutputTokens`, `topP`, `topK`, `stopSequences`).
4. Enforces request timeouts via an `AbortController` pattern and normalizes errors to `AiError` codes.

Example (abridged) — details live in `src/modules/infra/adapters/langchain.adapter.ts`:

```ts
// LangChain-based adapter: uses ChatGoogleGenerativeAI and supports streaming via model.stream(...)
```

## Error Handling

Errors are wrapped in `AiError` where `error.code` is one of the enumerated codes. Callers (controllers) currently log and proceed; future enhancements (#57) will surface richer metadata / streaming.

## Notes
- Keep `.js` extensions in all relative imports (ESM runtime resolution).
- Only the adapter touches vendor SDK types; controllers stay provider-agnostic.
- Use `AiResponse.text` only in higher layers to keep the contract stable.