import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';
import { OpenAIKey } from '../../helper/constants';

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

  async prompt(prompt: string): Promise<string> {
    this.logger.log(`Calling OpenAPI with prompt: ${prompt}`);
    const gptResponse = await this.openai.createCompletion({
      model: 'text-ada-001',
      prompt,
      max_tokens: 100,
      temperature: 0.5,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0.5,
      best_of: 1,
      n: 1,
      stop: ['\\n', '.'],
      suffix: '.',
    });
    this.logger.log(gptResponse.data);
    return gptResponse.data.choices[0].text ?? 'Que? Não entendi';
  }
}
