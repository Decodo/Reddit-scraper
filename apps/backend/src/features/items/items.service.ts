import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from './items.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private readonly itemModel: Model<ItemDocument>,
  ) {}

  async findAll(): Promise<ItemDocument[]> {
    return this.itemModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<ItemDocument> {
    const item = await this.itemModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return item;
  }

  async create(dto: CreateItemDto): Promise<ItemDocument> {
    const item = new this.itemModel(dto);
    return item.save();
  }

  async update(id: string, dto: UpdateItemDto): Promise<ItemDocument> {
    const item = await this.itemModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return item;
  }

  async remove(id: string): Promise<void> {
    const result = await this.itemModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Item ${id} not found`);
    }
  }
}
