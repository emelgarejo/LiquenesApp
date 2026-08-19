import { describe, expect, it } from 'vitest';
import {
  bandHeatWeight,
  heatPointsForBand,
  heatPointsFromSiteViews,
} from './heatPoints';
import type { SiteView } from '../domain/derive';

const views: SiteView[] = [
  {
    id: 'av-benavides',
    name: 'Av. Benavides',
    kind: 'avenue',
    location: { lat: -12.1284, lng: -76.9965 },
    prevalence: 1 / 12,
    avgCoverTotal: 0,
    band: 'poor',
    bandSource: 'derived',
    heatWeight: 1 / 12,
    treesExamined: 12,
    treesWithLichen: 1,
    photoUrl: './photos/av-benavides.jpg',
  },
  {
    id: 'parque-la-coruna',
    name: 'Parque La Coruña',
    kind: 'park',
    location: { lat: -12.1252, lng: -76.9968 },
    prevalence: 1,
    avgCoverTotal: 0,
    band: 'good',
    bandSource: 'derived',
    heatWeight: 1,
    treesExamined: 20,
    treesWithLichen: 20,
    photoUrl: './photos/parque-la-coruna.jpg',
  },
  {
    id: 'av-higuereta',
    name: 'Av. Higuereta',
    kind: 'avenue',
    location: { lat: -12.1265, lng: -76.9916 },
    prevalence: 0.6,
    avgCoverTotal: 0,
    band: 'moderate',
    bandSource: 'derived',
    heatWeight: 0.6,
    treesExamined: 10,
    treesWithLichen: 6,
    photoUrl: './photos/av-higuereta.jpg',
  },
];

describe('Optional Heat / Heat from study', () => {
  it('keeps Bajo visible while Alto stays stronger', () => {
    expect(bandHeatWeight(1 / 12)).toBeLessThan(bandHeatWeight(1));
    expect(bandHeatWeight(1 / 12)).toBeGreaterThan(30);
  });

  it('splits heat points by semáforo band for per-color layers', () => {
    expect(heatPointsForBand(views, 'poor').length).toBe(17);
    expect(heatPointsForBand(views, 'good').length).toBe(17);
    expect(heatPointsForBand(views, 'moderate').length).toBe(17);
    expect(heatPointsFromSiteViews(views).length).toBe(51);
  });
});
