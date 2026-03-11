// ─────────────────────────────────────────────
//  TYPES — Dijon Vin & Terroir
// ─────────────────────────────────────────────

export interface Cave {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: 'cave' | 'commerce' | 'equipement' | 'restaurant';
  description?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  appellations?: string[];
  distance?: number | null; // en metros
  source?: 'api' | 'mock';
}

export interface RouteVin {
  id: string;
  name: string;
  description: string;
  duration: string;
  distance: string;
  difficulty: 'Facile' | 'Modéré' | 'Difficile';
  waypoints: Waypoint[];
  color: string;
}

export interface Waypoint {
  name: string;
  lat: number;
  lng: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Respuesta de la API OpenDataSoft (Dijon Métropole)
export interface ODSRecord {
  record: {
    id: string;
    fields: {
      [key: string]: any;
      libelle?: string;
      nom?: string;
      adresse?: string;
      activite?: string;
      type_activite?: string;
      geo_point_2d?: [number, number] | { lat: number; lon: number };
      telephone?: string;
      site_internet?: string;
      horaires?: string;
      description?: string;
    };
    geometry?: {
      type: string;
      coordinates: [number, number];
    };
  };
}

export interface ODSResponse {
  total_count: number;
  results: ODSRecord[];
}

export type TabName = 'map' | 'list' | 'routes' | 'about';

export interface FilterState {
  showCaves: boolean;
  showRestaurants: boolean;
  showCommerces: boolean;
  radius: number; // km
}
