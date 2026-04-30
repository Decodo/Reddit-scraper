import { Controller, Get, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { QueriesService } from './queries.service';

@Controller('queries')
export class QueriesController {
  constructor(private readonly queriesService: QueriesService) {}

  /**
   * GET /queries
   * Returns all past queries (without raw scraped posts to keep response light).
   */
  @Get()
  async findAll() {
    return this.queriesService.findAll();
  }

  /**
   * GET /queries/:id
   * Returns a single query including full posts and report.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.queriesService.findOne(id);
  }

  /**
   * DELETE /queries/:id
   * Removes a query from history.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.queriesService.remove(id);
  }
}
