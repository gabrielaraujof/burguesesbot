import { Telegraf } from 'telegraf'
import type { ControllerDependencies } from '../infra/controllers/events.controllers.js'
import { createEvents } from '../events/index.js'
import { maintenance } from '../infra/utils.js'
import { createServiceAdapters, createDevServiceAdapters } from '../infra/adapters/service.adapters.js'

export type CreateBot = (token: string, deps: ControllerDependencies) => Telegraf

export const createBotWithDeps: CreateBot = (token, deps) => {
  const bot = new Telegraf(token)
  const events = createEvents(deps)

  bot.command('freegames', events.freegame)
  bot.command('semanalonga', events.longweek)
  bot.command('trivia', events.trivia)

  bot.command('nyvi', maintenance)
  bot.command('whosplaying', events.whosplaying)

  bot.on('callback_query', events.onCallbackQuery)

  return bot
}

export const createBot = (token: string) => {
  const deps = createServiceAdapters()
  return createBotWithDeps(token, deps)
}

export const createDevBot = (token: string) => {
  const deps = createDevServiceAdapters()
  return createBotWithDeps(token, deps)
}

export default createBot
