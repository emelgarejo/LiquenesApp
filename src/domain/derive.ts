import type {
  AvgCoverByMorphology,
  Band,
  Sampling,
  UsableSite,
} from '../data/types';
import {
  DEFAULT_THRESHOLDS,
  heatWeight,
  type BandThresholds,
} from '../config/thresholds';
import { resolveBand } from './resolveBand';

export interface SiteMetrics {
  prevalence: number;
  avgCoverTotal: number;
}

export interface SiteView extends SiteMetrics {
  id: string;
  name: string;
  kind: UsableSite['kind'];
  location: UsableSite['location'];
  band: Band;
  bandSource: 'manual' | 'derived';
  heatWeight: number;
  treesExamined: number;
  treesWithLichen: number;
}

export function prevalence(
  treesWithLichen: number,
  treesExamined: number,
): number {
  return treesWithLichen / treesExamined;
}

/**
 * Sum of morphology averages when present. Values are means over lichen-bearing
 * trees only; never divide by treesExamined. Optional in ficha-backed datasets.
 */
export function avgCoverTotal(cover: AvgCoverByMorphology): number {
  return cover.crustose + cover.foliose + cover.fruticose;
}

/**
 * Semáforo from incidence only (ficha técnica legend).
 * Order: Alto (≥70%) → Medio (≥40%) → Bajo (<40%).
 */
export function deriveBand(
  sampling: Sampling,
  thresholds: BandThresholds = DEFAULT_THRESHOLDS,
): Band {
  const prev = prevalence(sampling.treesWithLichen, sampling.treesExamined);

  if (prev >= thresholds.goodPrevalenceAtLeast) {
    return 'good';
  }
  if (prev >= thresholds.moderatePrevalenceAtLeast) {
    return 'moderate';
  }
  return 'poor';
}

export function toSiteViews(
  sites: UsableSite[],
  thresholds: BandThresholds = DEFAULT_THRESHOLDS,
): { views: SiteView[]; warnings: string[] } {
  const warnings: string[] = [];
  const views = sites.map((site) => {
    const resolved = resolveBand(site, thresholds);
    if (resolved.warning) {
      warnings.push(resolved.warning);
    }
    const prev = prevalence(
      site.sampling.treesWithLichen,
      site.sampling.treesExamined,
    );
    const cover = avgCoverTotal(site.sampling.avgCoverByMorphology);
    return {
      id: site.id,
      name: site.name,
      kind: site.kind,
      location: site.location,
      prevalence: prev,
      avgCoverTotal: cover,
      band: resolved.band,
      bandSource: resolved.bandSource,
      heatWeight: heatWeight(prev),
      treesExamined: site.sampling.treesExamined,
      treesWithLichen: site.sampling.treesWithLichen,
    };
  });
  return { views, warnings };
}
