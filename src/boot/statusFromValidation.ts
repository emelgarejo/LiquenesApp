import type { ValidationResult } from '../data/types';
import type { StatusKind } from '../ui/statusView';

export interface BootStatus {
  kind: StatusKind;
  title: string;
  message: string;
}

/**
 * Maps validation outcome to the empty/invalid status UI (no Maps involved).
 * Returns null when the dataset is usable for map boot.
 */
export function statusFromValidation(
  validated: ValidationResult,
): BootStatus | null {
  if (validated.study && validated.usableSites.length > 0) {
    return null;
  }

  const detail =
    validated.issues
      .filter((i) => i.severity === 'error')
      .map((i) => i.message)
      .join(' ') || 'No usable sites after validation.';

  if (validated.study) {
    return {
      kind: 'empty',
      title: 'No usable sites',
      message: detail,
    };
  }

  return {
    kind: 'data',
    title: 'Invalid dataset',
    message: detail,
  };
}
