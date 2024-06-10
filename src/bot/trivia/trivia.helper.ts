import { Logger } from '@nestjs/common';
import { Quiz, Trivia } from './trivia.interface';

const logger = new Logger('trivia helper');

export function toQuiz(trivia: Trivia): Quiz {
  logger.debug(trivia);
  const correctIdx = Math.floor(
    Math.random() * (trivia.incorrect_answers.length + 1),
  );
  const options = trivia.incorrect_answers.map(atob);
  options.splice(correctIdx, 0, atob(trivia.correct_answer));
  return {
    title: atob(trivia.question),
    options,
    correctOptionIndex: correctIdx,
  };
}
