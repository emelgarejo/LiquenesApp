import type { SiteView } from '../domain/derive';
import type { BoundaryFeatureCollection } from '../data/loadDataset';
import { centerFromBoundary } from './boundaryGeometry';
import { renderBoundary } from './boundaryLayer';
import { renderSemaforo } from './semaforoLayer';
import type { HeatOverlayHandle } from './heatOverlay';

export interface MapHandle {
  map: google.maps.Map;
  setHeatEnabled: (enabled: boolean) => Promise<void>;
  destroy: () => void;
}

/** Quiet dark basemap so school chrome and semáforo colors stay dominant. */
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d1f24' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1f24' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8f8578' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#3a342c' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1a2620' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2a2d34' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1c20' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3a342c' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#141820' }],
  },
];

function loadMapsScript(apiKey: string): Promise<typeof google> {
  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-chama-maps="true"]',
  );
  if (existing && window.google?.maps) {
    return Promise.resolve(window.google);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.chamaMaps = 'true';
    script.onload = () => {
      if (!window.google?.maps) {
        reject(new Error('Google Maps failed to initialize'));
        return;
      }
      resolve(window.google);
    };
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
}

export async function bootstrapMap(
  container: HTMLElement,
  apiKey: string,
  boundary: BoundaryFeatureCollection,
  siteViews: SiteView[],
): Promise<MapHandle> {
  await loadMapsScript(apiKey);

  const fallbackCenter = siteViews[0]?.location ?? {
    lat: -12.125,
    lng: -76.996,
  };
  const center = centerFromBoundary(boundary, fallbackCenter);

  const map = new google.maps.Map(container, {
    center,
    zoom: 16,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    clickableIcons: false,
    backgroundColor: '#101218',
    styles: DARK_MAP_STYLES,
  });

  renderBoundary(map, boundary);
  const markers = renderSemaforo(map, siteViews);

  if (siteViews.length > 0) {
    const bounds = new google.maps.LatLngBounds();
    for (const site of siteViews) {
      bounds.extend(site.location);
    }
    // Include boundary ring so the frame stays in view.
    try {
      const ring = (
        boundary.features[0] as { geometry?: { coordinates?: number[][][] } }
      )?.geometry?.coordinates?.[0];
      if (ring) {
        for (const [lng, lat] of ring) {
          bounds.extend({ lat, lng });
        }
      }
    } catch {
      /* ignore */
    }
    map.fitBounds(bounds, 48);
  }

  let heat: HeatOverlayHandle | null = null;
  let heatEpoch = 0;

  return {
    map,
    async setHeatEnabled(enabled: boolean) {
      const epoch = ++heatEpoch;

      // deck.gl GoogleMapsOverlay often fails to redraw after setMap(null) → setMap(map).
      // Tear down fully and recreate when enabling again.
      if (heat) {
        heat.finalize();
        heat = null;
      }

      if (!enabled) {
        return;
      }

      const { attachHeatOverlay } = await import('./heatOverlay');
      if (epoch !== heatEpoch) {
        return;
      }
      heat = attachHeatOverlay(map, siteViews);
    },
    destroy() {
      heatEpoch += 1;
      heat?.finalize();
      heat = null;
      for (const marker of markers) {
        marker.setMap(null);
      }
    },
  };
}
