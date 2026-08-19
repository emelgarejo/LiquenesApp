import type { BoundaryFeatureCollection } from '../data/loadDataset';

export function renderBoundary(
  map: google.maps.Map,
  boundary: BoundaryFeatureCollection,
): google.maps.Data.Feature[] {
  const features = map.data.addGeoJson(boundary as object);
  map.data.setStyle({
    fillColor: '#c4a574',
    fillOpacity: 0.08,
    strokeColor: '#c4a574',
    strokeOpacity: 0.9,
    strokeWeight: 2,
  });
  return features;
}
