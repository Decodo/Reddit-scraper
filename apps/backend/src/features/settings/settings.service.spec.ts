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
    openaiApiKey: 'env-oai-key',
    geminiApiKey: '',
  },
  decodo: { apiKey: 'env-decodo-key' },
};

function makeModelMock(doc: unknown) {
  return {
    findOne: jest.fn().mockReturnValue({ exec: () => Promise.resolve(doc) }),
    findOneAndUpdate: jest.fn().mockReturnValue({ exec: () => Promise.resolve({}) }),
  };
}

async function makeService(doc: unknown = null, configOverride = mockConfigService) {
  const model = makeModelMock(doc);
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      SettingsService,
      { provide: getModelToken(Settings.name), useValue: model },
      { provide: ConfigService, useValue: configOverride },
    ],
  }).compile();
  return { service: module.get<SettingsService>(SettingsService), model };
}

describe('SettingsService', () => {
  // ---------------------------------------------------------------------------
  // getEffectiveConfig()
  // ---------------------------------------------------------------------------

  describe('getEffectiveConfig()', () => {
    it('reads provider and model from DB when a doc exists', async () => {
      const { service } = await makeService({ provider: 'openai', model: 'gpt-4o' });
      const config = await service.getEffectiveConfig();

      expect(config.provider).toBe('openai');
      expect(config.model).toBe('gpt-4o');
    });

    it('falls back to env provider when DB doc is null', async () => {
      const { service } = await makeService(null);
      const config = await service.getEffectiveConfig();

      expect(config.provider).toBe('claude');
    });

    it('defaults provider to "claude" when both DB and env are empty', async () => {
      const emptyConfig = {
        llm: { provider: '', model: '', anthropicApiKey: '', openaiApiKey: '', geminiApiKey: '' },
        decodo: { apiKey: '' },
      };
      const { service } = await makeService(null, emptyConfig);
      const config = await service.getEffectiveConfig();

      expect(config.provider).toBe('claude');
    });

    it('API keys always come from env, never from DB', async () => {
      const dbDoc = { provider: 'openai', model: 'gpt-4o' };
      const { service } = await makeService(dbDoc);
      const config = await service.getEffectiveConfig();

      // DB doc has no key fields — keys must come from env
      expect(config.anthropicApiKey).toBe('env-ant-key');
      expect(config.openaiApiKey).toBe('env-oai-key');
      expect(config.decodoApiKey).toBe('env-decodo-key');
    });

    it('falls back to env values when the DB query throws', async () => {
      const { service, model } = await makeService(null);
      model.findOne.mockReturnValue({
        exec: () => Promise.reject(new Error('DB connection error')),
      });

      const config = await service.getEffectiveConfig();

      expect(config.provider).toBe('claude');
      expect(config.anthropicApiKey).toBe('env-ant-key');
      expect(config.decodoApiKey).toBe('env-decodo-key');
    });

    it('env model is used when DB doc has no model field', async () => {
      const configWithModel = {
        ...mockConfigService,
        llm: { ...mockConfigService.llm, model: 'claude-opus-4-5' },
      };
      const { service } = await makeService({ provider: 'claude' }, configWithModel);
      const config = await service.getEffectiveConfig();

      expect(config.model).toBe('claude-opus-4-5');
    });
  });

  // ---------------------------------------------------------------------------
  // getStatus()
  // ---------------------------------------------------------------------------

  describe('getStatus()', () => {
    it('returns correct boolean flags based on env keys', async () => {
      const { service } = await makeService(null);
      const status = await service.getStatus();

      expect(status.provider).toBe('claude');
      expect(status.decodoKeySet).toBe(true);
      expect(status.anthropicKeySet).toBe(true);
      expect(status.openaiKeySet).toBe(true);
      expect(status.geminiKeySet).toBe(false);
    });

    it('reflects DB provider in status', async () => {
      const { service } = await makeService({ provider: 'gemini' });
      const status = await service.getStatus();

      expect(status.provider).toBe('gemini');
    });

    it('returns all key flags false when no env keys are set', async () => {
      const emptyConfig = {
        llm: {
          provider: 'claude',
          model: '',
          anthropicApiKey: '',
          openaiApiKey: '',
          geminiApiKey: '',
        },
        decodo: { apiKey: '' },
      };
      const { service } = await makeService(null, emptyConfig);
      const status = await service.getStatus();

      expect(status.decodoKeySet).toBe(false);
      expect(status.anthropicKeySet).toBe(false);
      expect(status.openaiKeySet).toBe(false);
      expect(status.geminiKeySet).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // update()
  // ---------------------------------------------------------------------------

  describe('update()', () => {
    it('saves provider via findOneAndUpdate and resets model', async () => {
      // Changing provider clears the model field so a stale model from a
      // different provider isn't carried over (see settings.service.ts).
      const { service, model } = await makeService(null);
      await service.update({ provider: 'openai' });

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { key: 'global' },
        { $set: { provider: 'openai', model: '' } },
        { upsert: true, new: true },
      );
    });

    it('saves model and trims whitespace', async () => {
      const { service, model } = await makeService(null);
      await service.update({ model: '  gpt-4o  ' });

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { key: 'global' },
        { $set: { model: 'gpt-4o' } },
        { upsert: true, new: true },
      );
    });

    it('saves both provider and model together', async () => {
      const { service, model } = await makeService(null);
      await service.update({ provider: 'gemini', model: 'gemini-2.5-flash' });

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { key: 'global' },
        { $set: { provider: 'gemini', model: 'gemini-2.5-flash' } },
        { upsert: true, new: true },
      );
    });

    it('allows clearing model with an empty string', async () => {
      const { service, model } = await makeService(null);
      await service.update({ model: '' });

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { key: 'global' },
        { $set: { model: '' } },
        { upsert: true, new: true },
      );
    });

    it('returns updated status after save', async () => {
      const { service, model } = await makeService(null);
      // After update, findOne returns the new doc
      model.findOne.mockReturnValue({
        exec: () => Promise.resolve({ provider: 'openai', model: 'gpt-4o' }),
      });

      const status = await service.update({ provider: 'openai', model: 'gpt-4o' });

      expect(status.provider).toBe('openai');
      expect(status.model).toBe('gpt-4o');
    });
  });
});
