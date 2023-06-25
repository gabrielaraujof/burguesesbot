import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
  OpenAIApi,
} from 'openai';

import { OpenAIKey } from '../../helper/constants';
import { CompletionOptionsBuilder } from '../domain/chat';
import { userPrompt } from '../domain/message';
import { background } from '../domain/chat-context';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly openai: OpenAIApi;
  private readonly optiosnBuilder: CompletionOptionsBuilder;

  constructor(private readonly config: ConfigService) {
    const configuration = new Configuration({
      apiKey: this.config.get<string>(OpenAIKey, ''),
    });
    this.openai = new OpenAIApi(configuration);
    this.optiosnBuilder = new CompletionOptionsBuilder({
      model: 'gpt-3.5-turbo-0613',
      max_tokens: 150,
      temperature: 0.7,
      top_p: 1,
      presence_penalty: 0.19,
      frequency_penalty: 0.44,
      n: 1,
      messages: [
        {
          role: 'system',
          content: background,
        },
      ],
    });
  }

  complete(
    prompt: string,
    author: string,
  ): Promise<CreateChatCompletionResponse>;
  complete(
    messages: Array<ChatCompletionRequestMessage>,
    functions?: Array<ChatCompletionFunctions>,
  ): Promise<CreateChatCompletionResponse>;
  complete(
    options: Partial<CreateChatCompletionRequest>,
  ): Promise<CreateChatCompletionResponse>;
  async complete(
    a:
      | string
      | Array<ChatCompletionRequestMessage>
      | Partial<CreateChatCompletionRequest>,
    b?: string | Array<ChatCompletionFunctions>,
  ): Promise<CreateChatCompletionResponse> {
    if (typeof a === 'string' && typeof b === 'string') {
      return this.defaultComplete(a, b);
    } else if (Array.isArray(a) && (b === undefined || Array.isArray(b))) {
      return this.completeWithMessages(a, b);
    } else if (typeof a === 'object' && !Array.isArray(a)) {
      return this.completeWithOptions(a);
    }

    this.logger.error('Invalid parameters for complete');
    throw new Error(`Bad parameters`);
  }

  private async defaultComplete(
    prompt: string,
    author: string,
  ): Promise<CreateChatCompletionResponse> {
    const options = this.optiosnBuilder
      .clone()
      .withExtraMessages([userPrompt(author, prompt)])
      .build();
    return this.createChatCompletion(options);
  }

  private async completeWithMessages(
    messages: Array<ChatCompletionRequestMessage>,
    functions: Array<ChatCompletionFunctions> = [],
  ): Promise<CreateChatCompletionResponse> {
    const options = this.optiosnBuilder
      .clone()
      .withMessages(messages)
      .withFunctions(functions)
      .build();
    return this.createChatCompletion(options);
  }

  private async completeWithOptions(
    options: Partial<CreateChatCompletionRequest>,
  ): Promise<CreateChatCompletionResponse> {
    return this.createChatCompletion(
      new CompletionOptionsBuilder(options).build(),
    );
  }

  private async createChatCompletion(options: CreateChatCompletionRequest) {
    this.logger.log(`Calling OpenAPI`, options);
    const gptResponse = await this.openai.createChatCompletion(options);
    this.logger.debug(gptResponse.data);
    return gptResponse.data;
  }
}
