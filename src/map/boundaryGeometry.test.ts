import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  centerFromBoundary,
  isValidBoundaryPolygon,
} from '../map/boundaryGeometry';
import type { BoundaryFeatureCollection } from '../data/loadDataset';

const boundary = JSON.parse(
  readFileSync(join(process.cwd(), 'public/data/chama-boundary.geojson'), 'utf8'),
) as BoundaryFeatureCollection;

describe('Chama Boundary / Boundary visible', () => {
  it('ships a closed Polygon FeatureCollection for Chama', () => {
    expect(isValidBoundaryPolygon(boundary)).toBe(true);
    const feature = boundary.features[0] as {
      properties?: { name?: string };
    };
    expect(feature.properties?.name).toMatch(/Chama/i);
  });

  it('computes a map center inside the digitized ring', () => {
    const center = centerFromBoundary(boundary, { lat: 0, lng: 0 });
    expect(center.lat).toBeGreaterThan(-12.13);
    expect(center.lat).toBeLessThan(-12.12);
    expect(center.lng).toBeGreaterThan(-77.01);
    expect(center.lng).toBeLessThan(-76.99);
  });
});
