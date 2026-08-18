import type { BoundaryFeatureCollection } from '../data/loadDataset';

export function centerFromBoundary(
  boundary: BoundaryFeatureCollection,
  fallback: { lat: number; lng: number },
): { lat: number; lng: number } {
  try {
    const feature = boundary.features[0] as {
      geometry?: { coordinates?: number[][][] };
    };
    const ring = feature?.geometry?.coordinates?.[0];
    if (!ring?.length) return fallback;
    let sumLat = 0;
    let sumLng = 0;
    for (const [lng, lat] of ring) {
      sumLat += lat;
      sumLng += lng;
    }
    return { lat: sumLat / ring.length, lng: sumLng / ring.length };
  } catch {
    return fallback;
  }
}

/** True when GeoJSON has a closed Polygon usable as Chama boundary. */
export function isValidBoundaryPolygon(
  boundary: BoundaryFeatureCollection,
): boolean {
  const feature = boundary.features?.[0] as
    | { geometry?: { type?: string; coordinates?: number[][][] } }
    | undefined;
  if (!feature?.geometry || feature.geometry.type !== 'Polygon') {
    return false;
  }
  const ring = feature.geometry.coordinates?.[0];
  if (!ring || ring.length < 4) return false;
  const first = ring[0];
  const last = ring[ring.length - 1];
  return first[0] === last[0] && first[1] === last[1];
}
