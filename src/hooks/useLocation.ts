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
      const { status } = await Location.requestForegroundPermissionsAsync(); //you can use const response
      
      if (status !== 'granted') { //so here you would use response.status instead of status
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
  //so when we use this hook for the first time, we ask for the location automatically,
  // but we don't want to ask for the location every time it changes, so we use useEffect with an empty dependency 
  // array to execute only once on mount, and we use the requestLocation function that is memoized with useCallback 
  // to avoid unnecessary re-renders and to have a stable reference for the refresh function that we return from the hook
  useEffect(() => { 
    requestLocation();
  }, [requestLocation]); //React execute the effect only once on mount, and if requestLocation changes
  // (which it won't because it's memoized with useCallback), it would execute again, but in this case it will only
  //  execute once when the component that uses this hook is mounted. 

  return {
    location,
    error,
    loading,
    refresh: requestLocation,
    permissionGranted,
  };
}
