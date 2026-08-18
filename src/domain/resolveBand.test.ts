import { describe, expect, it } from 'vitest';
import { DEFAULT_THRESHOLDS } from '../config/thresholds';
import type { UsableSite } from '../data/types';
import { resolveBand } from './resolveBand';

const poorSampling = {
  treesExamined: 12,
  treesWithLichen: 1,
  avgCoverByMorphology: { crustose: 0, foliose: 0, fruticose: 0 },
  dominantMorphology: 'crustose' as const,
};

function site(
  pollutionProxy: UsableSite['pollutionProxy'],
): UsableSite {
  return {
    id: 's1',
    name: 'Test',
    kind: 'avenue',
    location: { lat: -12.125, lng: -76.995 },
    trafficExposure: 'high',
    sampling: poorSampling,
    pollutionProxy,
  };
}

describe('resolveBand', () => {
  it('lets manual override win over derived-poor sampling', () => {
    const result = resolveBand(
      site({ airQualityBand: 'moderate', basis: 'manual' }),
      DEFAULT_THRESHOLDS,
    );
    expect(result.band).toBe('moderate');
    expect(result.bandSource).toBe('manual');
    expect(result.warning).toBeUndefined();
  });

  it('derives and warns when basis is manual but band is missing', () => {
    const result = resolveBand(
      site({ basis: 'manual' }),
      DEFAULT_THRESHOLDS,
    );
    expect(result.band).toBe('poor');
    expect(result.bandSource).toBe('derived');
    expect(result.warning).toMatch(/manual/i);
  });

  it('always derives when basis is derived_from_lichen even if a stored band differs', () => {
    const result = resolveBand(
      site({ airQualityBand: 'good', basis: 'derived_from_lichen' }),
      DEFAULT_THRESHOLDS,
    );
    expect(result.band).toBe('poor');
    expect(result.bandSource).toBe('derived');
  });
});
