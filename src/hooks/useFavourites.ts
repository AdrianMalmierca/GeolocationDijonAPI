import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cave } from '../types';

const STORAGE_KEY = 'dijonvin_favourites';

interface UseFavouritesReturn {
  favourites: Cave[];
  isFavourite: (id: string) => boolean;
  toggleFavourite: (cave: Cave) => Promise<void>;
  loading: boolean;
}

export function useFavourites(): UseFavouritesReturn {
  const [favourites, setFavourites] = useState<Cave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) setFavourites(JSON.parse(raw));
      })
      .catch(err => console.warn('[useFavourites] Load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const isFavourite = useCallback(
    (id: string) => favourites.some(f => f.id === id),
    [favourites]
  );

  const toggleFavourite = useCallback(async (cave: Cave) => {
    setFavourites(prev => {
      const exists = prev.some(f => f.id === cave.id);
      const next = exists ? prev.filter(f => f.id !== cave.id) : [...prev, cave];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(
        err => console.warn('[useFavourites] Save error:', err)
      );
      return next;
    });
  }, []);

  return { favourites, isFavourite, toggleFavourite, loading };
}
