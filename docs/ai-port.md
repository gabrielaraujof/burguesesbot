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

An adapter maps the neutral `AiProvider` contract to a specific vendor SDK. The production implementation is `VertexAiProviderAdapter` (Google Generative AI / Gemini) which handles:

1. Mapping `ChatMessage[]` (user/assistant roles) to vendor `Content[]` (user/model).
2. Mapping `system` → `systemInstruction`.
3. Translating `CommonGenerationConfig` → vendor `GenerationConfig` (temperature, topP, topK, maxTokens, stopSequences).
4. Enforcing a timeout (`AI_TIMEOUT_MS`, default 10s) via an `AbortController` pattern.
5. Normalizing errors to an `AiError` with codes: `timeout`, `rate_limited`, `unauthorized`, `blocked`, `network`, `internal`.
6. Light exponential backoff retry for transient `rate_limited` and `network` errors.

Example (abridged) — details live in `src/modules/infra/adapters/service.adapters.ts`:

```ts
class VertexAiProviderAdapter implements AiProvider {
  async generate(input: string, options?: GenerateOptions): Promise<AiResponse> {
    const history = options?.history ? mapHistory(options.history) : undefined
    const config = buildGenerationConfig(options?.config)
    const result = await withTimeout(() => sdkSend(modelArgs), timeoutMs)
    return { text: text(result) }
  }
}
```

## Error Handling

Errors are wrapped in `AiError` where `error.code` is one of the enumerated codes. Callers (controllers) currently log and proceed; future enhancements (#57) will surface richer metadata / streaming.

## Notes
- Keep `.js` extensions in all relative imports (ESM runtime resolution).
- Only the adapter touches vendor SDK types; controllers stay provider-agnostic.
- Use `AiResponse.text` only in higher layers to keep the contract stable.