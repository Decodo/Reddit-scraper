import { Injectable, BadRequestException } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import type { LlmProvider, LlmRequest, LlmResponse } from './llm.types';
import type { LlmStrategy } from './strategies/llm-strategy.interface';
import { ClaudeStrategy } from './strategies/claude.strategy';
import { OpenAiStrategy } from './strategies/openai.strategy';
import { GeminiStrategy } from './strategies/gemini.strategy';

@Injectable()
export class LlmService {
  private readonly strategies: Record<LlmProvider, LlmStrategy> = {
    claude: new ClaudeStrategy(),
    openai: new OpenAiStrategy(),
    gemini: new GeminiStrategy(),
  };

  constructor(private readonly settingsService: SettingsService) {}

  async complete(request: LlmRequest, signal?: AbortSignal): Promise<LlmResponse> {
    const config = await this.settingsService.getEffectiveConfig();
    const provider = (request.provider ?? config.provider) as LlmProvider;
    const strategy = this.strategies[provider];

    if (!strategy) {
      throw new BadRequestException(`Unknown LLM provider: ${provider}`);
    }

    return strategy.complete(request, config, signal);
  }

  parseJsonResponse<T>(raw: string): T {
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(cleaned) as T;
  }
}
