import { ChatCompletionRequestMessage } from "openai";

export const userPrompt = (
  author: string,
  message: string,
): ChatCompletionRequestMessage => ({
  role: 'user',
  content: message,
  name: author,
});
