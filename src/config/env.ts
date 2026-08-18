export interface AppEnv {
  googleMapsApiKey: string;
}

export class MissingMapsKeyError extends Error {
  readonly code = 'missing_maps_key' as const;

  constructor() {
    super(
      'VITE_GOOGLE_MAPS_API_KEY is missing. Set it in .env (see .env.example).',
    );
    this.name = 'MissingMapsKeyError';
  }
}

export function readEnv(
  env: ImportMetaEnv = import.meta.env,
): AppEnv {
  const key = env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    throw new MissingMapsKeyError();
  }
  return { googleMapsApiKey: key };
}
