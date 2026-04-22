import type { EffectiveConfig } from '../../settings/settings.service';
import type { LlmRequest, LlmResponse } from '../llm.types';

export interface LlmStrategy {
  complete(
    request: LlmRequest,
    config: EffectiveConfig,
    signal?: AbortSignal,
  ): Promise<LlmResponse>;
}
