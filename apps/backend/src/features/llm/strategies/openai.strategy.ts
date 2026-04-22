import { BadRequestException, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import type { EffectiveConfig } from '../../settings/settings.service';
import { LLM_DEFAULTS } from '../llm.constants';
import type { LlmRequest, LlmResponse } from '../llm.types';
import type { LlmStrategy } from './llm-strategy.interface';

export class OpenAiStrategy implements LlmStrategy {
  private readonly logger = new Logger(OpenAiStrategy.name);

  async complete(
    request: LlmRequest,
    config: EffectiveConfig,
    signal?: AbortSignal,
  ): Promise<LlmResponse> {
    if (!config.openaiApiKey) {
      throw new BadRequestException('OPENAI_API_KEY is not configured');
    }

    const model = (request.model ?? config.model) || LLM_DEFAULTS.openai.model;
    const client = new OpenAI({ apiKey: config.openaiApiKey });
    this.logger.log(`Calling OpenAI model: ${model}`);

    const response = await client.chat.completions.create(
      {
        model,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        ...(request.responseFormat === 'json'
          ? { response_format: { type: 'json_object' as const } }
          : {}),
      },
      { signal },
    );

    const content = response.choices[0]?.message?.content ?? '';
    return { content, provider: 'openai', model };
  }
}
