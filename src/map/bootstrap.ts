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

  return {
    map,
    async setHeatEnabled(enabled: boolean) {
      if (enabled) {
        if (!heat) {
          const { attachHeatOverlay } = await import('./heatOverlay');
          heat = attachHeatOverlay(map, siteViews);
        } else {
          heat.setMap(map);
        }
      } else if (heat) {
        heat.setMap(null);
      }
    },
    destroy() {
      heat?.finalize();
      heat = null;
      for (const marker of markers) {
        marker.setMap(null);
      }
    },
  };
}
