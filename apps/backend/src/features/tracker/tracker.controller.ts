import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { TrackerService } from './tracker.service';
import type { OnProgress } from './tracker.service';
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

  /**
   * POST /tracker/analyze/stream
   * Same as /analyze but streams progress as Server-Sent Events so the UI
   * can show live scraping progress. Final event type is 'complete' (full result);
   * errors arrive as type 'error'.
   */
  @Post('analyze/stream')
  async analyzePlanStream(
    @Body() dto: AnalyzePlanDto,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (data: object) => {
      if (!res.destroyed) res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const onProgress: OnProgress = (event) => send(event);

    try {
      const result = await this.trackerService.analyzePlan(dto, onProgress);
      send({ type: 'complete', ...result });
    } catch (err) {
      send({ type: 'error', message: err instanceof Error ? err.message : String(err) });
    } finally {
      res.end();
    }
  }
}
