import { Controller, Get, Patch, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /settings
   * Returns current config status — key presence only, never actual values.
   */
  @Get()
  async getStatus() {
    return this.settingsService.getStatus();
  }

  /**
   * PATCH /settings
   * Updates one or more settings. Empty-string values are ignored.
   * Returns updated status after save.
   */
  @Patch()
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }
}
