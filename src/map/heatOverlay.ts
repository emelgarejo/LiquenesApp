import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import type { Band } from '../data/types';
import type { SiteView } from '../domain/derive';
import { heatPointsForBand, type HeatPoint } from './heatPoints';

export interface HeatOverlayHandle {
  setMap: (map: google.maps.Map | null) => void;
  finalize: () => void;
}

type Rgba = [number, number, number, number];

/** Single-hue ramps so each band keeps its color; overlapping layers blend. */
const BAND_HEAT_COLORS: Record<Band, Rgba[]> = {
  poor: [
    [192, 57, 43, 0],
    [192, 57, 43, 40],
    [192, 57, 43, 85],
    [192, 57, 43, 125],
    [192, 57, 43, 155],
  ],
  moderate: [
    [212, 160, 23, 0],
    [212, 160, 23, 40],
    [212, 160, 23, 85],
    [212, 160, 23, 125],
    [212, 160, 23, 155],
  ],
  good: [
    [47, 143, 78, 0],
    [47, 143, 78, 55],
    [47, 143, 78, 110],
    [47, 143, 78, 165],
    [47, 143, 78, 200],
  ],
};

/** Draw order: good (bottom) → moderate → poor (top) so red wins overlaps. */
const BANDS: Band[] = ['good', 'moderate', 'poor'];

function layerForBand(band: Band, data: HeatPoint[]): HeatmapLayer<HeatPoint> {
  return new HeatmapLayer<HeatPoint>({
    id: `chama-heat-${band}`,
    data,
    getPosition: (d) => d.position,
    getWeight: (d) => d.weight,
    radiusPixels: 105,
    intensity: 1.25,
    threshold: 0.012,
    colorRange: BAND_HEAT_COLORS[band],
    // Green sits under yellow/red and over park tiles — keep it a bit stronger.
    opacity: band === 'good' ? 0.7 : 0.55,
  });
}

/**
 * Three heatmap layers (rojo / amarillo / verde). Same-band points merge;
 * different bands overlap and diffuse into each other on the map.
 */
export function attachHeatOverlay(
  map: google.maps.Map,
  siteViews: SiteView[],
): HeatOverlayHandle {
  const layers = BANDS.map((band) =>
    layerForBand(band, heatPointsForBand(siteViews, band)),
  ).filter((layer) => (layer.props.data as HeatPoint[]).length > 0);

  const overlay = new GoogleMapsOverlay({
    interleaved: false,
    layers,
  });

  overlay.setMap(map);

  return {
    setMap(next) {
      overlay.setMap(next);
    },
    finalize() {
      overlay.setMap(null);
      overlay.finalize();
    },
  };
}
