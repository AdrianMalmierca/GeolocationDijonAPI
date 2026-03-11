/**
 * dijonApi.ts
 * Servicio para consumir la API pública de Dijon Métropole
 * Docs: https://data.metropole-dijon.fr/api/v2/
 * 
 * OpenDataSoft API v2 — sin autenticación requerida para datos públicos
 */

import axios from 'axios';
import { API, MOCK_CAVES, COMMERCE_CATEGORIES } from '../constants';
import { Cave, ODSResponse } from '../types';

const apiClient = axios.create({
  baseURL: API.BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
});

// ─────────────────────────────────────────────
//  Extraer coordenadas del campo geo_point_2d
//  La API puede devolver [lat, lon] o {lat, lon}
// ─────────────────────────────────────────────
function extractCoords(geo: any): { latitude: number; longitude: number } | null {
  if (!geo) return null;
  if (Array.isArray(geo)) {
    return { latitude: geo[0], longitude: geo[1] };
  }
  if (geo.lat !== undefined && geo.lon !== undefined) {
    return { latitude: geo.lat, longitude: geo.lon };
  }
  return null;
}

// ─────────────────────────────────────────────
//  Detectar si un comercio es una cave/vinos
// ─────────────────────────────────────────────
function isCave(fields: any): boolean {
  const text = [
    fields.libelle, fields.activite, fields.type_activite,
    fields.categorie, fields.sous_categorie, fields.nom
  ].filter(Boolean).join(' ').toLowerCase();

  return COMMERCE_CATEGORIES.CAVE.some(keyword => text.includes(keyword));
}

// ─────────────────────────────────────────────
//  Normalizar un record de la API a Cave
// ─────────────────────────────────────────────
function normalizeRecord(record: any, category: Cave['category']): Cave | null {
  const fields = record.fields || record;
  const coords = extractCoords(fields.geo_point_2d);
  if (!coords) return null;

  const name = fields.libelle || fields.nom || fields.designation || 'Lieu sans nom';

  return {
    id: record.id || `${coords.latitude}-${coords.longitude}`,
    name,
    address: [fields.adresse, fields.code_postal, fields.commune]
      .filter(Boolean).join(', ') || fields.adresse_complete || '',
    latitude: coords.latitude,
    longitude: coords.longitude,
    category,
    description: fields.description || fields.activite || fields.type_activite || undefined,
    phone: fields.telephone || fields.tel || undefined,
    website: fields.site_internet || fields.url || undefined,
    openingHours: fields.horaires || undefined,
    source: 'api',
  };
}

// ─────────────────────────────────────────────
//  FETCH COMMERCES — Dataset principal de Dijon
//  Filtra por actividad "cave" o "vin"
// ─────────────────────────────────────────────
export async function fetchCavesFromDijon(): Promise<Cave[]> {
  try {
    // Intentamos buscar primero con where clause en activité
    const params = {
      limit: API.MAX_RECORDS,
      offset: 0,
      // Filtrar por actividades relacionadas con vino
      where: `activite like "%vin%" or activite like "%cave%" or activite like "%caviste%" or libelle like "%vin%" or libelle like "%cave%"`,
      select: 'libelle,adresse,activite,type_activite,geo_point_2d,telephone,site_internet,horaires,code_postal,commune',
    };

    const response = await apiClient.get<ODSResponse>(
      `/catalog/datasets/${API.DATASETS.COMMERCES}/records`,
      { params }
    );

    const caves: Cave[] = [];
    for (const result of response.data.results || []) {
      const cave = normalizeRecord(result, 'cave');
      if (cave) caves.push(cave);
    }

    console.log(`[DijonAPI] Fetched ${caves.length} caves from commerces dataset`);
    return caves;
  } catch (error) {
    console.warn('[DijonAPI] Error fetching caves, usando mock data:', error);
    return [];
  }
}

// ─────────────────────────────────────────────
//  FETCH TOUS LES COMMERCES (para mostrar en mapa)
// ─────────────────────────────────────────────
export async function fetchCommercesProches(
  lat: number,
  lng: number,
  radiusKm: number = 5
): Promise<Cave[]> {
  try {
    const params = {
      limit: API.MAX_RECORDS,
      // Filtro geoespacial de OpenDataSoft
      where: `distance(geo_point_2d, geom'POINT(${lng} ${lat})', ${radiusKm}km)`,
      select: 'libelle,adresse,activite,type_activite,geo_point_2d,telephone,site_internet',
      orderby: `distance(geo_point_2d, geom'POINT(${lng} ${lat})')`,
    };

    const response = await apiClient.get<ODSResponse>(
      `/catalog/datasets/${API.DATASETS.COMMERCES}/records`,
      { params }
    );

    const commerces: Cave[] = [];
    for (const result of response.data.results || []) {
      const fields = result.fields || result;
      const category: Cave['category'] = isCave(fields) ? 'cave' : 'commerce';
      const commerce = normalizeRecord(result, category);
      if (commerce) commerces.push(commerce);
    }

    return commerces;
  } catch (error) {
    console.warn('[DijonAPI] Error fetching commerces:', error);
    return [];
  }
}

// ─────────────────────────────────────────────
//  FETCH ÉQUIPEMENTS PUBLICS
// ─────────────────────────────────────────────
export async function fetchEquipementsPublics(): Promise<Cave[]> {
  try {
    const params = {
      limit: 50,
      select: 'libelle,adresse,type_equipement,geo_point_2d,telephone',
      where: `type_equipement like "%tourisme%" or type_equipement like "%culture%"`,
    };

    const response = await apiClient.get<ODSResponse>(
      `/catalog/datasets/${API.DATASETS.EQUIPEMENTS_PUBLICS}/records`,
      { params }
    );

    const equip: Cave[] = [];
    for (const result of response.data.results || []) {
      const e = normalizeRecord(result, 'equipement');
      if (e) equip.push(e);
    }

    return equip;
  } catch (error) {
    console.warn('[DijonAPI] Error fetching equipements:', error);
    return [];
  }
}

// ─────────────────────────────────────────────
//  FETCH COMPLETO — combina API + mock fallback
// ─────────────────────────────────────────────
export async function fetchAllPlaces(
  userLat?: number,
  userLng?: number
): Promise<Cave[]> {
  const center = {
    lat: userLat ?? API.CENTER.latitude,
    lng: userLng ?? API.CENTER.longitude,
  };

  // Llamadas en paralelo
  const [cavesDijon, commercesProches] = await Promise.allSettled([
    fetchCavesFromDijon(),
    fetchCommercesProches(center.lat, center.lng, 10),
  ]);

  const apiResults: Cave[] = [];

  if (cavesDijon.status === 'fulfilled') {
    apiResults.push(...cavesDijon.value);
  }
  if (commercesProches.status === 'fulfilled') {
    // Evitar duplicados por ID
    const existingIds = new Set(apiResults.map(c => c.id));
    for (const c of commercesProches.value) {
      if (!existingIds.has(c.id)) {
        apiResults.push(c);
        existingIds.add(c.id);
      }
    }
  }

  // Si API no devolvió nada útil, usar mock como fallback
  if (apiResults.length === 0) {
    console.log('[DijonAPI] Sin resultados API, usando MOCK_CAVES');
    return MOCK_CAVES.map(cave => ({
      ...cave,
      distance: userLat && userLng
        ? calculateDistance(userLat, userLng, cave.latitude, cave.longitude)
        : null,
      source: 'mock' as const,
    }));
  }

  // Calcular distancia si tenemos ubicación del usuario
  if (userLat && userLng) {
    return apiResults.map(cave => ({
      ...cave,
      distance: calculateDistance(userLat, userLng, cave.latitude, cave.longitude),
    })).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }

  return apiResults;
}

// ─────────────────────────────────────────────
//  UTILS — Haversine distance en metros
// ─────────────────────────────────────────────
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
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
