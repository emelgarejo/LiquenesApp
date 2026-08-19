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

export function siteCardHtml(site: SiteView): string {
  const bandLabel = BAND_LABEL[site.band];
  return `<div class="site-card">
      <button type="button" class="site-card-close" aria-label="Cerrar">×</button>
      <img
        class="site-card-photo"
        src="${escapeHtml(site.photoUrl)}"
        alt="Muestra — ${escapeHtml(site.name)}"
        width="260"
        height="160"
        onerror="this.remove()"
      />
      <div class="site-card-body">
        <strong class="site-card-title">${escapeHtml(site.name)}</strong>
        <p>Semáforo: ${escapeHtml(bandLabel)}</p>
        <p>Árboles examinados: ${site.treesExamined}</p>
        <p>Con líquenes: ${site.treesWithLichen}</p>
        <p>Incidencia: ${(site.prevalence * 100).toFixed(1)}%</p>
      </div>
    </div>`;
}

function bindInfoWindowChrome(info: google.maps.InfoWindow, onClose: () => void): void {
  google.maps.event.addListenerOnce(info, 'domready', () => {
    document
      .querySelectorAll<HTMLButtonElement>('.site-card-close')
      .forEach((btn) => {
        btn.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        };
      });
  });
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
      content: siteCardHtml(site),
      maxWidth: 280,
      // Removes the default header row that left empty top space + square close control.
      headerDisabled: true,
    } as google.maps.InfoWindowOptions);

    const openInfo = () => {
      if (activeInfo && activeInfo !== info) {
        activeInfo.close();
      }
      activeInfo = info;
      bindInfoWindowChrome(info, closeActive);
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
