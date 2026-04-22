import type { EffectiveConfig } from '../../settings/settings.service';
import type { LlmRequest, LlmResponse } from '../llm.types';

export interface LlmStrategyArgs {
  request: LlmRequest;
  config: EffectiveConfig;
  signal?: AbortSignal;
}

export interface LlmStrategy {
  complete(args: LlmStrategyArgs): Promise<LlmResponse>;
}
