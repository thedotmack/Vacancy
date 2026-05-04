export type ZoneId = 'embarcadero' | 'rincon' | 'southbeach' | 'missionbay' | 'soma' | 'mission' | 'castro' | 'hayesvalley' | 'pacificheights' | 'marina' | 'dogpatch' | 'potrerohill' | 'nobhill' | 'northbeach' | 'richmond' | 'sunset' | 'bernalheights' | 'glenpark' | 'noevalley' | 'twinpeaks' | 'financialdistrict' | 'tenderloin' | 'westernaddition';
export type SortMode = 'gate' | 'price' | 'inventory' | 'concession';
export type StatusLevel = 'boarding' | 'limited' | 'departing';

export type AmenityKey =
  | 'rooftop' | 'gym' | 'coworking' | 'pet' | 'bike' | 'pool'
  | 'parking' | 'doorman' | 'laundry' | 'concierge' | 'spa'
  | 'sauna' | 'theater' | 'dogwash' | 'lounge' | 'deck';

export interface TransitStop {
  name: string;
  mode: 'walk' | 'muni' | 'bart' | 'caltrain' | 'tthird';
  mins: number;
}

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
  sourceUrl: string;
  tourUrl?: string;
  amenities?: AmenityKey[];
  floorPlans?: number;
  leasedPct?: number;
  nextAvailable?: string[];
  transit?: TransitStop[];
  perks?: string[];
  tagline?: string;
  photoUrl?: string;
}

export interface BuildingComment {
  text: string;
  created_at: string;
}

export interface BuildingFeedback {
  comments: BuildingComment[];
  votes: { yes: number; no: number };
  userVoted: boolean;
}
