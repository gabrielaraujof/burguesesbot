import { Markup } from 'telegraf'
import { bold, fmt } from 'telegraf/format'

import { CategoryId, type Quiz, type Trivia } from './trivia.interface.js'

export const display = ({
  category = 'any',
  difficulty = 'any',
}: any = {}) => fmt`Escolha suas preferências
Categoria: ${bold`${cname(category)}`}
Dificuldade: ${bold`${dname(difficulty)}`}`

const difficultyNames = {
  ['easy']: 'Fácil',
  ['medium']: 'Médio',
  ['hard']: 'Difícil',
  ['any']: 'Qualquer',
}
const dname = (difficulty: 'easy' | 'medium' | 'hard') =>
  difficultyNames[difficulty]

export const mainMenu = (opts: any = {}) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback(
        'Categorias',
        JSON.stringify({ ...opts, menu: 'category' }),
      ),
      Markup.button.callback(
        'Dificuldade',
        JSON.stringify({ ...opts, menu: 'difficulty' }),
      ),
    ],
    [
      Markup.button.callback(
        'Pode mandar a pergunta!',
        JSON.stringify({ ...opts, done: true }),
      ),
    ],
  ])

export const difficultyMenu = (opts: any) =>
  Markup.inlineKeyboard(
    [
      Markup.button.callback(
        'Fácil',
        JSON.stringify({ ...opts, menu: 'main', difficulty: 'easy' }),
      ),
      Markup.button.callback(
        'Médio',
        JSON.stringify({ ...opts, menu: 'main', difficulty: 'medium' }),
      ),
      Markup.button.callback(
        'Difícil',
        JSON.stringify({ ...opts, menu: 'main', difficulty: 'hard' }),
      ),
    ],
    { columns: 1 },
  )

export const categoryMenu = (opts: any) =>
  Markup.inlineKeyboard(
    [
      Markup.button.callback(
        '🧠',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.General,
        }),
      ),
      Markup.button.callback(
        '📚',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Books,
        }),
      ),
      Markup.button.callback(
        '🎬',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Film,
        }),
      ),
      Markup.button.callback(
        '🎵',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Music,
        }),
      ),
      Markup.button.callback(
        '🎭',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.MusicalsAndTheatres,
        }),
      ),
      Markup.button.callback(
        '📺',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Television,
        }),
      ),
      Markup.button.callback(
        '🎮',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.VideoGames,
        }),
      ),
      Markup.button.callback(
        '🎲',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.BoardGames,
        }),
      ),
      Markup.button.callback(
        '🌿',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.ScienceAndNature,
        }),
      ),
      Markup.button.callback(
        '💻',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Computers,
        }),
      ),
      Markup.button.callback(
        '➗',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Mathematics,
        }),
      ),
      Markup.button.callback(
        '🧙‍♂️',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Mythology,
        }),
      ),
      Markup.button.callback(
        '⚽',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Sports,
        }),
      ),
      Markup.button.callback(
        '🌍',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Geography,
        }),
      ),
      Markup.button.callback(
        '📜',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.History,
        }),
      ),
      Markup.button.callback(
        '🏛️',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Politics,
        }),
      ),
      Markup.button.callback(
        '🎨',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Art,
        }),
      ),
      Markup.button.callback(
        '🌟',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Celebrities,
        }),
      ),
      Markup.button.callback(
        '🐾',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Animals,
        }),
      ),
      Markup.button.callback(
        '🚗',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Vehicles,
        }),
      ),
      Markup.button.callback(
        '📖',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Comics,
        }),
      ),
      Markup.button.callback(
        '📱',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.Gadgets,
        }),
      ),
      Markup.button.callback(
        '📘',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.JapaneseAnimeAndManga,
        }),
      ),
      Markup.button.callback(
        '📘',
        JSON.stringify({
          ...opts,
          menu: 'main',
          category: CategoryId.CartoonAndAnimations,
        }),
      ),
    ],
    { columns: 4 },
  )

const categoryNames = {
  [CategoryId.General]: 'Conhecimento Geral',
  [CategoryId.Books]: 'Livros',
  [CategoryId.Film]: 'Filmes',
  [CategoryId.Music]: 'Música',
  [CategoryId.MusicalsAndTheatres]: 'Musicais e Teatro',
  [CategoryId.Television]: 'Televisão',
  [CategoryId.VideoGames]: 'Video Games',
  [CategoryId.BoardGames]: 'Board Games',
  [CategoryId.ScienceAndNature]: 'Ciência e Natureza',
  [CategoryId.Computers]: 'Computadores',
  [CategoryId.Mathematics]: 'Matemática',
  [CategoryId.Mythology]: 'Mitologia',
  [CategoryId.Sports]: 'Esportes',
  [CategoryId.Geography]: 'Geografia',
  [CategoryId.History]: 'História',
  [CategoryId.Politics]: 'Política',
  [CategoryId.Art]: 'Arte',
  [CategoryId.Celebrities]: 'Celebridades',
  [CategoryId.Animals]: 'Animais',
  [CategoryId.Vehicles]: 'Veículos',
  [CategoryId.Comics]: 'Quadrinhos',
  [CategoryId.Gadgets]: 'Gadgets',
  [CategoryId.JapaneseAnimeAndManga]: 'Anime e Mangá',
  [CategoryId.CartoonAndAnimations]: 'Desenho e Animações',
  ['any']: 'Qualquer',
}

const cname = (category: CategoryId) => categoryNames[category]

export function toQuiz(trivia: Trivia): Quiz {
  const correctIdx = Math.floor(
    Math.random() * (trivia.incorrect_answers.length + 1),
  )
  const options = trivia.incorrect_answers.map(atob)
  options.splice(correctIdx, 0, atob(trivia.correct_answer))
  return {
    title: atob(trivia.question),
    options,
    correctOptionIndex: correctIdx,
  }
}

export function buildGnerationInput(quiz: Quiz): string {
  const wrongAnswers = quiz.options
    .filter((_, idx) => idx !== quiz.correctOptionIndex)
    .map((op) => `- ${op}`)
    .join('\n')
  const correctAnswer = quiz.options[quiz.correctOptionIndex]
  return `Pergunta: "${quiz.title}"\nRespostas Erradas:\n${wrongAnswers}\nResposta certa: ${correctAnswer}`
}
