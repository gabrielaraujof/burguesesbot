import type { ChatMessage, GenerateOptions } from '../../ai/index.js'
import { HumanMessage, SystemMessage, AIMessage, type BaseMessage } from '@langchain/core/messages'
import type { ModelParams } from './langchain.types.js'

export function mapHistory(history?: ChatMessage[]): BaseMessage[] {
  if (!history || history.length === 0) return [] as BaseMessage[]
  const mapped: BaseMessage[] = []
  for (const m of history) {
    if (m.role === 'user') mapped.push(new HumanMessage(m.content))
    else if (m.role === 'assistant') mapped.push(new AIMessage(m.content))
  }
  return mapped
}

export function toModelParams(options?: GenerateOptions): ModelParams {
  const cfg = options?.config
  const params: ModelParams = {}
  if (!cfg) return params
  if (cfg.temperature != null) params.temperature = cfg.temperature
  if (cfg.maxTokens != null) params.maxOutputTokens = cfg.maxTokens
  if (cfg.topP != null) params.topP = cfg.topP
  if (cfg.topK != null) params.topK = cfg.topK
  if (cfg.stopSequences) params.stopSequences = cfg.stopSequences
  return params
}

export function buildMessages(input: string, options?: GenerateOptions): BaseMessage[] {
  const messages: BaseMessage[] = []
  if (options?.system) messages.push(new SystemMessage(options.system))
  messages.push(...mapHistory(options?.history))
  messages.push(new HumanMessage(input))
  return messages
}
