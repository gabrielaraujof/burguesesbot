import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';
import { OpenAIKey } from '../../helper/constants';
import { background } from './chat-context';

@Injectable()
export class ChatgptService {
  private readonly logger = new Logger(ChatgptService.name);
  private openai: OpenAIApi;

  constructor(private config: ConfigService) {
    const configuration = new Configuration({
      apiKey: this.config.get<string>(OpenAIKey, ''),
    });
    this.openai = new OpenAIApi(configuration);
  }

  async prompt(prompt: string, authorName: string): Promise<string> {
    this.logger.log(`Calling OpenAPI with prompt: ${prompt}`);
    const gptResponse = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
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
        { role: 'user', content: prompt, name: authorName },
      ],
    });
    this.logger.log(gptResponse.data);
    return gptResponse.data.choices[0].message?.content ?? 'Que? Não entendi';
  }
}
