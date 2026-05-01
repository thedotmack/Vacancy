import type { Building, StatusLevel } from '../types';

export function formatPrice(price: number | null): string {
  return price ? '$' + price.toLocaleString() : '—';
}

export function lowestPrice(building: Building): number {
  return building.studio || building.br1 || building.br2 || 0;
}

export function minimumBedLabel(building: Building): string {
  return building.studio ? 'STUDIO+' : '1BR+';
}

export function statusForAvailability(building: Building): StatusLevel {
  if (building.avail <= 6) return 'departing';
  if (building.avail <= 9) return 'limited';
  return 'boarding';
}

export function statusDisplayLabel(status: StatusLevel): string {
  const labels: Record<StatusLevel, string> = {
    boarding: 'BOARDING',
    limited: 'LIMITED',
    departing: 'FILLING',
  };
  return labels[status];
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${months[date.getMonth()]}${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function buildGoogleMapsUrl(building: Building): string {
  const query = encodeURIComponent(`${building.name} ${building.address} San Francisco`);
  return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=&center=${building.lat},${building.lng}`;
}
