import { describe, it, expect } from 'vitest'
import { renderLongweekPrompt, renderWhosplayingPrompt, renderTriviaExplanationPrompt } from '../src/modules/ai/prompts.js'

describe('Prompt builders', () => {
  it('renders longweek prompt with system and input', async () => {
    const rendered = await renderLongweekPrompt({ mood: 'relaxar', extra: 'um pouco' })
    expect(rendered.system).toBeTruthy()
    expect(rendered.input).toContain('relaxar')
    expect(rendered.input).toContain('um pouco')
  })

  it('renders whosplaying with history and JSON', async () => {
    const rendered = await renderWhosplayingPrompt({
      membersJson: JSON.stringify([{ name: 'Alice', game: 'Valorant' }]),
      history: [
        { role: 'user', content: 'Quem está jogando?' },
        { role: 'assistant', content: 'Vou verificar' },
      ],
    })
    expect(rendered.system).toBeTruthy()
    expect(rendered.input).toMatch(/Valorant/)
  })

  it('renders trivia explanation with format instructions', async () => {
    const rendered = await renderTriviaExplanationPrompt({
      quizInput: 'Pergunta: 2+2=?',
      formatInstructions: 'Responda em JSON com campos {"explanation": string}',
    })
    expect(rendered.system).toBeTruthy()
    expect(rendered.input).toContain('Pergunta: 2+2=?')
    expect(rendered.input).toContain('Responda em JSON')
  })
})
