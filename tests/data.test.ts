import { describe, it, expect } from 'vitest';
import { BUILDINGS } from '../src/data/buildings';
import { ZONES } from '../src/data/zones';

describe('BUILDINGS data integrity', () => {
  it('has at least one building', () => {
    expect(BUILDINGS.length).toBeGreaterThan(0);
  });

  it('every building has required fields', () => {
    for (const building of BUILDINGS) {
      expect(building.gate).toBeTruthy();
      expect(building.name).toBeTruthy();
      expect(building.address).toBeTruthy();
      expect(building.zone).toBeTruthy();
      expect(building.avail).toBeGreaterThan(0);
      expect(building.mgr).toBeTruthy();
      expect(building.phone).toBeTruthy();
      expect(building.notes).toBeTruthy();
    }
  });

  it('every zone is valid', () => {
    for (const building of BUILDINGS) {
      expect(ZONES).toContain(building.zone);
    }
  });

  it('no duplicate gates', () => {
    const gates = BUILDINGS.map(b => b.gate);
    expect(new Set(gates).size).toBe(gates.length);
  });

  it('every building has at least one price', () => {
    for (const building of BUILDINGS) {
      const hasPrice = building.studio !== null || building.br1 !== null || building.br2 !== null;
      expect(hasPrice).toBe(true);
    }
  });

  it('phone numbers match E.164 format', () => {
    const e164Pattern = /^\+1\d{10}$/;
    for (const building of BUILDINGS) {
      expect(building.phone).toMatch(e164Pattern);
    }
  });

  it('coordinates are within SF bounding box', () => {
    for (const building of BUILDINGS) {
      expect(building.lat).toBeGreaterThan(37.70);
      expect(building.lat).toBeLessThan(37.82);
      expect(building.lng).toBeGreaterThan(-122.43);
      expect(building.lng).toBeLessThan(-122.35);
    }
  });

  it('concessionRank is positive only when concession exists', () => {
    for (const building of BUILDINGS) {
      if (building.concession) {
        expect(building.concessionRank).toBeGreaterThan(0);
      } else {
        expect(building.concessionRank).toBe(0);
      }
    }
  });

  it('every zone has at least one building', () => {
    for (const zone of ZONES) {
      const zoneBuildings = BUILDINGS.filter(b => b.zone === zone);
      expect(zoneBuildings.length).toBeGreaterThan(0);
    }
  });
});
