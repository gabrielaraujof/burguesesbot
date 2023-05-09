import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';
import { OpenAIKey } from '../../helper/constants';

@Injectable()
export class ChatgptService {
  private openai: OpenAIApi;

  constructor(private config: ConfigService) {
    const configuration = new Configuration({
      apiKey: this.config.get<string>(OpenAIKey, ''),
    });
    this.openai = new OpenAIApi(configuration);
  }

  async prompt(prompt: string): Promise<string> {
    const gptResponse = await this.openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 100,
      temperature: 0.9,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      best_of: 1,
      n: 1,
      stop: ['\n'],
    });
    return gptResponse.data.choices[0].text ?? 'Que? Não entendi';
  }
}
