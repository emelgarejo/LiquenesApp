import { describe, expect, it } from 'vitest';
import { validateDataset } from './validateDataset';
import type { RawStudyDataset } from './types';

function baseSite(overrides: Record<string, unknown> = {}) {
  return {
    id: 'park-1',
    name: 'Parque Central',
    kind: 'park',
    location: { lat: -12.1245, lng: -76.9955 },
    trafficExposure: 'low',
    sampling: {
      treesExamined: 10,
      treesWithLichen: 8,
      avgCoverByMorphology: { crustose: 2, foliose: 18, fruticose: 5 },
      dominantMorphology: 'foliose',
    },
    pollutionProxy: {
      airQualityBand: 'good',
      basis: 'derived_from_lichen',
    },
    ...overrides,
  };
}

function dataset(sites: unknown[]): RawStudyDataset {
  return {
    schemaVersion: '1.0.0',
    study: {
      id: 'chama-2026',
      title: 'Chama lichen study',
      status: 'provisional',
      area: 'Urbanización Chama',
    },
    sites: sites as RawStudyDataset['sites'],
  };
}

describe('validateDataset', () => {
  it('accepts sites with sampling + pollutionProxy and no observations', () => {
    const result = validateDataset(dataset([baseSite()]));
    expect(result.usableSites).toHaveLength(1);
    expect(result.issues.filter((i) => i.severity === 'error')).toHaveLength(0);
  });

  it('drops sites missing sampling', () => {
    const site = baseSite();
    delete (site as { sampling?: unknown }).sampling;
    const result = validateDataset(dataset([site]));
    expect(result.usableSites).toHaveLength(0);
    expect(result.issues.some((i) => i.code === 'missing_sampling')).toBe(true);
  });

  it('rejects lichen=0 with nonzero cover', () => {
    const result = validateDataset(
      dataset([
        baseSite({
          sampling: {
            treesExamined: 10,
            treesWithLichen: 0,
            avgCoverByMorphology: { crustose: 5, foliose: 0, fruticose: 0 },
            dominantMorphology: 'crustose',
          },
        }),
      ]),
    );
    expect(result.usableSites).toHaveLength(0);
    expect(result.issues.some((i) => i.code === 'cover_without_lichen')).toBe(
      true,
    );
  });

  it('keeps valid sites when another site is invalid', () => {
    const bad = baseSite({ id: 'bad' });
    delete (bad as { sampling?: unknown }).sampling;
    const result = validateDataset(dataset([baseSite(), bad]));
    expect(result.usableSites).toHaveLength(1);
    expect(result.usableSites[0].id).toBe('park-1');
  });
});
