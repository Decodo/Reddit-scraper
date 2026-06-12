import { ServiceUnavailableException } from '@nestjs/common';
import { parseDecodoV2Response } from './decodo-response';

describe('parseDecodoV2Response', () => {
  it('returns status_code and content from results[0]', () => {
    const result = parseDecodoV2Response({
      results: [{ content: '{"data":{"children":[]}}', status_code: 200 }],
    });

    expect(result).toEqual({
      status_code: 200,
      content: '{"data":{"children":[]}}',
    });
  });

  it('throws with Decodo message when status is failed (HTTP 200 envelope)', () => {
    expect(() =>
      parseDecodoV2Response({
        status: 'failed',
        status_code: 613,
        message: 'Target returned an error',
      }),
    ).toThrow('Decodo scrape failed: Target returned an error');
  });

  it('throws with status code when failed envelope has no message', () => {
    expect(() =>
      parseDecodoV2Response({
        status: 'failed',
        status_code: 613,
      }),
    ).toThrow('Decodo scrape failed: status code 613');
  });

  it('throws for unexpected response shape', () => {
    expect(() => parseDecodoV2Response({ error: 'something went wrong' })).toThrow(
      ServiceUnavailableException,
    );
  });
});
