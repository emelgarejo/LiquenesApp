import { describe, expect, it } from 'vitest';
import { sitePhotoUrl } from './derive';

describe('sitePhotoUrl', () => {
  it('defaults to ./photos/{id}.jpg', () => {
    expect(sitePhotoUrl('av-aviacion')).toBe('./photos/av-aviacion.jpg');
  });

  it('keeps an explicit override', () => {
    expect(sitePhotoUrl('av-aviacion', './photos/custom.jpg')).toBe(
      './photos/custom.jpg',
    );
  });
});
