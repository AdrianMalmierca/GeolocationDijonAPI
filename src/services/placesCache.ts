import { Cave } from '../types';
import { fetchAllPlaces } from './dijonApi';
import { MOCK_CAVES } from '../constants';

interface CacheState {
  data: Cave[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  listeners: Set<() => void>;
}

const CACHE_TTL = 5 * 60 * 1000;

const state: CacheState = { //global state in memory
  data: [],
  loading: false,
  error: null,
  lastFetch: null,
  listeners: new Set(),
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
  };
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
    console.log('[Cache] Loaded:', data.length, 'source:', data[0]?.source);
    state.data = data.length > 0 ? data : MOCK_CAVES as Cave[];
    state.lastFetch = Date.now();
  } catch (err) {
    state.error = 'Erreur de chargement';
    state.data = MOCK_CAVES as Cave[];
  } finally {
    state.loading = false;
    notify();
  }
}
