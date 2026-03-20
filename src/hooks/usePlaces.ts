import { useState, useEffect, useCallback } from 'react';
import { fetchAllPlaces } from '../services/dijonApi';
import { Cave, FilterState } from '../types';
import { MOCK_CAVES, API } from '../constants';

interface UsePlacesReturn {
  places: Cave[];
  filteredPlaces: Cave[];
  loading: boolean;
  error: string | null;
  refresh: (lat?: number, lng?: number) => Promise<void>;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const DEFAULT_FILTERS: FilterState = {
  showCaves: true,
  showRestaurants: true,
  showCommerces: true,
  radius: 50,
};

export function usePlaces(userLat?: number, userLng?: number): UsePlacesReturn {
  const [places, setPlaces] = useState<Cave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const loadPlaces = useCallback(async (lat?: number, lng?: number) => {
    setLoading(true);
    setError(null);
    try {
      // SIEMPRE buscar centrado en Dijon, no en la posición del usuario
      // Así la app siempre muestra contenido útil
      const data = await fetchAllPlaces(
        API.CENTER.latitude,
        API.CENTER.longitude,
      );

      // Si tenemos ubicación del usuario, calcular distancia real
      // Si no, dejar distancia null (no mostrar)
      const withDistance = data.map(cave => ({
        ...cave,
        distance: (lat && lng)
          ? calculateDistance(lat, lng, cave.latitude, cave.longitude)
          : null,
      }));

      setPlaces(withDistance.length > 0 ? withDistance as Cave[] : MOCK_CAVES as Cave[]);
    } catch (err) {
      setError('Erreur de chargement.');
      setPlaces(MOCK_CAVES as Cave[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaces(userLat, userLng);
  }, [userLat, userLng, loadPlaces]);

  // Filtros — sin filtro de radio (siempre mostramos Dijon entero)
  const filteredPlaces = places.filter(place => {
    if (place.category === 'cave' && !filters.showCaves) return false;
    if (place.category === 'restaurant' && !filters.showRestaurants) return false;
    if (place.category === 'commerce' && !filters.showCommerces) return false;
    return true;
  });

  return {
    places,
    filteredPlaces,
    loading,
    error,
    refresh: loadPlaces,
    filters,
    setFilters,
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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