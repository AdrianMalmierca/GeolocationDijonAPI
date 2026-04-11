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
      //Always fetch centered on Dijon, not on user location
      //so we show the same places to all users, and we calculate the distance from the user to each place to sort 
      // them by distance, but we don't want to fetch different places based on the user's location because it could 
      // be outside of Dijon and then we would have no places to show, or if we fetch based on the user's location, 
      // we could have different places for different users and it would be more complicated to manage the data and 
      // the caching, so we always fetch the same data centered on Dijon and then we calculate the distance from the user 
      // to each place to sort them by distance.
      const data = await fetchAllPlaces(
        API.CENTER.latitude,
        API.CENTER.longitude,
      );

      //If we have the user's location, we calculate the distance from the user to each place,
      // otherwise we leave the distance as null
      const withDistance = data.map(cave => ({
        ...cave, //each cave inside data
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

   //when the hook is used for the first time, we load the places with the user's location if we have it, 
   // otherwise it will load with the default location (Dijon center) and then when we get the user's location 
   // we can call refresh to load the places again with the user's location to calculate the distance and sort them 
   // by distance.
  useEffect(() => {
    loadPlaces(userLat, userLng);
  }, []); // solo cargar una vez al montar

  //Filter places based on the selected categories in the filters, we can also add a filter for the radius in the future, 
  // but for now we just filter by category, and we show all places that match the selected categories, regardless of 
  // the distance, because we want to show all places to the user and let them decide which ones they want to visit b
  // ased on the distance and the other information, but we could add a filter for the radius in the future if we want 
  // to limit the number of places shown to the user based on their location and their preferences.
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
  const R = 6371000; //earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180; //convert degrees to radians cause math.sin works in radians
  const φ2 = (lat2 * Math.PI) / 180; 
  const Δφ = ((lat2 - lat1) * Math.PI) / 180; //difference in latitude in radians
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) /*difference in latitude*/ +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2); //difference in longitude
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); //atan calculates the angle between the two points,
  // we multiply by 2 to get the distance in meters, and we multiply by R to convert it to meters,
  // because the result of atan is in radians and we want the distance in meters.
}