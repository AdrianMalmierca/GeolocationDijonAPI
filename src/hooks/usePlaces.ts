import { useState, useEffect, useCallback } from 'react';
import { calculateDistance} from '../services/dijonApi';
import { Cave, FilterState } from '../types';
import { subscribe, getCacheState, loadPlaces } from '../services/placesCache';

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
};

export function usePlaces(userLat?: number, userLng?: number): UsePlacesReturn {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [cacheState, setCacheState] = useState(getCacheState());

  useEffect(() => {
    const unsub = subscribe(() => setCacheState(getCacheState())); //connect to the global cache state,
    // so we can get the data and the loading state from the cache, and we also subscribe to changes in the cache, so 
    // when the cache is updated, we update our local state and re-render (setCacheState) the component with the new data
    loadPlaces(); //shoot the fetch on mount to load the data in the cache
    return () => { unsub(); }; //function to unsubscribe from the cache updates when the component is unmounted, 
    // to avoid memory leaks and unnecessary updates when the component is not visible anymore
  }, []);

  const refresh = useCallback(async () => { //recharge although we have a cache, we want to give the user the possibility 
  // to refresh the data manually, so we can add a refresh button in the UI that calls this function, 
    await loadPlaces(true);
  }, []); //only created on mount, because we don't want to create a new function on every render

  const places = cacheState.data.map(cave => ({
    ...cave,
    distance: (userLat && userLng)
      ? calculateDistance(userLat, userLng, cave.latitude, cave.longitude)
      : null,
  })) as Cave[];//only charge on mount
  //only on mount to dont load the places again every time the user's location changes, because we want to give the user 
  // the control to refresh the data when they want, and we can also add a button to refresh the data manually, 
  // so we don't want to refresh the data automatically every time the user's location changes, because it could 
  // be annoying for the user if they are moving and the data is refreshing all the time, so we let them decide 
  // when they want to refresh the data by themselves.

  //Filter places based on the selected categories in the filters, we can also add a filter for the radius in the future, 
  // but for now we just filter by category, and we show all places that match the selected categories, regardless of 
  // the distance, because we want to show all places to the user and let them decide which ones they want to visit based 
  // on the distance and the other information, but we could add a filter for the radius in the future if we want 
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
    loading: cacheState.loading,
    error: cacheState.error,
    refresh,
    filters,
    setFilters,
  };
}