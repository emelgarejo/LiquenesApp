import type { RawStudyDataset } from './types';

export interface BoundaryFeatureCollection {
  type: 'FeatureCollection';
  features: unknown[];
}

export interface LoadedDataset {
  study: RawStudyDataset;
  boundary: BoundaryFeatureCollection;
}

async function fetchJson(url: string): Promise<unknown> {
  const cacheBust = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
  const response = await fetch(cacheBust, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: HTTP ${response.status}`);
  }
  return response.json();
}

export async function loadDataset(
  studyUrl = './data/chama-study.json',
  boundaryUrl = './data/chama-boundary.geojson',
): Promise<LoadedDataset> {
  const [study, boundary] = await Promise.all([
    fetchJson(studyUrl),
    fetchJson(boundaryUrl),
  ]);

  if (
    typeof boundary !== 'object' ||
    boundary === null ||
    (boundary as BoundaryFeatureCollection).type !== 'FeatureCollection'
  ) {
    throw new Error('Boundary GeoJSON must be a FeatureCollection');
  }

  return {
    study: study as RawStudyDataset,
    boundary: boundary as BoundaryFeatureCollection,
  };
}
