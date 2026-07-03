import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cave } from '../types';
import { fetchAllPlaces } from './dijonApi';
import { MOCK_CAVES } from '../constants';

const STORAGE_KEY = 'dijonvin_places_cache';
const CACHE_TTL = 5 * 60 * 1000; //5 minutes in memory

interface CacheState {
  data: Cave[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  listeners: Set<() => void>;
  isOffline: boolean;
}

const state: CacheState = { //global state in memory to store the places data
  data: [],
  loading: false,
  error: null,
  lastFetch: null,
  listeners: new Set(),
  isOffline: false,
};

function notify() {
  state.listeners.forEach(fn => fn()); //advice to all the subscribers that the state has changed
}

export function subscribe(fn: () => void) { //to suscribe in changes in the cache,
// we add the function to the listeners set, and we return a function to unsubscribe by removing the function from 
// the listeners set, so we can avoid memory leaks and unnecessary updates when the component that uses this hook 
// is unmounted
  state.listeners.add(fn);
  return () => state.listeners.delete(fn);
}

export function getCacheState() { //encapsulate the state and only return the data
  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    isOffline: state.isOffline,
  };
}

//Persist fresh API data to AsyncStorage for offline use
async function persistToStorage(data: Cave[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ data, savedAt: Date.now() }));
    console.log('[Cache] Persisted', data.length, 'places to AsyncStorage');
  } catch (err) {
    console.warn('[Cache] Failed to persist:', err);
  }
}

//Load previously saved data when API is unavailable
async function loadFromStorage(): Promise<Cave[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { data, savedAt } = JSON.parse(raw);
    const ageHours = (Date.now() - savedAt) / (1000 * 60 * 60); //calculate the age of the cached data in hours, 
    // to display it in the logs for debugging purposes, so we can know how old is the offline data and decide if we want 
    // to use it or not based on its age
    console.log(`[Cache] Offline data: ${data.length} places, saved ${ageHours.toFixed(1)}h ago`);
    return data as Cave[];
  } catch (err) {
    console.warn('[Cache] Failed to load from storage:', err);
    return null;
  }
}

export async function loadPlaces(forceRefresh = false): Promise<void> {
  //if theres fresh data in the cache and we're not forcing a refresh, return early without doing anything
  if (
    !forceRefresh &&
    state.data.length > 0 &&
    state.lastFetch &&
    Date.now() - state.lastFetch < CACHE_TTL
  ) {
    return;
  }

  //If we're already loading, don't start another load
  if (state.loading) return;

  state.loading = true;
  state.error = null;
  notify();

  try {
    //Use the fetchAllPlaces function to get the data from the API, and if it fails, use the MOCK_CAVES as a fallback, 
    // and we also set the source of the caves to 'api' or 'mock' depending on where they come from, so we can use this 
    // information later if we want to display it in the UI or for debugging purposes, and we also set the lastFetch time 
    // to now so we can know when the data was last updated and when we need to refresh it again based on the CACHE_TTL.
    const data = await fetchAllPlaces();

    if (data.length > 0 && data[0].source === 'api') {
      //Fresh data from API — save to AsyncStorage for future offline use
      state.data = data; 
      state.isOffline = false;
      await persistToStorage(data);
    } else {
      //API returned empty/mock — try AsyncStorage
      const stored = await loadFromStorage();
      if (stored && stored.length > 0) {
        state.data = stored;
        state.isOffline = true;
      } else {
        state.data = MOCK_CAVES as Cave[];
        state.isOffline = false;
      }
    }

    state.lastFetch = Date.now();
  } catch (err) {
    //Network error — fall back to AsyncStorage
    const stored = await loadFromStorage();
    if (stored && stored.length > 0) {
      state.data = stored;
      state.isOffline = true;
      state.error = null;
    } else {
      state.error = 'Erreur de chargement';
      state.data = MOCK_CAVES as Cave[];
      state.isOffline = false;
    }
  } finally {
    state.loading = false;
    notify();
  }
}
