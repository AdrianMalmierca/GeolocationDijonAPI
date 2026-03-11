/**
 * usePlaces.ts
 * Hook para cargar y gestionar los lugares (caves, commerces)
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchAllPlaces } from '../services/dijonApi';
import { Cave, FilterState } from '../types';
import { MOCK_CAVES } from '../constants';

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
  showCommerces: false,
  radius: 10,
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
      const data = await fetchAllPlaces(lat, lng);
      setPlaces(data.length > 0 ? data : MOCK_CAVES);
    } catch (err) {
      console.error('[usePlaces] Error:', err);
      setError('Erreur lors du chargement des données.');
      setPlaces(MOCK_CAVES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaces(userLat, userLng);
  }, [userLat, userLng, loadPlaces]);

  // Aplicar filtros
  const filteredPlaces = places.filter(place => {
    if (place.category === 'cave' && !filters.showCaves) return false;
    if (place.category === 'restaurant' && !filters.showRestaurants) return false;
    if (place.category === 'commerce' && !filters.showCommerces) return false;
    if (place.distance !== null && place.distance !== undefined) {
      if (place.distance > filters.radius * 1000) return false;
    }
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
