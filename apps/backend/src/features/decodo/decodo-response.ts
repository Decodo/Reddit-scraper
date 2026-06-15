import { ServiceUnavailableException } from '@nestjs/common';

export interface DecodoV2Result {
  status_code: number;
  content: unknown;
}

export function parseDecodoV2Response(raw: Record<string, unknown>): DecodoV2Result {
  const results = raw['results'] as Array<{ content: unknown; status_code: number }> | undefined;
  const first = results?.[0];

  if (first) {
    return { status_code: first.status_code, content: first.content };
  }

  if (raw['status'] === 'failed') {
    const decodoMessage = raw['message'];
    const decodoStatusCode = raw['status_code'];
    const detail =
      typeof decodoMessage === 'string'
        ? decodoMessage
        : `status code ${String(decodoStatusCode ?? 'unknown')}`;
    throw new ServiceUnavailableException(`Decodo scrape failed: ${detail}`);
  }

  throw new ServiceUnavailableException('Decodo API returned unexpected response structure');
}
