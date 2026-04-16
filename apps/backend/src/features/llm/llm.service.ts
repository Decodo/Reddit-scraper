import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { SettingsService } from '../settings/settings.service';
import type { EffectiveConfig } from '../settings/settings.service';
import { LLM_DEFAULTS } from './llm.constants';
import type { LlmProvider, LlmRequest, LlmResponse } from './llm.types';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async complete(request: LlmRequest): Promise<LlmResponse> {
    const config = await this.settingsService.getEffectiveConfig();
    const provider = (request.provider ?? config.provider) as LlmProvider;

    switch (provider) {
      case 'claude':
        return this.completeClaude(request, config);
      case 'openai':
        return this.completeOpenAi(request, config);
      case 'gemini':
        return this.completeGemini(request, config);
      default:
        throw new BadRequestException(`Unknown LLM provider: ${provider}`);
    }
  }

  private async completeClaude(
    request: LlmRequest,
    config: EffectiveConfig,
  ): Promise<LlmResponse> {
    if (!config.anthropicApiKey) {
      throw new BadRequestException('ANTHROPIC_API_KEY is not configured');
    }

    const model =
      (request.model ?? config.model) || LLM_DEFAULTS.claude.model;

    const client = new Anthropic({ apiKey: config.anthropicApiKey });
    this.logger.log(`Calling Claude model: ${model}`);

    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return { content, provider: 'claude', model };
  }

  private async completeOpenAi(
    request: LlmRequest,
    config: EffectiveConfig,
  ): Promise<LlmResponse> {
    if (!config.openaiApiKey) {
      throw new BadRequestException('OPENAI_API_KEY is not configured');
    }

    const model =
      (request.model ?? config.model) || LLM_DEFAULTS.openai.model;

    const client = new OpenAI({ apiKey: config.openaiApiKey });
    this.logger.log(`Calling OpenAI model: ${model}`);

    const response = await client.chat.completions.create({
      model,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      ...(request.responseFormat === 'json'
        ? { response_format: { type: 'json_object' as const } }
        : {}),
    });

    const content = response.choices[0]?.message?.content ?? '';
    return { content, provider: 'openai', model };
  }

  private async completeGemini(
    request: LlmRequest,
    config: EffectiveConfig,
  ): Promise<LlmResponse> {
    if (!config.geminiApiKey) {
      throw new BadRequestException('GEMINI_API_KEY is not configured');
    }

    const model =
      (request.model ?? config.model) || LLM_DEFAULTS.gemini.model;

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

  parseJsonResponse<T>(raw: string): T {
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(cleaned) as T;
  }
}
