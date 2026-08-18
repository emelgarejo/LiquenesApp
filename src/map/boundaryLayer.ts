import type { BoundaryFeatureCollection } from '../data/loadDataset';

export function renderBoundary(
  map: google.maps.Map,
  boundary: BoundaryFeatureCollection,
): google.maps.Data.Feature[] {
  const features = map.data.addGeoJson(boundary as object);
  map.data.setStyle({
    fillColor: '#3a6b4f',
    fillOpacity: 0.12,
    strokeColor: '#2f513c',
    strokeOpacity: 0.95,
    strokeWeight: 2,
  });
  return features;
}
