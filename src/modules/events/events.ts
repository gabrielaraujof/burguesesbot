import { createControllers } from '../infra/controllers/events.controllers.js'
import type { ControllerDependencies } from '../infra/controllers/events.controllers.js'

export const createEvents = (dependencies: ControllerDependencies) => {
	const controllers = createControllers(dependencies)
	return {
		longweek: controllers.longweek,
		freegame: controllers.freegame,
		whosplaying: controllers.whosplaying,
		trivia: controllers.trivia,
		onCallbackQuery: controllers.onCallbackQuery,
	}
}
