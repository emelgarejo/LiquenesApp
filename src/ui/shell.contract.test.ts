import { describe, expect, it } from 'vitest';
import { renderLegend } from './legend';
import { renderProvisionalNotice } from './provisionalNotice';
import { showStatus, hideStatus } from './statusView';
import { MissingMapsKeyError, readEnv } from '../config/env';
import { statusFromValidation } from '../boot/statusFromValidation';
import { validateDataset } from '../data/validateDataset';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Legend / Semáforo legend', () => {
  it('renders Alto Medio Bajo legend for semáforo', () => {
    const el = document.createElement('div');
    renderLegend(el, { heatEnabled: false });
    expect(el.hidden).toBe(false);
    expect(el.textContent).toMatch(/Alto/);
    expect(el.textContent).toMatch(/Medio/);
    expect(el.textContent).toMatch(/Bajo/);
  });
});

describe('Provisional Label / Label visible', () => {
  it('renders dataset status badge', () => {
    const el = document.createElement('div');
    renderProvisionalNotice(el, 'field-study');
    expect(el.textContent).toContain('field-study dataset');
  });
});

describe('Provisional Shell Notice / Notice visible', () => {
  it('shows shell notice for study status', () => {
    const el = document.createElement('div');
    renderProvisionalNotice(el, 'field-study');
    expect(el.querySelector('.provisional-badge')?.textContent).toMatch(
      /field-study/,
    );
  });
});

describe('Maps API Key / Missing key error', () => {
  it('fails fast when VITE_GOOGLE_MAPS_API_KEY is missing', () => {
    expect(() =>
      readEnv({ VITE_GOOGLE_MAPS_API_KEY: '' } as ImportMetaEnv),
    ).toThrow(MissingMapsKeyError);
  });

  it('shows config status for missing Maps key', () => {
    const el = document.createElement('div');
    showStatus(el, 'config', 'Maps API key missing', 'Set VITE_GOOGLE_MAPS_API_KEY');
    expect(el.className).toContain('visible');
    expect(el.textContent).toMatch(/Maps API key missing/);
  });
});

describe('Empty Invalid States / Invalid dataset', () => {
  it('maps missing study to Invalid dataset status', () => {
    const validated = validateDataset({ sites: [] });
    const status = statusFromValidation(validated);
    expect(status?.title).toBe('Invalid dataset');
    expect(status?.kind).toBe('data');
  });
});

describe('Empty Invalid States / Zero sites', () => {
  it('maps study with zero usable sites to empty status', () => {
    const validated = validateDataset({
      schemaVersion: '1.0.0',
      study: { id: 'x', title: 't', status: 'field-study' },
      sites: [
        {
          id: 'bad',
          name: 'Bad',
          kind: 'park',
          location: { lat: -12.12, lng: -76.99 },
          trafficExposure: 'low',
          pollutionProxy: { basis: 'derived_from_lichen' },
        },
      ],
    });
    const status = statusFromValidation(validated);
    expect(status?.title).toBe('No usable sites');
    expect(status?.kind).toBe('empty');

    const el = document.createElement('div');
    showStatus(el, status!.kind, status!.title, status!.message);
    expect(el.textContent).toMatch(/No usable sites/);
    hideStatus(el);
    expect(el.className).toBe('status');
  });
});

describe('Static Vite SPA / Static host', () => {
  it('uses relative base ./ for static hosting', () => {
    const src = readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf8');
    expect(src).toMatch(/base:\s*['"]\.\/['"]/);
  });
});
