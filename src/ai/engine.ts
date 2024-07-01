import {
  GoogleGenerativeAI,
  type Content,
  type GenerationConfig,
} from '@google/generative-ai'

const apiKey = process.env.VERTEXAI_API_KEY ?? ''
const genAI = new GoogleGenerativeAI(apiKey)

const generationConfig: GenerationConfig = {
  temperature: 0.75,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 250,
  responseMimeType: 'text/plain',
}

export function generate(input: string, system: string, history?: Content[]) {
  console.log(`Generating text with LLM model...`)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: system,
  })
  const chatSession = model.startChat({ generationConfig, history })
  return chatSession.sendMessage(input)
}
