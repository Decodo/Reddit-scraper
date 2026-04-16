import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { ScrapingPlan, RedditReport } from '../llm/llm.types';
import type { RedditPost } from '../decodo/decodo.types';

export type QueryDocument = HydratedDocument<Query>;

@Schema({ timestamps: true })
export class Query {
  @Prop({ required: true })
  prompt: string;

  @Prop({ type: Object, required: true })
  plan: ScrapingPlan;

  @Prop({ type: Array, default: [] })
  posts: RedditPost[];

  @Prop({ type: Object, required: true })
  report: RedditReport;
}

export const QuerySchema = SchemaFactory.createForClass(Query);
