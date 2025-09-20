import { z } from 'zod'

export const TriviaExplanationSchema = z.object({
  explanation: z.string().min(1).max(600),
  fun_fact: z.string().optional(),
  difficulty_tag: z.enum(['easy', 'medium', 'hard']).optional(),
})

export type TriviaExplanation = z.infer<typeof TriviaExplanationSchema>

export function buildTriviaJsonInstruction() {
  return `Output STRICTLY as compact JSON with keys: explanation (string), fun_fact (optional string), difficulty_tag (optional enum easy|medium|hard). No markdown, no prose.`
}

export function safeParseTriviaExplanation(text: string): TriviaExplanation | null {
  try {
    const cleaned = extractJson(text)
    const json = JSON.parse(cleaned)
    const parsed = TriviaExplanationSchema.safeParse(json)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

function extractJson(input: string): string {
  const fence = /```(?:json)?\s*([\s\S]*?)\s*```/i
  const m = fence.exec(input)
  if (m && m[1]) return m[1]
  // try to find first { ... } balanced block quickly
  const start = input.indexOf('{')
  const end = input.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) return input.slice(start, end + 1)
  return input
}
