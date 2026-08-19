import type { Band } from '../data/types';
import type { SiteView } from '../domain/derive';
import { BAND_CENTER } from './colors';

const BAND_LABEL: Record<Band, string> = {
  good: 'Alto',
  moderate: 'Medio',
  poor: 'Bajo',
};

function supportsFineHover(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
}

export function renderSemaforo(
  map: google.maps.Map,
  siteViews: SiteView[],
): google.maps.Marker[] {
  let activeInfo: google.maps.InfoWindow | null = null;

  const closeActive = () => {
    activeInfo?.close();
    activeInfo = null;
  };

  const markers = siteViews.map((site) => {
    const color = BAND_CENTER[site.band];
    const bandLabel = BAND_LABEL[site.band];
    const marker = new google.maps.Marker({
      map,
      position: site.location,
      title: `${site.name} — ${bandLabel}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: color,
        fillOpacity: 0.95,
        strokeColor: '#1c2a1f',
        strokeWeight: 1.5,
      },
    });

    const info = new google.maps.InfoWindow({
      content: `<div style="font:14px/1.4 system-ui,sans-serif;max-width:240px">
        <strong>${escapeHtml(site.name)}</strong><br/>
        Semáforo: ${escapeHtml(bandLabel)}<br/>
        Árboles examinados: ${site.treesExamined}<br/>
        Con líquenes: ${site.treesWithLichen}<br/>
        Incidencia: ${(site.prevalence * 100).toFixed(1)}%
      </div>`,
    });

    const openInfo = () => {
      if (activeInfo && activeInfo !== info) {
        activeInfo.close();
      }
      activeInfo = info;
      info.open({ map, anchor: marker });
    };

    marker.addListener('click', () => openInfo());

    if (supportsFineHover()) {
      marker.addListener('mouseover', () => openInfo());
      marker.addListener('mouseout', () => {
        if (activeInfo === info) {
          closeActive();
        }
      });
    }

    return marker;
  });

  map.addListener('click', () => closeActive());

  return markers;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
