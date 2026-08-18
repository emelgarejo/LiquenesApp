import type { Band, UsableSite, ValidationIssue } from '../data/types';
import {
  DEFAULT_THRESHOLDS,
  type BandThresholds,
} from '../config/thresholds';
import { deriveBand } from './derive';

export interface ResolveBandResult {
  band: Band;
  bandSource: 'manual' | 'derived';
  warning?: string;
  issue?: ValidationIssue;
}

export function resolveBand(
  site: UsableSite,
  thresholds: BandThresholds = DEFAULT_THRESHOLDS,
): ResolveBandResult {
  const { pollutionProxy, sampling, id } = site;

  if (pollutionProxy.basis === 'manual') {
    if (pollutionProxy.airQualityBand) {
      return {
        band: pollutionProxy.airQualityBand,
        bandSource: 'manual',
      };
    }
    const derived = deriveBand(sampling, thresholds);
    const warning = `Site "${id}" has basis=manual without airQualityBand; using derived band "${derived}".`;
    return {
      band: derived,
      bandSource: 'derived',
      warning,
      issue: {
        severity: 'warning',
        code: 'manual_band_missing',
        message: warning,
        siteId: id,
      },
    };
  }

  // basis === 'derived_from_lichen' — ignore any stored band
  return {
    band: deriveBand(sampling, thresholds),
    bandSource: 'derived',
  };
}
