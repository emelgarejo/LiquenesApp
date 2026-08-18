import { describe, expect, it } from 'vitest';
import { DEFAULT_THRESHOLDS, heatWeight } from '../config/thresholds';
import {
  avgCoverTotal,
  deriveBand,
  prevalence,
  toSiteViews,
} from './derive';
import type { UsableSite } from '../data/types';

describe('prevalence', () => {
  it('equals treesWithLichen / treesExamined for 1/12 (Benavides ficha)', () => {
    expect(prevalence(1, 12)).toBeCloseTo(1 / 12);
  });
});

describe('avgCoverTotal', () => {
  it('sums morphology averages over lichen-bearing trees only (never divides by treesExamined)', () => {
    const total = avgCoverTotal({ crustose: 8, foliose: 0, fruticose: 0 });
    expect(total).toBe(8);
  });
});

describe('deriveBand (ficha incidencia)', () => {
  it('classifies Benavides 1/12 (8.3%) as poor / Bajo', () => {
    const band = deriveBand(
      {
        treesExamined: 12,
        treesWithLichen: 1,
        avgCoverByMorphology: { crustose: 0, foliose: 0, fruticose: 0 },
        dominantMorphology: 'crustose',
      },
      DEFAULT_THRESHOLDS,
    );
    expect(band).toBe('poor');
  });

  it('classifies Aviación 1/12 as poor / Bajo', () => {
    expect(
      deriveBand({
        treesExamined: 12,
        treesWithLichen: 1,
        avgCoverByMorphology: { crustose: 0, foliose: 0, fruticose: 0 },
        dominantMorphology: 'crustose',
      }),
    ).toBe('poor');
  });

  it('classifies Parque La Coruña 20/20 as good / Alto', () => {
    expect(
      deriveBand({
        treesExamined: 20,
        treesWithLichen: 20,
        avgCoverByMorphology: { crustose: 0, foliose: 0, fruticose: 0 },
        dominantMorphology: 'crustose',
      }),
    ).toBe('good');
  });

  it('classifies Santos Chocano 4/6 (66.7%) as moderate / Medio', () => {
    expect(
      deriveBand({
        treesExamined: 6,
        treesWithLichen: 4,
        avgCoverByMorphology: { crustose: 0, foliose: 0, fruticose: 0 },
        dominantMorphology: 'crustose',
      }),
    ).toBe('moderate');
  });

  it('classifies Higuereta 6/10 (60%) as moderate / Medio', () => {
    expect(
      deriveBand({
        treesExamined: 10,
        treesWithLichen: 6,
        avgCoverByMorphology: { crustose: 0, foliose: 0, fruticose: 0 },
        dominantMorphology: 'crustose',
      }),
    ).toBe('moderate');
  });

  it('uses 70% inclusive boundary for Alto', () => {
    expect(
      deriveBand({
        treesExamined: 10,
        treesWithLichen: 7,
        avgCoverByMorphology: { crustose: 0, foliose: 0, fruticose: 0 },
        dominantMorphology: 'crustose',
      }),
    ).toBe('good');
  });

  it('uses 40% inclusive boundary for Medio', () => {
    expect(
      deriveBand({
        treesExamined: 10,
        treesWithLichen: 4,
        avgCoverByMorphology: { crustose: 0, foliose: 0, fruticose: 0 },
        dominantMorphology: 'crustose',
      }),
    ).toBe('moderate');
  });
});

describe('heatWeight', () => {
  it('is prevalence (incidencia) when cover is not measured', () => {
    expect(heatWeight(1 / 12)).toBeCloseTo(1 / 12);
    expect(heatWeight(1)).toBe(1);
  });
});

describe('toSiteViews', () => {
  it('builds site views for Benavides ficha sample', () => {
    const sites: UsableSite[] = [
      {
        id: 'benavides',
        name: 'Av. Benavides',
        kind: 'avenue',
        location: { lat: -12.1284, lng: -76.996 },
        trafficExposure: 'high',
        sampling: {
          treesExamined: 12,
          treesWithLichen: 1,
          avgCoverByMorphology: { crustose: 0, foliose: 0, fruticose: 0 },
          dominantMorphology: 'crustose',
        },
        pollutionProxy: {
          basis: 'derived_from_lichen',
        },
      },
    ];
    const { views } = toSiteViews(sites, DEFAULT_THRESHOLDS);
    expect(views).toHaveLength(1);
    expect(views[0].prevalence).toBeCloseTo(1 / 12);
    expect(views[0].band).toBe('poor');
    expect(views[0].bandSource).toBe('derived');
    expect(views[0].treesExamined).toBe(12);
    expect(views[0].treesWithLichen).toBe(1);
    expect(views[0].heatWeight).toBeCloseTo(1 / 12);
  });
});
