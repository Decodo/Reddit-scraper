import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TrackerService } from './tracker.service';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { AnalyzePlanDto } from './dto/analyze-plan.dto';

@Controller('tracker')
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  /**
   * POST /tracker/plan
   * Takes a natural language prompt and returns a suggested scraping plan
   * (subreddits, queries, time range). The user can review and adjust before executing.
   */
  @Post('plan')
  @HttpCode(HttpStatus.OK)
  async generatePlan(@Body() dto: GeneratePlanDto) {
    return this.trackerService.generatePlan(dto);
  }

  /**
   * POST /tracker/analyze
   * Accepts a confirmed scraping plan, executes scraping via Decodo,
   * and returns an LLM-generated intelligence report.
   */
  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  async analyzePlan(@Body() dto: AnalyzePlanDto) {
    return this.trackerService.analyzePlan(dto);
  }
}
