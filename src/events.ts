import { createControllers } from './controllers/events.controllers.js'
import { createServiceAdapters } from './adapters/service.adapters.js'

const serviceAdapters = createServiceAdapters()
const controllers = createControllers(serviceAdapters)

export const longweek = controllers.longweek
export const freegame = controllers.freegame
export const whosplaying = controllers.whosplaying
export const trivia = controllers.trivia
export const onCallbackQuery = controllers.onCallbackQuery
