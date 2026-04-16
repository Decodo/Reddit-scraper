import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

// ---------------------------------------------------------------------------
// SDK mocks — must be hoisted before the service import
// ---------------------------------------------------------------------------

const mockAnthropicMessagesCreate = jest.fn().mockResolvedValue({
  content: [{ type: 'text', text: '{"ok":true}' }],
});

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: { create: mockAnthropicMessagesCreate },
    })),
  };
});

const mockOpenAiCompletionsCreate = jest.fn().mockResolvedValue({
  choices: [{ message: { content: '{"ok":true}' } }],
});

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: { completions: { create: mockOpenAiCompletionsCreate } },
    })),
  };
});

const mockGeminiGenerateContent = jest.fn().mockResolvedValue({
  text: '{"ok":true}',
});

jest.mock('@google/genai', () => {
  return {
    __esModule: true,
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: { generateContent: mockGeminiGenerateContent },
    })),
  };
});

// ---------------------------------------------------------------------------
// Service under test
// ---------------------------------------------------------------------------

import { LlmService } from './llm.service';
import { SettingsService } from '../settings/settings.service';
import type { EffectiveConfig } from '../settings/settings.service';

function makeConfig(overrides: Partial<EffectiveConfig> = {}): EffectiveConfig {
  return {
    provider: 'claude',
    model: '',
    decodoApiKey: 'decodo-key',
    anthropicApiKey: 'ant-key',
    openaiApiKey: 'openai-key',
    geminiApiKey: 'gemini-key',
    ...overrides,
  };
}

const baseRequest = {
  messages: [{ role: 'user' as const, content: 'Hello' }],
};

describe('LlmService', () => {
  let service: LlmService;
  let settingsService: jest.Mocked<SettingsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        {
          provide: SettingsService,
          useValue: {
            getEffectiveConfig: jest.fn().mockResolvedValue(makeConfig()),
          },
        },
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
    settingsService = module.get(SettingsService);

    jest.clearAllMocks();
    mockAnthropicMessagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"ok":true}' }],
    });
    mockOpenAiCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: '{"ok":true}' } }],
    });
    mockGeminiGenerateContent.mockResolvedValue({ text: '{"ok":true}' });
  });

  // ---------------------------------------------------------------------------
  // complete() — provider routing
  // ---------------------------------------------------------------------------

  describe('complete()', () => {
    describe('Claude', () => {
      it('routes to Claude when provider=claude and returns correct shape', async () => {
        settingsService.getEffectiveConfig.mockResolvedValue(
          makeConfig({ provider: 'claude' }),
        );

        const result = await service.complete({ ...baseRequest, provider: 'claude' });

        expect(result.provider).toBe('claude');
        expect(result.content).toBe('{"ok":true}');
        expect(mockAnthropicMessagesCreate).toHaveBeenCalledTimes(1);
      });

      it('uses request.model over config.model', async () => {
        settingsService.getEffectiveConfig.mockResolvedValue(
          makeConfig({ provider: 'claude', model: 'config-model' }),
        );

        await service.complete({ ...baseRequest, provider: 'claude', model: 'request-model' });

        expect(mockAnthropicMessagesCreate.mock.calls[0][0].model).toBe('request-model');
      });

      it('falls back to LLM_DEFAULTS.claude.model when request.model and config.model are empty', async () => {
        settingsService.getEffectiveConfig.mockResolvedValue(
          makeConfig({ provider: 'claude', model: '' }),
        );

        await service.complete({ ...baseRequest, provider: 'claude' });

        expect(mockAnthropicMessagesCreate.mock.calls[0][0].model).toBe(
          'claude-sonnet-4-20250514',
        );
      });

      it('throws BadRequestException when anthropicApiKey is missing', async () => {
        settingsService.getEffectiveConfig.mockResolvedValue(
          makeConfig({ anthropicApiKey: '' }),
        );

        await expect(
          service.complete({ ...baseRequest, provider: 'claude' }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('OpenAI', () => {
      it('routes to OpenAI when provider=openai and returns correct shape', async () => {
        settingsService.getEffectiveConfig.mockResolvedValue(
          makeConfig({ provider: 'openai' }),
        );

        const result = await service.complete({ ...baseRequest, provider: 'openai' });

        expect(result.provider).toBe('openai');
        expect(result.content).toBe('{"ok":true}');
        expect(mockOpenAiCompletionsCreate).toHaveBeenCalledTimes(1);
      });

      it('sends response_format: json_object when responseFormat is "json"', async () => {
        settingsService.getEffectiveConfig.mockResolvedValue(
          makeConfig({ provider: 'openai' }),
        );

        await service.complete({ ...baseRequest, provider: 'openai', responseFormat: 'json' });

        const callArgs = mockOpenAiCompletionsCreate.mock.calls[0][0];
        expect(callArgs.response_format).toEqual({ type: 'json_object' });
      });

      it('does not send response_format when responseFormat is not set', async () => {
        settingsService.getEffectiveConfig.mockResolvedValue(
          makeConfig({ provider: 'openai' }),
        );

        await service.complete({ ...baseRequest, provider: 'openai' });

        const callArgs = mockOpenAiCompletionsCreate.mock.calls[0][0];
        expect(callArgs.response_format).toBeUndefined();
      });

      it('throws BadRequestException when openaiApiKey is missing', async () => {
        settingsService.getEffectiveConfig.mockResolvedValue(
          makeConfig({ openaiApiKey: '' }),
        );

        await expect(
          service.complete({ ...baseRequest, provider: 'openai' }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('Gemini', () => {
      it('routes to Gemini when provider=gemini and returns correct shape', async () => {
        settingsService.getEffectiveConfig.mockResolvedValue(
          makeConfig({ provider: 'gemini' }),
        );

        const result = await service.complete({ ...baseRequest, provider: 'gemini' });

        expect(result.provider).toBe('gemini');
        expect(result.content).toBe('{"ok":true}');
        expect(mockGeminiGenerateContent).toHaveBeenCalledTimes(1);
      });

      it('maps assistant role to "model" for Gemini API', async () => {
        settingsService.getEffectiveConfig.mockResolvedValue(
          makeConfig({ provider: 'gemini' }),
        );

        await service.complete({
          provider: 'gemini',
          messages: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi there' },
          ],
        });

        const callArgs = mockGeminiGenerateContent.mock.calls[0][0];
        expect(callArgs.contents[0].role).toBe('user');
        expect(callArgs.contents[1].role).toBe('model');
      });

      it('throws BadRequestException when geminiApiKey is missing', async () => {
        settingsService.getEffectiveConfig.mockResolvedValue(
          makeConfig({ geminiApiKey: '' }),
        );

        await expect(
          service.complete({ ...baseRequest, provider: 'gemini' }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    it('throws BadRequestException for unknown provider string', async () => {
      settingsService.getEffectiveConfig.mockResolvedValue(
        makeConfig({ provider: 'unknown-provider' }),
      );

      await expect(
        // @ts-expect-error — intentionally passing invalid provider
        service.complete({ ...baseRequest, provider: 'unknown-provider' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  // parseJsonResponse()
  // ---------------------------------------------------------------------------

  describe('parseJsonResponse()', () => {
    it('parses a plain JSON string', () => {
      const result = service.parseJsonResponse<{ ok: boolean }>('{"ok":true}');
      expect(result).toEqual({ ok: true });
    });

    it('strips ```json fences before parsing', () => {
      const fenced = '```json\n{"ok":true}\n```';
      const result = service.parseJsonResponse<{ ok: boolean }>(fenced);
      expect(result).toEqual({ ok: true });
    });

    it('strips plain ``` fences before parsing', () => {
      const fenced = '```\n{"ok":true}\n```';
      const result = service.parseJsonResponse<{ ok: boolean }>(fenced);
      expect(result).toEqual({ ok: true });
    });

    it('strips uppercase ```JSON fence before parsing', () => {
      const fenced = '```JSON\n{"ok":true}\n```';
      const result = service.parseJsonResponse<{ ok: boolean }>(fenced);
      expect(result).toEqual({ ok: true });
    });

    it('trims surrounding whitespace before parsing', () => {
      const result = service.parseJsonResponse<{ n: number }>('  {"n":42}  ');
      expect(result).toEqual({ n: 42 });
    });

    it('throws SyntaxError on invalid JSON', () => {
      expect(() => service.parseJsonResponse('not-json')).toThrow(SyntaxError);
    });
  });
});
