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
  distance?: number | null;
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

export type TabName = 'map' | 'list' | 'routes' | 'about';

export interface FilterState {
  showCaves: boolean;
  showRestaurants: boolean;
  showCommerces: boolean;
}