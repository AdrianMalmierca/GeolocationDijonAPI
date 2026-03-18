import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { UserLocation } from '../types';

interface UseLocationReturn {
  location: UserLocation | null;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  permissionGranted: boolean;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      //Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Autorisation de localisation refusée. Activez-la dans les paramètres.');
        setPermissionGranted(false);
        setLoading(false);
        return;
      }

      setPermissionGranted(true);

      //Obtain position with high precision
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? undefined,
      });
    } catch (err) {
      //Fallback to Dijons center in case there's an error
      console.warn('[useLocation] Error, fallback a Dijon centre:', err);
      setError('Impossible de déterminer votre position. Affichage centré sur Dijon.');
      setLocation({
        latitude: 47.3220,
        longitude: 5.0415,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    location,
    error,
    loading,
    refresh: requestLocation,
    permissionGranted,
  };
}
