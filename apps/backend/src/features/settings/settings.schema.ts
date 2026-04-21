import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

/** Stores user-selected LLM preferences. API keys are never stored here. */
@Schema({ timestamps: true })
export class Settings {
  /** Always 'global' — only one settings document exists */
  @Prop({ default: 'global' })
  key: string;

  @Prop()
  provider?: string;

  @Prop()
  model?: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
SettingsSchema.index({ key: 1 }, { unique: true });
