import { BadRequestException, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { LLM_DEFAULTS } from '../llm.constants';
import type { LlmResponse } from '../llm.types';
import type { LlmStrategy, LlmStrategyArgs } from './llm-strategy.interface';

export class GeminiStrategy implements LlmStrategy {
  private readonly logger = new Logger(GeminiStrategy.name);

  async complete({ request, config }: LlmStrategyArgs): Promise<LlmResponse> {
    if (!config.geminiApiKey) {
      throw new BadRequestException('GEMINI_API_KEY is not configured');
    }

    const model = (request.model ?? config.model) || LLM_DEFAULTS.gemini.model;
    const client = new GoogleGenAI({ apiKey: config.geminiApiKey });
    this.logger.log(`Calling Gemini model: ${model}`);

    const contents = request.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await client.models.generateContent({ model, contents });
    const content = response.text ?? '';
    return { content, provider: 'gemini', model };
  }
}
