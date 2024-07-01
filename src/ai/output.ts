import type { GenerateContentResult } from '@google/generative-ai'

export const text = (result: GenerateContentResult) => result.response.text()
