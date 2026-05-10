import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cave } from '../types';

const STORAGE_KEY = 'dijonvin_route_planner';

interface UseRoutePlannerReturn {
  stops: Cave[];
  addStop: (cave: Cave) => void;
  removeStop: (id: string) => void;
  moveStop: (fromIndex: number, toIndex: number) => void;
  clearRoute: () => void;
  hasStop: (id: string) => boolean;
}

export function useRoutePlanner(): UseRoutePlannerReturn {
  const [stops, setStops] = useState<Cave[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => { if (raw) setStops(JSON.parse(raw)); })
      .catch(err => console.warn('[useRoutePlanner] Load error:', err));
  }, []);

  const persist = useCallback((data: Cave[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(
      err => console.warn('[useRoutePlanner] Save error:', err)
    );
  }, []);

  const addStop = useCallback((cave: Cave) => {
    setStops(prev => {
      if (prev.some(s => s.id === cave.id)) return prev;
      const next = [...prev, cave];
      persist(next);
      return next;
    });
  }, [persist]); //when addStop is called, it updates the stops state and then calls persist to save
  // the updated stops to AsyncStorage

  const removeStop = useCallback((id: string) => {
    setStops(prev => {
      const next = prev.filter(s => s.id !== id);
      persist(next);
      return next;
    });
  }, [persist]);

  const moveStop = useCallback((fromIndex: number, toIndex: number) => {
    setStops(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1); //The 1 means we are removing one item at the fromIndex position, and moved will contain the removed item
      next.splice(toIndex, 0, moved); //The 0 means we are not removing any item at the new position, just inserting
      persist(next);
      return next;
    });
  }, [persist]);

  const clearRoute = useCallback(() => {
    setStops([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasStop = useCallback(
    (id: string) => stops.some(s => s.id === id),
    [stops] //stops is a dependency of hasStop, so whenever stops changes, hasStop will be re-created with the new stops value
  );

  return { stops, addStop, removeStop, moveStop, clearRoute, hasStop };
}
