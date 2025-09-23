// Shared type definitions extracted from langchain.adapter.ts to reduce file complexity
export type ProviderTextChunk =
  | string
  | { text?: string }
  | { content?: ProviderContent }
  | { delta?: ProviderContent }

export type ProviderContent =
  | Array<string | { text?: string } | { content?: ProviderContent } | { delta?: ProviderContent }>
  | string
  | { text?: string }
  | null
  | undefined

export type Usage = { promptTokens?: number; completionTokens?: number; totalTokens?: number } | Record<string, number>

export type ProviderResponse = { content?: ProviderContent; usage?: Usage }

export type StreamChunk = { content?: ProviderContent } | { delta?: ProviderContent } | { text?: string } | string

export interface ModelParams {
  temperature?: number
  maxOutputTokens?: number
  topP?: number
  topK?: number
  stopSequences?: string[]
}
