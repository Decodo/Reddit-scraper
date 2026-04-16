import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ timestamps: true })
export class Settings {
  /** Always 'global' — only one settings document exists */
  @Prop({ default: 'global' })
  key: string;

  @Prop()
  provider?: string;

  @Prop()
  model?: string;

  @Prop()
  decodoApiKey?: string;

  @Prop()
  anthropicApiKey?: string;

  @Prop()
  openaiApiKey?: string;

  @Prop()
  geminiApiKey?: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
SettingsSchema.index({ key: 1 }, { unique: true });
