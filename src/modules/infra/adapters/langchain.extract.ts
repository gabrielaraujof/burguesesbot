import type { ProviderContent, StreamChunk } from './langchain.types.js'

function pluckText(content: ProviderContent): string {
  if (content == null) return ''
  if (typeof content === 'string') return content
  if (Array.isArray(content)) return content.map((c) => pluckText(c as ProviderContent)).join('')
  if (typeof content === 'object') {
    const asAny = content as any
    if (typeof asAny.text === 'string') return String(asAny.text)
    if (asAny.content !== undefined) return pluckText(asAny.content)
    if (asAny.delta !== undefined) return pluckText(asAny.delta)
    return ''
  }
  return ''
}

export function extractTextContent(content: ProviderContent): string {
  return pluckText(content)
}

export function chunkToText(chunk: StreamChunk): string {
  if (typeof chunk === 'string') return chunk
  const asAny = chunk as any
  if (asAny && typeof asAny.text === 'string') return String(asAny.text)
  if (asAny && asAny.content !== undefined) return extractTextContent(asAny.content)
  if (asAny && asAny.delta !== undefined) return extractTextContent(asAny.delta)
  return ''
}
