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

Implementations can wrap concrete SDKs (e.g., Google Generative AI):

```ts
class VertexAiProvider implements AiProvider {
  async generate(input: string, { system, history, config }: GenerateOptions = {}) {
    // Map neutral types -> provider types, call SDK, then map back to AiResponse
    const result = await generate(input, system ?? '', /* map history to vendor */ undefined)
    return { text: text(result) }
  }
}
```

## Notes
- Keep `.js` extensions in imports inside `.ts` sources for Node ESM.
- Adapters should use `text(result)` internally; controllers receive `AiResponse.text` only.