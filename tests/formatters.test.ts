import { describe, it, expect } from 'vitest';
import { formatPrice, lowestPrice, minimumBedLabel, statusForAvailability, statusDisplayLabel, formatTimestamp } from '../src/utils/formatters';
import type { Building } from '../src/types';

function buildingWithPrices(overrides: Partial<Building> = {}): Building {
  return {
    gate: 'T1', zone: 'embarcadero', name: 'TEST', address: '1 Test St',
    avail: 10, studio: null, br1: null, br2: null, concession: null,
    concessionRank: 0, mgr: 'TEST', phone: '+10000000000',
    lat: 37.78, lng: -122.39, notes: 'test',
    ...overrides,
  };
}

describe('formatPrice', () => {
  it('formats numbers with dollar sign and commas', () => {
    expect(formatPrice(3443)).toBe('$3,443');
    expect(formatPrice(10000)).toBe('$10,000');
  });

  it('returns dash for null', () => {
    expect(formatPrice(null)).toBe('—');
  });
});

describe('lowestPrice', () => {
  it('returns studio if available', () => {
    expect(lowestPrice(buildingWithPrices({ studio: 3000, br1: 4000 }))).toBe(3000);
  });

  it('falls back to br1 if no studio', () => {
    expect(lowestPrice(buildingWithPrices({ br1: 4000, br2: 6000 }))).toBe(4000);
  });

  it('falls back to br2 if no studio or br1', () => {
    expect(lowestPrice(buildingWithPrices({ br2: 6000 }))).toBe(6000);
  });

  it('returns 0 if no prices', () => {
    expect(lowestPrice(buildingWithPrices())).toBe(0);
  });
});

describe('minimumBedLabel', () => {
  it('returns STUDIO+ when studio price exists', () => {
    expect(minimumBedLabel(buildingWithPrices({ studio: 3000 }))).toBe('STUDIO+');
  });

  it('returns 1BR+ when no studio', () => {
    expect(minimumBedLabel(buildingWithPrices({ br1: 4000 }))).toBe('1BR+');
  });
});

describe('statusForAvailability', () => {
  it('returns departing for 6 or fewer', () => {
    expect(statusForAvailability(buildingWithPrices({ avail: 5 }))).toBe('departing');
    expect(statusForAvailability(buildingWithPrices({ avail: 6 }))).toBe('departing');
  });

  it('returns limited for 7-9', () => {
    expect(statusForAvailability(buildingWithPrices({ avail: 7 }))).toBe('limited');
    expect(statusForAvailability(buildingWithPrices({ avail: 9 }))).toBe('limited');
  });

  it('returns boarding for 10+', () => {
    expect(statusForAvailability(buildingWithPrices({ avail: 10 }))).toBe('boarding');
    expect(statusForAvailability(buildingWithPrices({ avail: 25 }))).toBe('boarding');
  });
});

describe('statusDisplayLabel', () => {
  it('maps status levels to display strings', () => {
    expect(statusDisplayLabel('boarding')).toBe('BOARDING');
    expect(statusDisplayLabel('limited')).toBe('LIMITED');
    expect(statusDisplayLabel('departing')).toBe('FILLING');
  });
});

describe('formatTimestamp', () => {
  it('formats ISO string to departure board format', () => {
    const result = formatTimestamp('2026-04-30T14:30:00.000Z');
    expect(result).toMatch(/^[A-Z]{3}\d{2} \d{2}:\d{2}$/);
  });
});
