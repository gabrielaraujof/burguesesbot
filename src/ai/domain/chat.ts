import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
  CreateChatCompletionRequestFunctionCall,
  CreateChatCompletionRequestStop,
} from 'openai';

export class CompletionOptionsBuilder implements CreateChatCompletionRequest {
  model: string;
  messages: ChatCompletionRequestMessage[];
  functions?: ChatCompletionFunctions[];
  function_call?: CreateChatCompletionRequestFunctionCall;
  temperature?: number | null;
  top_p?: number | null;
  n?: number | null;
  stream?: boolean | null;
  stop?: CreateChatCompletionRequestStop;
  max_tokens?: number;
  presence_penalty?: number | null;
  frequency_penalty?: number | null;
  logit_bias?: object | null;
  user?: string;

  constructor(options: Partial<CreateChatCompletionRequest>) {
    if (options.model) {
      this.model = options.model;
    }

    if (options.messages) {
      this.messages = options.messages;
    }

    this.functions = options.functions;
    this.function_call = options.function_call;
    this.temperature = options.temperature;
    this.top_p = options.top_p;
    this.n = options.n;
    this.stream = options.stream;
    this.stop = options.stop;
    this.max_tokens = options.max_tokens;
    this.presence_penalty = options.presence_penalty;
    this.frequency_penalty = options.frequency_penalty;
    this.logit_bias = options.logit_bias;
    this.user = options.user;
  }

  clone(): CompletionOptionsBuilder {
    return new CompletionOptionsBuilder(this);
  }

  withMessages(messages: ChatCompletionRequestMessage[]) {
    this.messages = messages;
    return this;
  }

  withExtraMessages(
    messages: ChatCompletionRequestMessage[],
  ): CompletionOptionsBuilder {
    if (!this.messages) {
      this.messages = messages;
    }
    this.messages = this.messages.concat(messages);
    return this;
  }

  withFunctions(functions: ChatCompletionFunctions[]) {
    this.functions = functions;
    return this;
  }

  withExtraFunctions(
    functions: ChatCompletionFunctions[],
  ): CompletionOptionsBuilder {
    if (!this.functions) {
      this.functions = functions;
    }
    this.functions = this.functions.concat(functions);
    return this;
  }

  build(): CreateChatCompletionRequest {
    if (!this.model) {
      throw new Error('model is required');
    }

    if (!this.messages) {
      throw new Error('messages is required');
    }

    return this;
  }
}
