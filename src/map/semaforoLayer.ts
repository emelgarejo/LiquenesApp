import type { Band } from '../data/types';
import type { SiteView } from '../domain/derive';
import { BAND_CENTER } from './colors';

const BAND_LABEL: Record<Band, string> = {
  good: 'Alto',
  moderate: 'Medio',
  poor: 'Bajo',
};

export function renderSemaforo(
  map: google.maps.Map,
  siteViews: SiteView[],
): google.maps.Marker[] {
  return siteViews.map((site) => {
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

    marker.addListener('mouseover', () => info.open({ map, anchor: marker }));
    marker.addListener('mouseout', () => info.close());
    return marker;
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
