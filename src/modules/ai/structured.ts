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
    const json = JSON.parse(text)
    const parsed = TriviaExplanationSchema.safeParse(json)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
