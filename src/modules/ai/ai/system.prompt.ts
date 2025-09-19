/**
 * @deprecated Use getPersonaForCommand() from personas.ts instead
 * These exports are kept for backward compatibility with existing tests/imports
 */
import { getPersonaForCommand } from './personas.js'

export const triviaExpert = getPersonaForCommand('trivia')
export const whosplayingExpert = getPersonaForCommand('whosplaying')
