import axios from 'axios';
import { MOCK_CAVES } from '../constants';
import { Cave } from '../types';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const DIJON_BBOX = '47.00,4.82,47.45,5.15';

// Query Overpass para un tipo de lugar
async function overpassQuery(query: string): Promise<any[]> {
  try {
    const response = await axios.get(OVERPASS_URL, {
      params: { data: query },
      timeout: 12000,
    });
    return response.data?.elements || [];
  } catch (err) {
    console.warn('[Overpass] Error:', err);
    return [];
  }
}

// Normalizar un elemento OSM a Cave
function normalizeElement(el: any, category: Cave['category']): Cave | null {
  if (!el.lat || !el.lon) return null;
  const tags = el.tags || {};

  const name = tags.name || tags['name:fr'] || 'Sans nom';
  const address = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:postcode'],
    tags['addr:city'],
  ].filter(Boolean).join(' ') || tags['contact:street'] || '';

  return {
    id: `osm-${el.id}`,
    name,
    address,
    latitude: el.lat,
    longitude: el.lon,
    category,
    description: tags.description || tags.cuisine || tags['shop'] || undefined,
    phone: tags.phone || tags['contact:phone'] || undefined,
    website: tags.website || tags['contact:website'] || undefined,
    openingHours: tags.opening_hours || undefined,
    distance: null,
    source: 'api',
  };
}

// Caves à vins (shop=wine + amenity=bar avec wine)
async function fetchCaves(): Promise<Cave[]> {
  const query = `[out:json][timeout:15];
(
  node[shop=wine](${DIJON_BBOX});
  node[shop=alcohol](${DIJON_BBOX});
  node[craft=winery](${DIJON_BBOX});
  node[tourism=wine_cellar](${DIJON_BBOX});
);
out;`;

  const elements = await overpassQuery(query);
  return elements
    .map(el => normalizeElement(el, 'cave'))
    .filter(Boolean) as Cave[];
}

// Restaurants
async function fetchRestaurants(): Promise<Cave[]> {
  const query = `[out:json][timeout:15];
(
  node[amenity=restaurant](${DIJON_BBOX});
  node[amenity=wine_bar](${DIJON_BBOX});
  node[amenity=bar][name~"vin|cave|bourgogne",i](${DIJON_BBOX});
);
out;`;

  const elements = await overpassQuery(query);
  return elements
    .map(el => normalizeElement(el, 'restaurant'))
    .filter(Boolean) as Cave[];
}

// Commerces gastronomiques
async function fetchCommerces(): Promise<Cave[]> {
  const query = `[out:json][timeout:15];
(
  node[shop=cheese](${DIJON_BBOX});
  node[shop=deli](${DIJON_BBOX});
  node[shop=butcher](${DIJON_BBOX});
  node[shop=bakery][name~"dijon|bourgogne",i](${DIJON_BBOX});
  node[tourism=attraction][name~"vin|cave|moutarde",i](${DIJON_BBOX});
);
out;`;

  const elements = await overpassQuery(query);
  return elements
    .map(el => normalizeElement(el, 'commerce'))
    .filter(Boolean) as Cave[];
}

// Función principal
export async function fetchAllPlaces(
  _userLat?: number,
  _userLng?: number,
): Promise<Cave[]> {
  console.log('[Overpass] Fetching data from OpenStreetMap...');

  const [cavesResult, restoResult, commercesResult] = await Promise.allSettled([
    fetchCaves(),
    fetchRestaurants(),
    fetchCommerces(),
  ]);

  const caves = cavesResult.status === 'fulfilled' ? cavesResult.value : [];
  const restos = restoResult.status === 'fulfilled' ? restoResult.value : [];
  const commerces = commercesResult.status === 'fulfilled' ? commercesResult.value : [];

  console.log(`[Overpass] caves=${caves.length} restos=${restos.length} commerces=${commerces.length}`);

  const all = [...caves, ...restos, ...commerces];

  if (all.length === 0) {
    console.log('[Overpass] Sin resultados, usando MOCK');
    return MOCK_CAVES as Cave[];
  }

  return all;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters: number | null): string {
  if (meters === null) return '';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}