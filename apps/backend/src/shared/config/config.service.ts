import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  get app() {
    const port = this.configService.get<number>('PORT', 5002);
    const publicApiUrl = this.configService.get<string>(
      'PUBLIC_API_BASE_URL',
      `http://localhost:${port}`,
    );
    return {
      port,
      publicApiUrl,
      publicFrontendUrl: this.configService.get<string>(
        'PUBLIC_FRONTEND_URL',
        'http://localhost:5274',
      ),
    };
  }

  get mongodb() {
    return {
      uri: this.configService.get<string>('MONGODB_URI', 'mongodb://localhost:27018/platform'),
    };
  }

  get decodo() {
    return {
      apiKey: this.configService.get<string>('DECODO_BASIC_AUTH_TOKEN', ''),
      baseUrl: 'https://scraper-api.decodo.com/v2',
    };
  }

  get llm() {
    return {
      provider: this.configService.get<string>('LLM_PROVIDER', 'claude'),
      model: this.configService.get<string>('LLM_MODEL', ''),
      anthropicApiKey: this.configService.get<string>('ANTHROPIC_API_KEY', ''),
      openaiApiKey: this.configService.get<string>('OPENAI_API_KEY', ''),
      geminiApiKey: this.configService.get<string>('GEMINI_API_KEY', ''),
    };
  }
}
