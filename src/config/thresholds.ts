import type { Morphology } from '../data/types';

export type { Morphology };

/**
 * Ficha técnica semáforo (incidencia = treesWithLichen / treesExamined):
 * Alto (good) ≥ 70% | Medio (moderate) 40%–69.9% | Bajo (poor) < 40%
 */
export interface BandThresholds {
  /** Inclusive lower bound for Alto / good. */
  goodPrevalenceAtLeast: number;
  /** Inclusive lower bound for Medio / moderate (below good). */
  moderatePrevalenceAtLeast: number;
}

export const DEFAULT_THRESHOLDS: BandThresholds = {
  goodPrevalenceAtLeast: 0.7,
  moderatePrevalenceAtLeast: 0.4,
};

/** Heat intensity from incidence (cover was not measured in the ficha). */
export function heatWeight(prevalence: number): number {
  return prevalence;
}
