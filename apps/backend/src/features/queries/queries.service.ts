import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Query, QueryDocument } from './queries.schema';
import type { ScrapingPlan, RedditReport } from '../llm/llm.types';
import type { RedditPost } from '../decodo/decodo.types';

export interface CreateQueryDto {
  prompt: string;
  plan: ScrapingPlan;
  posts: RedditPost[];
  report: RedditReport;
}

@Injectable()
export class QueriesService {
  constructor(
    @InjectModel(Query.name) private readonly queryModel: Model<QueryDocument>,
  ) {}

  async create(dto: CreateQueryDto): Promise<QueryDocument> {
    const query = new this.queryModel(dto);
    return query.save();
  }

  async findAll(): Promise<QueryDocument[]> {
    return this.queryModel
      .find()
      .select('-posts')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<QueryDocument> {
    const query = await this.queryModel.findById(id).exec();
    if (!query) {
      throw new NotFoundException(`Query ${id} not found`);
    }
    return query;
  }

  async remove(id: string): Promise<void> {
    const result = await this.queryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Query ${id} not found`);
    }
  }
}
