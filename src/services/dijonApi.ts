import axios from 'axios';
import { MOCK_CAVES } from '../constants';
import { Cave } from '../types';

const DIJON_BBOX = '47.00,4.82,47.45,5.15';

//Query a Overpass API with a given query string and return the elements
const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function overpassQuery(query: string): Promise<any[]> {
  for (const server of OVERPASS_SERVERS) {
    try {
      const response = await axios.get(server, {
        params: { data: query },
        timeout: 20000,
      });
      const elements = response.data?.elements || [];
      if (elements.length > 0) return elements;
    } catch (err) {
      console.warn(`[Overpass] Fail in ${server}`);
    }
  }
  return [];
}

//Normalize an element from Overpass API to our Cave type
function normalizeElement(el: any, category: Cave['category']): Cave | null {
  if (!el.lat || !el.lon) return null;
  const tags = el.tags || {}; //OSM tags, where we find the name, address, description, etc. of the place

  const name = tags.name || tags['name:fr'] || 'Sans nom';
  const address = [ //filter null or undefined values and join the address parts
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:postcode'],
    tags['addr:city'],
  ].filter(Boolean).join(' ') || tags['contact:street'] || '';

  return { //build a Cave object from the OSM element, we use the id of the element prefixed with "osm-" t
  // o avoid conflicts with our mock data, and we use the category passed as a parameter to set the category of the cave
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

  const elements = await overpassQuery(query); //execute the query and get the elements, which are the raw data from OSM
  return elements
    .map(el => normalizeElement(el, 'cave')) //transform each element into a Cave object, with the category "cave"
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
out;`; // overpass language, to have the date in json
//search the nodes with some tags and inside the bounding box of Dijon

  const elements = await overpassQuery(query);
  return elements
    .map(el => normalizeElement(el, 'restaurant'))
    .filter(Boolean) as Cave[]; //to say to typescript that we return an array of Cave, because we filter the nulls with filter(Boolean)
}

//Commerces gastronomiques
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

//Main function
export async function fetchAllPlaces(): Promise<Cave[]> {
  //console.log('[Overpass] Fetching data from OpenStreetMap...');

  const [cavesResult, restoResult, commercesResult] = await Promise.allSettled([
    fetchCaves(),
    fetchRestaurants(),
    fetchCommerces(),
  ]); //excecute all the promises at the same time and wait for all of them to finish, even if some of them fail, 
  // so we can get the data that we can and ignore the ones that fail, and we use Promise.allSettled instead 
  // of Promise.all because if one of the promises fail, Promise.all will reject and we will not get any data, 
  // but with Promise.allSettled we will get the results of all the promises, even if some of them fail

  const caves = cavesResult.status === 'fulfilled' ? cavesResult.value : [];
  const restos = restoResult.status === 'fulfilled' ? restoResult.value : [];
  const commerces = commercesResult.status === 'fulfilled' ? commercesResult.value : [];

  console.log(`[Overpass] caves=${caves.length} restos=${restos.length} commerces=${commerces.length}`);

  if (caves.length > 0) console.log('[Overpass] Sample cave:', JSON.stringify(caves[0], null, 2));

  const all = [...caves, ...restos, ...commerces]; //combine all the results in a single array

  if (all.length === 0) {
    console.log('[Overpass] Without results, using MOCK');
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