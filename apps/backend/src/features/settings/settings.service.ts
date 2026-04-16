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

  constructor(
    @InjectModel(Settings.name)
    private readonly settingsModel: Model<SettingsDocument>,
    private readonly configService: ConfigService,
  ) {}

  async getEffectiveConfig(): Promise<EffectiveConfig> {
    let doc: SettingsDocument | null = null;
    try {
      doc = await this.settingsModel.findOne({ key: 'global' }).exec();
    } catch (err) {
      this.logger.warn(`Failed to read settings from DB: ${String(err)}`);
    }

    const envLlm = this.configService.llm;
    const envDecodo = this.configService.decodo;

    return {
      provider: doc?.provider || envLlm.provider || 'claude',
      model: doc?.model || envLlm.model || '',
      decodoApiKey: doc?.decodoApiKey || envDecodo.apiKey || '',
      anthropicApiKey: doc?.anthropicApiKey || envLlm.anthropicApiKey || '',
      openaiApiKey: doc?.openaiApiKey || envLlm.openaiApiKey || '',
      geminiApiKey: doc?.geminiApiKey || envLlm.geminiApiKey || '',
    };
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

    if (Object.keys(patch).length > 0) {
      await this.settingsModel
        .findOneAndUpdate({ key: 'global' }, { $set: patch }, { upsert: true, new: true })
        .exec();
    }

    return this.getStatus();
  }
}
