export enum ResponseCode {
  Success = 0,
  NotEnoughResults = 1,
  InvalidParameter = 2,
  TokenNotFound = 3,
  TokenEmpty = 4,
  RateLimit = 5,
}

export enum CategoryId {
  General = 9,
  Books = 10,
  Film = 11,
  Music = 12,
  MusicalsAndTheatres = 13,
  Television = 14,
  VideoGames = 15,
  BoardGames = 16,
  ScienceAndNature = 17,
  Computers = 18,
  Mathematics = 19,
  Mythology = 20,
  Sports = 21,
  Geography = 22,
  History = 23,
  Politics = 24,
  Art = 25,
  Celebrities = 26,
  Animals = 27,
  Vehicles = 28,
  Comics = 29,
  Gadgets = 30,
  JapaneseAnimeAndManga = 31,
  CartoonAndAnimations = 32,
}

export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'boolean' | 'multiple'

export interface Trivia {
  type: QuestionType
  difficulty: Difficulty
  category: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

export interface TriviaResponse {
  response_code: ResponseCode
  results: Trivia[]
}

export interface Quiz {
  title: string
  options: string[]
  correctOptionIndex: number
}
