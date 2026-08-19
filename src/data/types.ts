export type Band = 'good' | 'moderate' | 'poor';
export type Morphology = 'crustose' | 'foliose' | 'fruticose';
export type SiteKind = 'park' | 'avenue' | 'other';
export type TrafficExposure = 'low' | 'medium' | 'high';
export type BandBasis = 'manual' | 'derived_from_lichen';

export interface AvgCoverByMorphology {
  crustose: number;
  foliose: number;
  fruticose: number;
}

export interface Sampling {
  treesExamined: number;
  treesWithLichen: number;
  avgCoverByMorphology: AvgCoverByMorphology;
  dominantMorphology: Morphology;
}

export interface PollutionProxy {
  airQualityBand?: Band;
  basis: BandBasis;
}

export interface SiteLocation {
  lat: number;
  lng: number;
}

export interface Observation {
  id?: string;
  notes?: string;
  photoUrl?: string;
}

export interface RawSite {
  id: string;
  name: string;
  kind: SiteKind;
  location: SiteLocation;
  trafficExposure: TrafficExposure;
  notes?: string;
  /** Optional sample photo URL (defaults to ./photos/{id}.jpg in the map card). */
  photoUrl?: string;
  sampling?: Sampling;
  pollutionProxy?: PollutionProxy;
  observations?: Observation[];
}

export interface StudyMeta {
  id: string;
  title: string;
  status: string;
  area?: string;
  institution?: string;
  sampledFrom?: string;
  sampledTo?: string;
  notes?: string;
}

export interface RawStudyDataset {
  schemaVersion: string;
  study: StudyMeta;
  sites: RawSite[];
}

export interface UsableSite {
  id: string;
  name: string;
  kind: SiteKind;
  location: SiteLocation;
  trafficExposure: TrafficExposure;
  notes?: string;
  photoUrl?: string;
  sampling: Sampling;
  pollutionProxy: PollutionProxy;
  observations?: Observation[];
}

export type IssueSeverity = 'error' | 'warning';

export interface ValidationIssue {
  severity: IssueSeverity;
  code: string;
  message: string;
  siteId?: string;
}

export interface ValidationResult {
  usableSites: UsableSite[];
  issues: ValidationIssue[];
  study: StudyMeta | null;
  schemaVersion: string | null;
}
