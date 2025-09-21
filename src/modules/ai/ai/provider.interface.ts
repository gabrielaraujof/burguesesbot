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
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  } | Record<string, any>
}

export interface AiProvider {
  generate(input: string, options?: GenerateOptions): Promise<AiResponse>
  generateStream?(
    input: string,
    options?: GenerateOptions,
  ): AsyncIterable<string>
}
