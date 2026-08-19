import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderSemaforo } from './semaforoLayer';
import { BAND_CENTER } from './colors';
import type { SiteView } from '../domain/derive';

const markers: Array<{
  options: Record<string, unknown>;
  listeners: Array<{ event: string; handler: () => void }>;
}> = [];
const mapListeners: Array<{ event: string; handler: () => void }> = [];

beforeEach(() => {
  markers.length = 0;
  mapListeners.length = 0;
  vi.stubGlobal('google', {
    maps: {
      Marker: class {
        options: Record<string, unknown>;
        listeners: Array<{ event: string; handler: () => void }> = [];
        constructor(options: Record<string, unknown>) {
          this.options = options;
          markers.push(this);
        }
        addListener(event: string, handler: () => void) {
          this.listeners.push({ event, handler });
          return { remove() {} };
        }
        setMap() {}
      },
      InfoWindow: class {
        constructor(_options: Record<string, unknown>) {}
        open() {}
        close() {}
        addListener() {
          return { remove() {} };
        }
      },
      event: {
        addListenerOnce(_target: unknown, _event: string, handler: () => void) {
          handler();
          return { remove() {} };
        },
      },
      SymbolPath: { CIRCLE: 0 },
    },
  });
});

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
];

describe('Semáforo Default / Default semáforo', () => {
  it('renders one colored marker per site without enabling heat', () => {
    const map = {
      addListener(event: string, handler: () => void) {
        mapListeners.push({ event, handler });
        return { remove() {} };
      },
    } as unknown as google.maps.Map;
    const result = renderSemaforo(map, views);
    expect(result).toHaveLength(2);
    expect(markers).toHaveLength(2);
    expect((markers[0].options.icon as { fillColor: string }).fillColor).toBe(
      BAND_CENTER.poor,
    );
    expect((markers[1].options.icon as { fillColor: string }).fillColor).toBe(
      BAND_CENTER.good,
    );
    expect(markers[0].options.title).toContain('Bajo');
    expect(markers[0].listeners.some((l) => l.event === 'click')).toBe(true);
    expect(mapListeners.some((l) => l.event === 'click')).toBe(true);
  });

  it('includes sample photo markup and floating close control', async () => {
    const { siteCardHtml } = await import('./semaforoLayer');
    const html = siteCardHtml(views[0]);
    expect(html).toContain('./photos/av-benavides.jpg');
    expect(html).toContain('Av. Benavides');
    expect(html).toContain('site-card-close');
  });
});
