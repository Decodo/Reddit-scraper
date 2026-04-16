import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '../../shared/config/config.service';
import { Settings, SettingsDocument } from './settings.schema';

export interface EffectiveConfig {
  provider: string;
  model: string;
  decodoApiKey: string;
  anthropicApiKey: string;
  openaiApiKey: string;
  geminiApiKey: string;
}

export interface SettingsStatus {
  provider: string;
  model: string;
  decodoKeySet: boolean;
  anthropicKeySet: boolean;
  openaiKeySet: boolean;
  geminiKeySet: boolean;
}

export interface UpdateSettingsInput {
  provider?: string;
  model?: string;
  decodoApiKey?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  private configCache: { value: EffectiveConfig; expiresAt: number } | null = null;
  private configInFlight: Promise<EffectiveConfig> | null = null;
  private readonly CONFIG_CACHE_TTL_MS = 10_000; // 10 seconds

  constructor(
    @InjectModel(Settings.name)
    private readonly settingsModel: Model<SettingsDocument>,
    private readonly configService: ConfigService,
  ) {}

  async getEffectiveConfig(): Promise<EffectiveConfig> {
    if (this.configCache && Date.now() < this.configCache.expiresAt) {
      return this.configCache.value;
    }

    // Prevent cache stampede: all concurrent callers share a single in-flight fetch
    if (this.configInFlight) {
      return this.configInFlight;
    }

    this.configInFlight = this.fetchConfig().finally(() => {
      this.configInFlight = null;
    });

    return this.configInFlight;
  }

  private async fetchConfig(): Promise<EffectiveConfig> {
    let doc: SettingsDocument | null = null;
    try {
      doc = await this.settingsModel.findOne({ key: 'global' }).exec();
    } catch (err) {
      this.logger.warn(`Failed to read settings from DB: ${String(err)}`);
    }

    const envLlm = this.configService.llm;
    const envDecodo = this.configService.decodo;

    const config = {
      provider: doc?.provider || envLlm.provider || 'claude',
      model: doc?.model || envLlm.model || '',
      decodoApiKey: doc?.decodoApiKey || envDecodo.apiKey || '',
      anthropicApiKey: doc?.anthropicApiKey || envLlm.anthropicApiKey || '',
      openaiApiKey: doc?.openaiApiKey || envLlm.openaiApiKey || '',
      geminiApiKey: doc?.geminiApiKey || envLlm.geminiApiKey || '',
    };

    this.logger.log(
      `[Config] provider=${config.provider} model="${config.model || 'default'}" ` +
      `decodo=${config.decodoApiKey ? '✓' : '✗'} ` +
      `anthropic=${config.anthropicApiKey ? '✓' : '✗'} ` +
      `openai=${config.openaiApiKey ? '✓' : '✗'} ` +
      `gemini=${config.geminiApiKey ? '✓' : '✗'} ` +
      `(source: ${doc ? 'DB' : 'env'})`,
    );

    this.configCache = { value: config, expiresAt: Date.now() + this.CONFIG_CACHE_TTL_MS };

    return config;
  }

  async getStatus(): Promise<SettingsStatus> {
    const config = await this.getEffectiveConfig();
    return {
      provider: config.provider,
      model: config.model,
      decodoKeySet: !!config.decodoApiKey,
      anthropicKeySet: !!config.anthropicApiKey,
      openaiKeySet: !!config.openaiApiKey,
      geminiKeySet: !!config.geminiApiKey,
    };
  }

  async update(input: UpdateSettingsInput): Promise<SettingsStatus> {
    const patch: Record<string, string> = {};
    for (const [k, v] of Object.entries(input)) {
      if (typeof v === 'string' && v.trim()) {
        patch[k] = v.trim();
      }
    }

    const fields = Object.keys(patch);
    if (fields.length > 0) {
      this.logger.log(`[Settings] Updating fields: ${fields.join(', ')}`);
      await this.settingsModel
        .findOneAndUpdate({ key: 'global' }, { $set: patch }, { upsert: true, new: true })
        .exec();
      this.configCache = null;
      this.configInFlight = null; // invalidate so next read fetches fresh values
      this.logger.log(`[Settings] Saved to DB`);
    } else {
      this.logger.log(`[Settings] No fields to update (all inputs were empty)`);
    }

    return this.getStatus();
  }
}
