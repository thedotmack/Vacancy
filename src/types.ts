export type ZoneId = 'embarcadero' | 'rincon' | 'southbeach' | 'missionbay';
export type SortMode = 'gate' | 'price' | 'inventory' | 'concession';
export type StatusLevel = 'boarding' | 'limited' | 'departing';

export interface Building {
  gate: string;
  zone: ZoneId;
  name: string;
  address: string;
  avail: number;
  studio: number | null;
  br1: number | null;
  br2: number | null;
  concession: string | null;
  concessionRank: number;
  mgr: string;
  phone: string;
  lat: number;
  lng: number;
  notes: string;
}
