import { BadRequestException, HttpException, Logger } from '@nestjs/common';
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

    try {
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
    } catch (err) {
      throw ClaudeStrategy.toHttpException(err);
    }
  }

  private static toHttpException(err: unknown): HttpException | BadRequestException {
    const status = (err as { status?: number }).status;
    if (status === undefined) {
      throw err;
    }

    if (status === 429) {
      return new HttpException(
        'Anthropic rate limit reached. Wait a minute and try again, or switch LLM provider in Settings.',
        429,
      );
    }

    if (status === 401) {
      return new BadRequestException('ANTHROPIC_API_KEY is invalid or expired');
    }

    if (status === 404) {
      return new BadRequestException('Anthropic model not found. Update the model in Settings.');
    }

    const message = err instanceof Error ? err.message : String(err);
    return new HttpException(`Anthropic API error: ${message}`, status ?? 502);
  }
}
