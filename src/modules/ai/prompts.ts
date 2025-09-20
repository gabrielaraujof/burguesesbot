import { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate, PipelinePromptTemplate } from '@langchain/core/prompts'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { getPersonaForCommand } from './index.js'

export type PromptRender = {
  system?: string
  input: string
}

export function mapHistoryToLcMessages(history?: Array<{ role: string; content: string }>) {
  if (!history || history.length === 0) return [] as (AIMessage | HumanMessage)[]
  return history.map((m) => (m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)))
}

export async function renderLongweekPrompt(vars?: { mood?: string; extra?: string }): Promise<PromptRender> {
  const system = getPersonaForCommand('longweek')
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', system],
    [
      'human',
      'A semana foi tão longa e cansativa! Preciso de algo para ajudar a {mood}{extra}',
    ],
  ])
  const extra = vars?.extra ? ` ${vars.extra}` : ''
  const mood = vars?.mood ?? 'relaxar e descansar.'
  const messages = await prompt.formatMessages({ mood, extra })
  const systemMsg = messages.find((m) => m instanceof SystemMessage) as SystemMessage | undefined
  const userMsgs = messages.filter((m) => !(m instanceof SystemMessage))
  const input = userMsgs.map((m) => String(m.content)).join('\n')
  return { system: systemMsg ? String(systemMsg.content) : undefined, input }
}

export async function renderWhosplayingPrompt(params: {
  membersJson: string
  history?: Array<{ role: string; content: string }>
}): Promise<PromptRender> {
  const system = getPersonaForCommand('whosplaying')
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', system],
    new MessagesPlaceholder('history'),
    [
      'human',
      'Analise esta lista JSON de membros online e escreva um resumo útil e conciso para o chat. Foque em jogos, padrões e sugestões.\n{membersJson}',
    ],
  ])
  const lcHistory = mapHistoryToLcMessages(params.history)
  const messages = await prompt.formatMessages({ history: lcHistory, membersJson: params.membersJson })
  const systemMsg = messages.find((m) => m instanceof SystemMessage) as SystemMessage | undefined
  const nonSystem = messages.filter((m) => !(m instanceof SystemMessage))
  const input = nonSystem.map((m) => String(m.content)).join('\n')
  return { system: systemMsg ? String(systemMsg.content) : undefined, input }
}

export async function renderTriviaExplanationPrompt(params: {
  quizInput: string
  formatInstructions: string
}): Promise<PromptRender> {
  const system = getPersonaForCommand('trivia')
  let messages
  {
    // Components
    const persona = PromptTemplate.fromTemplate('{persona}')
    const examples = PromptTemplate.fromTemplate(
      [
        'Exemplo 1 — Pergunta: Qual é a capital da França?',
        'Opções: A) Madrid; B) Paris; C) Roma; D) Berlim',
        '{ex1}',
        '',
        'Exemplo 2 — Pergunta: Qual planeta é o mais quente do Sistema Solar?',
        'Opções: Mercúrio; Vênus; Terra; Marte',
        '{ex2}',
      ].join('\n')
    )
    const task = PromptTemplate.fromTemplate('{quizInput}\n\n{format_instructions}')

    const pipeline = new PipelinePromptTemplate({
      pipelinePrompts: [
        { name: 'persona', prompt: persona },
        { name: 'examples', prompt: examples },
        { name: 'task', prompt: task },
      ],
      // Keep persona only as system message; do not duplicate inside content
      finalPrompt: PromptTemplate.fromTemplate('{examples}\n\n{task}')
    })

    const example1Output = '{"explanation":"\n- A alternativa correta é B) Paris, capital da França.\n- Paris é conhecida como a Cidade Luz, e é o centro político e cultural francês.","fun_fact":"A Torre Eiffel foi construída para a Exposição Universal de 1889 e quase foi desmontada depois."}'
    const example2Output = '{"explanation":"\n- Embora Mercúrio seja o planeta mais próximo do Sol, Vênus é o mais quente por causa do efeito estufa extremo.\n- A alternativa correta é Vênus.","fun_fact":"A temperatura média em Vênus ultrapassa 460°C, suficiente para derreter chumbo."}'

    const formatted = await pipeline.format({
      persona: system,
      ex1: example1Output,
      ex2: example2Output,
      quizInput: params.quizInput,
      format_instructions: params.formatInstructions,
    })
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', '{persona}'],
      ['human', '{content}'],
    ])
    const partialed = await prompt.partial({ persona: system })
    messages = await partialed.formatMessages({ content: formatted })
  }
  const systemMsg = messages.find((m) => m instanceof SystemMessage) as SystemMessage | undefined
  const nonSystem = messages.filter((m) => !(m instanceof SystemMessage))
  const input = nonSystem.map((m) => String(m.content)).join('\n')
  return { system: systemMsg ? String(systemMsg.content) : undefined, input }
}
