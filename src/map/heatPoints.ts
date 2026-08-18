import type { Band } from '../data/types';
import type { SiteView } from '../domain/derive';

export interface HeatPoint {
  position: [number, number];
  weight: number;
}

const METERS_PER_DEG_LAT = 111_320;

function offsetDegrees(
  lat: number,
  metersEast: number,
  metersNorth: number,
): { dLat: number; dLng: number } {
  const dLat = metersNorth / METERS_PER_DEG_LAT;
  const dLng =
    metersEast / (METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));
  return { dLat, dLng };
}

/** Strong enough for Bajo to paint, still scales a bit with incidence. */
export function bandHeatWeight(prevalence: number): number {
  return 35 + prevalence * 65;
}

function expandSite(lat: number, lng: number, weight: number): HeatPoint[] {
  const points: HeatPoint[] = [{ position: [lng, lat], weight }];

  const outer = 10;
  const outerM = 75;
  for (let i = 0; i < outer; i++) {
    const angle = (i / outer) * Math.PI * 2;
    const { dLat, dLng } = offsetDegrees(
      lat,
      Math.cos(angle) * outerM,
      Math.sin(angle) * outerM,
    );
    points.push({
      position: [lng + dLng, lat + dLat],
      weight: weight * 0.65,
    });
  }

  const inner = 6;
  const innerM = 38;
  for (let i = 0; i < inner; i++) {
    const angle = (i / inner) * Math.PI * 2 + Math.PI / inner;
    const { dLat, dLng } = offsetDegrees(
      lat,
      Math.cos(angle) * innerM,
      Math.sin(angle) * innerM,
    );
    points.push({
      position: [lng + dLng, lat + dLat],
      weight: weight * 0.85,
    });
  }

  return points;
}

/** Heat samples for a single semáforo band (for per-color HeatmapLayer). */
export function heatPointsForBand(
  siteViews: SiteView[],
  band: Band,
): HeatPoint[] {
  const points: HeatPoint[] = [];
  for (const site of siteViews) {
    if (site.band !== band) continue;
    const { lat, lng } = site.location;
    points.push(
      ...expandSite(lat, lng, bandHeatWeight(site.prevalence)),
    );
  }
  return points;
}

/** @deprecated use heatPointsForBand — kept for callers that want all points */
export function heatPointsFromSiteViews(siteViews: SiteView[]): HeatPoint[] {
  return ([...siteViews] as SiteView[]).flatMap((site) =>
    expandSite(
      site.location.lat,
      site.location.lng,
      bandHeatWeight(site.prevalence),
    ),
  );
}
