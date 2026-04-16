import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SettingsService } from './settings.service';
import { Settings } from './settings.schema';
import { ConfigService } from '../../shared/config/config.service';

const mockConfigService = {
  llm: {
    provider: 'claude',
    model: '',
    anthropicApiKey: 'env-ant-key',
    openaiApiKey: '',
    geminiApiKey: '',
  },
  decodo: {
    apiKey: 'env-decodo-key',
  },
};

function makeModelMock(doc: unknown) {
  return {
    findOne: jest.fn().mockReturnValue({ exec: () => Promise.resolve(doc) }),
    findOneAndUpdate: jest.fn().mockReturnValue({ exec: () => Promise.resolve({}) }),
  };
}

describe('SettingsService', () => {
  let service: SettingsService;
  let modelMock: ReturnType<typeof makeModelMock>;

  beforeEach(async () => {
    modelMock = makeModelMock(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: getModelToken(Settings.name), useValue: modelMock },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // getEffectiveConfig
  // ---------------------------------------------------------------------------

  describe('getEffectiveConfig()', () => {
    it('returns env fallback values when DB document is null', async () => {
      modelMock.findOne.mockReturnValue({ exec: () => Promise.resolve(null) });

      const config = await service.getEffectiveConfig();

      expect(config.provider).toBe('claude');
      expect(config.anthropicApiKey).toBe('env-ant-key');
      expect(config.decodoApiKey).toBe('env-decodo-key');
      expect(config.openaiApiKey).toBe('');
      expect(config.geminiApiKey).toBe('');
    });

    it('DB values override env values when DB doc exists', async () => {
      const dbDoc = {
        provider: 'openai',
        model: 'gpt-4o',
        decodoApiKey: 'db-decodo-key',
        anthropicApiKey: 'db-ant-key',
        openaiApiKey: 'db-openai-key',
        geminiApiKey: 'db-gemini-key',
      };
      modelMock.findOne.mockReturnValue({ exec: () => Promise.resolve(dbDoc) });

      const config = await service.getEffectiveConfig();

      expect(config.provider).toBe('openai');
      expect(config.model).toBe('gpt-4o');
      expect(config.decodoApiKey).toBe('db-decodo-key');
      expect(config.anthropicApiKey).toBe('db-ant-key');
      expect(config.openaiApiKey).toBe('db-openai-key');
      expect(config.geminiApiKey).toBe('db-gemini-key');
    });

    it('caches result — DB called only once within TTL', async () => {
      await service.getEffectiveConfig();
      await service.getEffectiveConfig();
      await service.getEffectiveConfig();

      expect(modelMock.findOne).toHaveBeenCalledTimes(1);
    });

    it('re-fetches from DB after the 10 s TTL expires', async () => {
      let mockNow = 0;
      const dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => mockNow);

      try {
        await service.getEffectiveConfig();
        expect(modelMock.findOne).toHaveBeenCalledTimes(1);

        // Still within 10 s TTL
        mockNow = 5_000;
        await service.getEffectiveConfig();
        expect(modelMock.findOne).toHaveBeenCalledTimes(1);

        // Past TTL — should re-fetch
        mockNow = 11_000;
        await service.getEffectiveConfig();
        expect(modelMock.findOne).toHaveBeenCalledTimes(2);
      } finally {
        dateSpy.mockRestore();
      }
    });

    it('falls back to env values when the DB query throws', async () => {
      modelMock.findOne.mockReturnValue({
        exec: () => Promise.reject(new Error('DB connection error')),
      });

      const config = await service.getEffectiveConfig();

      expect(config.anthropicApiKey).toBe('env-ant-key');
      expect(config.decodoApiKey).toBe('env-decodo-key');
      expect(config.provider).toBe('claude');
    });

    it('defaults provider to "claude" when neither DB nor env specifies one', async () => {
      const emptyConfig = {
        llm: { provider: '', model: '', anthropicApiKey: '', openaiApiKey: '', geminiApiKey: '' },
        decodo: { apiKey: '' },
      };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SettingsService,
          { provide: getModelToken(Settings.name), useValue: makeModelMock(null) },
          { provide: ConfigService, useValue: emptyConfig },
        ],
      }).compile();

      const svc = module.get<SettingsService>(SettingsService);
      const config = await svc.getEffectiveConfig();

      expect(config.provider).toBe('claude');
    });

    it('concurrent calls share one in-flight promise — DB called only once', async () => {
      let resolve!: (value: unknown) => void;
      const pendingPromise = new Promise((res) => {
        resolve = res;
      });

      modelMock.findOne.mockReturnValue({
        exec: () => pendingPromise,
      });

      // Fire 3 concurrent calls before the promise resolves
      const calls = [
        service.getEffectiveConfig(),
        service.getEffectiveConfig(),
        service.getEffectiveConfig(),
      ];

      // Resolve the DB query
      resolve(null);

      await Promise.all(calls);

      expect(modelMock.findOne).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // update()
  // ---------------------------------------------------------------------------

  describe('update()', () => {
    it('saves non-empty trimmed fields via findOneAndUpdate', async () => {
      await service.update({ anthropicApiKey: '  new-key  ', provider: 'openai' });

      expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { key: 'global' },
        { $set: { anthropicApiKey: 'new-key', provider: 'openai' } },
        { upsert: true, new: true },
      );
    });

    it('ignores whitespace-only and empty fields', async () => {
      await service.update({ anthropicApiKey: '   ', openaiApiKey: '' });

      expect(modelMock.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('ignores empty fields even when mixed with valid fields', async () => {
      await service.update({ anthropicApiKey: 'valid-key', openaiApiKey: '' });

      expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { key: 'global' },
        { $set: { anthropicApiKey: 'valid-key' } },
        { upsert: true, new: true },
      );
    });

    it('invalidates cache so next getEffectiveConfig() re-fetches from DB', async () => {
      // Populate cache
      await service.getEffectiveConfig();
      expect(modelMock.findOne).toHaveBeenCalledTimes(1);

      // Update should invalidate the cache
      await service.update({ provider: 'gemini' });

      // update() calls getStatus() → getEffectiveConfig() internally, which re-fetches from DB
      // (cache was cleared before the internal call). That repopulates the cache.
      // So total = 1 (initial) + 1 (inside update's getStatus) = 2.
      // The subsequent call here hits the freshly-populated cache — no extra DB call.
      await service.getEffectiveConfig();
      expect(modelMock.findOne).toHaveBeenCalledTimes(2);
    });
  });

  // ---------------------------------------------------------------------------
  // getStatus()
  // ---------------------------------------------------------------------------

  describe('getStatus()', () => {
    it('returns correct boolean flags when keys are set from env', async () => {
      const status = await service.getStatus();

      expect(status.provider).toBe('claude');
      expect(status.decodoKeySet).toBe(true);
      expect(status.anthropicKeySet).toBe(true);
      expect(status.openaiKeySet).toBe(false);
      expect(status.geminiKeySet).toBe(false);
    });

    it('returns correct boolean flags when DB doc overrides keys', async () => {
      const dbDoc = {
        provider: 'gemini',
        model: '',
        decodoApiKey: '',
        anthropicApiKey: '',
        openaiApiKey: '',
        geminiApiKey: 'db-gemini-key',
      };
      modelMock.findOne.mockReturnValue({ exec: () => Promise.resolve(dbDoc) });

      const status = await service.getStatus();

      expect(status.provider).toBe('gemini');
      // decodoApiKey falls back to env 'env-decodo-key' since DB value is empty
      expect(status.decodoKeySet).toBe(true);
      expect(status.anthropicKeySet).toBe(true); // env fallback
      expect(status.geminiKeySet).toBe(true);
    });

    it('returns all false when no keys are configured', async () => {
      const emptyConfig = {
        llm: { provider: '', model: '', anthropicApiKey: '', openaiApiKey: '', geminiApiKey: '' },
        decodo: { apiKey: '' },
      };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SettingsService,
          { provide: getModelToken(Settings.name), useValue: makeModelMock(null) },
          { provide: ConfigService, useValue: emptyConfig },
        ],
      }).compile();

      const svc = module.get<SettingsService>(SettingsService);
      const status = await svc.getStatus();

      expect(status.decodoKeySet).toBe(false);
      expect(status.anthropicKeySet).toBe(false);
      expect(status.openaiKeySet).toBe(false);
      expect(status.geminiKeySet).toBe(false);
    });
  });
});
