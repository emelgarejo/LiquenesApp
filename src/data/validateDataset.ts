import type {
  AvgCoverByMorphology,
  Band,
  BandBasis,
  Morphology,
  PollutionProxy,
  RawSite,
  RawStudyDataset,
  Sampling,
  SiteKind,
  TrafficExposure,
  UsableSite,
  ValidationIssue,
  ValidationResult,
} from './types';

const KINDS = new Set<SiteKind>(['park', 'avenue', 'other']);
const EXPOSURES = new Set<TrafficExposure>(['low', 'medium', 'high']);
const MORPHOLOGIES = new Set<Morphology>([
  'crustose',
  'foliose',
  'fruticose',
]);
const BANDS = new Set<Band>(['good', 'moderate', 'poor']);
const BASES = new Set<BandBasis>(['manual', 'derived_from_lichen']);

/** Approximate Chama study bbox for out-of-area warnings only. */
const CHAMA_BBOX = {
  minLat: -12.132,
  maxLat: -12.118,
  minLng: -77.004,
  maxLng: -76.988,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isInteger(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value);
}

function push(
  issues: ValidationIssue[],
  issue: ValidationIssue,
): void {
  issues.push(issue);
}

function parseCover(
  raw: unknown,
  siteId: string,
  issues: ValidationIssue[],
): AvgCoverByMorphology | null {
  if (!isRecord(raw)) {
    push(issues, {
      severity: 'error',
      code: 'invalid_cover',
      message: 'avgCoverByMorphology must be an object',
      siteId,
    });
    return null;
  }
  const crustose = raw.crustose;
  const foliose = raw.foliose;
  const fruticose = raw.fruticose;
  for (const [key, value] of [
    ['crustose', crustose],
    ['foliose', foliose],
    ['fruticose', fruticose],
  ] as const) {
    if (!isFiniteNumber(value) || value < 0 || value > 100) {
      push(issues, {
        severity: 'error',
        code: 'invalid_cover',
        message: `${key} cover must be a number in [0, 100]`,
        siteId,
      });
      return null;
    }
  }
  return {
    crustose: crustose as number,
    foliose: foliose as number,
    fruticose: fruticose as number,
  };
}

function parseSampling(
  raw: unknown,
  siteId: string,
  issues: ValidationIssue[],
): Sampling | null {
  if (!isRecord(raw)) {
    push(issues, {
      severity: 'error',
      code: 'missing_sampling',
      message: 'sampling is required',
      siteId,
    });
    return null;
  }

  const treesExamined = raw.treesExamined;
  const treesWithLichen = raw.treesWithLichen;
  if (!isInteger(treesExamined) || treesExamined <= 0) {
    push(issues, {
      severity: 'error',
      code: 'invalid_trees_examined',
      message: 'treesExamined must be an integer > 0',
      siteId,
    });
    return null;
  }
  if (
    !isInteger(treesWithLichen) ||
    treesWithLichen < 0 ||
    treesWithLichen > treesExamined
  ) {
    push(issues, {
      severity: 'error',
      code: 'invalid_trees_with_lichen',
      message: 'treesWithLichen must be an integer in [0, treesExamined]',
      siteId,
    });
    return null;
  }

  const cover = parseCover(raw.avgCoverByMorphology, siteId, issues);
  if (!cover) return null;

  if (
    treesWithLichen === 0 &&
    (cover.crustose !== 0 || cover.foliose !== 0 || cover.fruticose !== 0)
  ) {
    push(issues, {
      severity: 'error',
      code: 'cover_without_lichen',
      message:
        'treesWithLichen === 0 requires all avgCoverByMorphology values to be 0',
      siteId,
    });
    return null;
  }

  const dominant = raw.dominantMorphology;
  if (treesWithLichen > 0) {
    if (typeof dominant !== 'string' || !MORPHOLOGIES.has(dominant as Morphology)) {
      push(issues, {
        severity: 'error',
        code: 'missing_dominant_morphology',
        message:
          'dominantMorphology is required when treesWithLichen > 0',
        siteId,
      });
      return null;
    }
  }

  return {
    treesExamined,
    treesWithLichen,
    avgCoverByMorphology: cover,
    dominantMorphology: (dominant as Morphology) ?? 'crustose',
  };
}

function parsePollutionProxy(
  raw: unknown,
  siteId: string,
  issues: ValidationIssue[],
): PollutionProxy | null {
  if (!isRecord(raw)) {
    push(issues, {
      severity: 'error',
      code: 'missing_pollution_proxy',
      message: 'pollutionProxy is required',
      siteId,
    });
    return null;
  }
  const basis = raw.basis;
  if (typeof basis !== 'string' || !BASES.has(basis as BandBasis)) {
    push(issues, {
      severity: 'error',
      code: 'invalid_basis',
      message: 'pollutionProxy.basis must be manual or derived_from_lichen',
      siteId,
    });
    return null;
  }
  const band = raw.airQualityBand;
  if (band !== undefined) {
    if (typeof band !== 'string' || !BANDS.has(band as Band)) {
      push(issues, {
        severity: 'error',
        code: 'invalid_band',
        message: 'airQualityBand must be good, moderate, or poor',
        siteId,
      });
      return null;
    }
  }
  return {
    basis: basis as BandBasis,
    airQualityBand: band as Band | undefined,
  };
}

function validateSite(raw: RawSite, issues: ValidationIssue[]): UsableSite | null {
  const siteId = typeof raw.id === 'string' ? raw.id : '(unknown)';

  if (typeof raw.id !== 'string' || !raw.id) {
    push(issues, {
      severity: 'error',
      code: 'invalid_site_id',
      message: 'site.id is required',
    });
    return null;
  }
  if (typeof raw.name !== 'string' || !raw.name) {
    push(issues, {
      severity: 'error',
      code: 'invalid_site_name',
      message: 'site.name is required',
      siteId,
    });
    return null;
  }
  if (!KINDS.has(raw.kind)) {
    push(issues, {
      severity: 'error',
      code: 'invalid_kind',
      message: 'site.kind must be park, avenue, or other',
      siteId,
    });
    return null;
  }
  if (!EXPOSURES.has(raw.trafficExposure)) {
    push(issues, {
      severity: 'error',
      code: 'invalid_traffic_exposure',
      message: 'trafficExposure must be low, medium, or high',
      siteId,
    });
    return null;
  }

  if (!isRecord(raw.location)) {
    push(issues, {
      severity: 'error',
      code: 'invalid_location',
      message: 'location{lat,lng} is required',
      siteId,
    });
    return null;
  }
  const { lat, lng } = raw.location;
  if (!isFiniteNumber(lat) || !isFiniteNumber(lng)) {
    push(issues, {
      severity: 'error',
      code: 'invalid_location',
      message: 'location lat/lng must be finite numbers',
      siteId,
    });
    return null;
  }

  if (
    lat < CHAMA_BBOX.minLat ||
    lat > CHAMA_BBOX.maxLat ||
    lng < CHAMA_BBOX.minLng ||
    lng > CHAMA_BBOX.maxLng
  ) {
    push(issues, {
      severity: 'warning',
      code: 'out_of_bbox',
      message: 'site coordinates are outside the approximate Chama bbox',
      siteId,
    });
  }

  if (raw.sampling === undefined) {
    push(issues, {
      severity: 'error',
      code: 'missing_sampling',
      message: 'sampling is required for map math',
      siteId,
    });
    return null;
  }
  if (raw.pollutionProxy === undefined) {
    push(issues, {
      severity: 'error',
      code: 'missing_pollution_proxy',
      message: 'pollutionProxy is required for map math',
      siteId,
    });
    return null;
  }

  const sampling = parseSampling(raw.sampling, siteId, issues);
  if (!sampling) return null;
  const pollutionProxy = parsePollutionProxy(raw.pollutionProxy, siteId, issues);
  if (!pollutionProxy) return null;

  return {
    id: raw.id,
    name: raw.name,
    kind: raw.kind,
    location: { lat, lng },
    trafficExposure: raw.trafficExposure,
    notes: typeof raw.notes === 'string' ? raw.notes : undefined,
    sampling,
    pollutionProxy,
    observations: Array.isArray(raw.observations) ? raw.observations : undefined,
  };
}

export function validateDataset(raw: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!isRecord(raw)) {
    return {
      usableSites: [],
      issues: [
        {
          severity: 'error',
          code: 'invalid_schema',
          message: 'Dataset root must be a JSON object',
        },
      ],
      study: null,
      schemaVersion: null,
    };
  }

  const schemaVersion =
    typeof raw.schemaVersion === 'string' ? raw.schemaVersion : null;
  if (!schemaVersion) {
    push(issues, {
      severity: 'error',
      code: 'missing_schema_version',
      message: 'schemaVersion is required',
    });
  }

  let study = null;
  if (!isRecord(raw.study)) {
    push(issues, {
      severity: 'error',
      code: 'missing_study',
      message: 'study metadata is required',
    });
  } else {
    const id = typeof raw.study.id === 'string' ? raw.study.id : '';
    const title = typeof raw.study.title === 'string' ? raw.study.title : '';
    const status =
      typeof raw.study.status === 'string' ? raw.study.status : 'provisional';
    if (!id || !title) {
      push(issues, {
        severity: 'error',
        code: 'invalid_study',
        message: 'study.id and study.title are required',
      });
    } else {
      study = {
        id,
        title,
        status,
        area:
          typeof raw.study.area === 'string' ? raw.study.area : undefined,
        institution:
          typeof raw.study.institution === 'string'
            ? raw.study.institution
            : undefined,
        sampledFrom:
          typeof raw.study.sampledFrom === 'string'
            ? raw.study.sampledFrom
            : undefined,
        sampledTo:
          typeof raw.study.sampledTo === 'string'
            ? raw.study.sampledTo
            : undefined,
        notes:
          typeof raw.study.notes === 'string' ? raw.study.notes : undefined,
      };
    }
  }

  if (!Array.isArray(raw.sites)) {
    push(issues, {
      severity: 'error',
      code: 'missing_sites',
      message: 'sites must be an array',
    });
    return { usableSites: [], issues, study, schemaVersion };
  }

  const usableSites: UsableSite[] = [];
  for (const site of raw.sites as RawSite[]) {
    const usable = validateSite(site, issues);
    if (usable) usableSites.push(usable);
  }

  return { usableSites, issues, study, schemaVersion };
}

export type { RawStudyDataset };
