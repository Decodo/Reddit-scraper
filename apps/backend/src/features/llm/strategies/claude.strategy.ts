import { BadRequestException, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { LLM_DEFAULTS } from '../llm.constants';
import type { LlmResponse } from '../llm.types';
import type { LlmStrategy, LlmStrategyArgs } from './llm-strategy.interface';

export class ClaudeStrategy implements LlmStrategy {
  private readonly logger = new Logger(ClaudeStrategy.name);

  async complete({ request, config, signal }: LlmStrategyArgs): Promise<LlmResponse> {
    if (!config.anthropicApiKey) {
      throw new BadRequestException('ANTHROPIC_API_KEY is not configured');
    }

    const model = (request.model ?? config.model) || LLM_DEFAULTS.claude.model;
    const client = new Anthropic({ apiKey: config.anthropicApiKey });
    this.logger.log(`Calling Claude model: ${model}`);

    const response = await client.messages.create(
      {
        model,
        max_tokens: 4096,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      },
      { signal },
    );

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return { content, provider: 'claude', model };
  }
}
