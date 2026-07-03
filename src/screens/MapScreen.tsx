import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Animated,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation } from '../hooks/useLocation';
import { usePlaces } from '../hooks/usePlaces';
import { CaveCard } from '../components/CaveCard';
import { LoadingScreen } from '../components/LoadingScreen';
import { Colors, API } from '../constants';
import { Cave } from '../types';
import { MapMarker } from '../components/MapMarker';
import { useFavourites } from '../hooks/useFavourites';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null); //useRef to keep a persistent reference to the MapView component, to be able to call methods on it like animateToRegion
  const [selectedCave, setSelectedCave] = useState<Cave | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const { isFavourite, toggleFavourite } = useFavourites();

  const { location, error: locError } = useLocation();
  const { filteredPlaces, loading: placesLoading, isOffline, filters, setFilters, refresh } = usePlaces(
    location?.latitude, location?.longitude
  );

  const isLoading = placesLoading;

  const handleMarkerPress = useCallback((cave: Cave) => { //usecallback to memoize the function and not recreate it on every render
    setSelectedCave(cave); //activate the bottom sheet
    Animated.spring(bottomAnim, {
      toValue: 1, useNativeDriver: true, tension: 60, friction: 10, //spring animation for the bottom sheet, with a bit of bounce
    }).start();
    mapRef.current?.animateToRegion({
      latitude: cave.latitude - 0.004, //to center the cave a bit higher on the screen to show the bottom sheet
      longitude: cave.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 400);
  }, [bottomAnim]);

  const handleClose = useCallback(() => {
    Animated.timing(bottomAnim, {
      toValue: 0, duration: 200, useNativeDriver: true, //to value 0 to hide the bottom sheet, with a fade out animation
    }).start(() => setSelectedCave(null)); //hide the bottom sheet and then set the selected cave to null to unselect the marker
  }, [bottomAnim]);

  const centerOnUser = useCallback(() => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 600);
    }
  }, [location]);

  const centerOnDijon = useCallback(() => {
    mapRef.current?.animateToRegion({
      latitude: API.CENTER.latitude,
      longitude: API.CENTER.longitude,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    }, 600);
  }, []);

  if (isLoading) return <LoadingScreen message="Recherche des caves..." />;

  const bottomTranslate = bottomAnim.interpolate({ //transform the bottomAnim value from 0 to 1 into a translateY value from 320 (hidden) to 0 (visible)
    inputRange: [0, 1], outputRange: [320, 0],
    //starts in 0 to 1, 0 is hidden and 1 is visible
    //but 0, 1 is not valid for the UI, we need pixels
    //animation: 0 -> 320px down
    //animation: 1 -> 0px visible
  });

  const filtersData = [
    { key: 'showCaves',       label: 'Caves',       icon: 'wine'       as const, color: Colors.burgundy },
    { key: 'showRestaurants', label: 'Restaurants', icon: 'restaurant' as const, color: Colors.gold     },
    { key: 'showCommerces',   label: 'Commerces',   icon: 'storefront' as const, color: Colors.brown    },
  ];

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={{
          latitude: API.CENTER.latitude,
          longitude: API.CENTER.longitude,
          latitudeDelta: 0.35,
          longitudeDelta: 0.35,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false} //hide default location button to use our custom one
        showsCompass={false} //hide compass to avoid overlapping with our controls
      >
        {filteredPlaces.map(cave => (
          <Marker
            key={cave.id}
            coordinate={{ latitude: cave.latitude, longitude: cave.longitude }}
            onPress={() => handleMarkerPress(cave)}
            tracksViewChanges={false} //to optimize performance by not re-rendering the marker view on every change,
            // since we use a custom view for the marker, we set it to false and it will only re-render when the marker 
            // is pressed and selected, which is when we want to show the selected state
          >
            <MapMarker cave={cave} selected={selectedCave?.id === cave.id} />
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Ionicons name="wine" size={18} color={Colors.gold} />
            <Text style={styles.headerTitle}>Dijon Vin & Terroir</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredPlaces.length} lieux</Text>
          </View>
        </View>
      </View>

      {isOffline && (
        <View style={[styles.offlineBanner, { top: insets.top + 56 }]}> //to float into the map
          <Ionicons name="cloud-offline-outline" size={14} color={Colors.white} />
          <Text style={styles.offlineText}>Données hors ligne</Text>
        </View>
      )}

      {/* Controls */}
      <View style={[styles.controls, { top: insets.top + 68 }]}>
        <TouchableOpacity style={styles.controlBtn} onPress={centerOnUser}>
          <Ionicons name="locate" size={20} color={Colors.burgundy} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={centerOnDijon}>
          <Ionicons name="home" size={20} color={Colors.burgundy} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, showFilters && styles.controlBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={20} color={showFilters ? Colors.white : Colors.burgundy} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => refresh(location?.latitude, location?.longitude)}
        >
          <Ionicons name="refresh" size={20} color={Colors.burgundy} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={[styles.filtersPanel, { top: insets.top + 68 }]}>
          <Text style={styles.filterTitle}>Filtres</Text>
          {filtersData.map(f => (
            <TouchableOpacity
              key={f.key}
              style={styles.filterRow}
              onPress={() => setFilters({ ...filters, [f.key]: !filters[f.key as keyof typeof filters] })}
            >
              <Ionicons name={f.icon} size={16} color={f.color} />
              <Text style={styles.filterLabel}>{f.label}</Text>
              <View style={[
                styles.toggle,
                !!filters[f.key as keyof typeof filters] && { backgroundColor: f.color } //if the filter is active, change the bg color to the filter color, otherwise keep it white
                //!! transforms true -> true, false -> false and undefined -> false, to avoid issues with undefined values in filters
                //double !! cause we want to be sure to have a boolean value, 
                // if filters[f.key] is undefined it will be false and the toggle will be in the off state
              ]}>
                {filters[f.key as keyof typeof filters] && ( //render the check icon only if the filter is active
                  <Ionicons name="checkmark" size={11} color={Colors.white} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bottom Sheet */}
      {selectedCave && (
        <Animated.View style={[
          styles.bottomSheet,
          { paddingBottom: insets.bottom + 16 },
          { transform: [{ translateY: bottomTranslate }] },
        ]}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Ionicons name="close" size={20} color={Colors.warmGray} />
          </TouchableOpacity>
          <CaveCard 
            cave={selectedCave} 
            isFavourite={isFavourite(selectedCave.id)}
            onToggleFavourite={toggleFavourite}
          />
        </Animated.View>
      )}

      {/* Error Banner */}
      {locError && (
        <View style={[styles.errorBanner, { top: insets.top + 60 }]}>
          <Ionicons name="warning-outline" size={13} color={Colors.white} />
          <Text style={styles.errorText} numberOfLines={1}>{locError}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  //Marker
  markerContainer: { alignItems: 'center' },
  markerSelected: { transform: [{ scale: 1.3 }] },
  markerBubble: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3, elevation: 4,
  },
  markerTail: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    marginTop: -1,
  },

  //Header
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: Colors.dark + 'EE',
    paddingHorizontal: 16, paddingBottom: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: Colors.cream, fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  countBadge: {
    backgroundColor: Colors.burgundy, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  countText: { color: Colors.white, fontSize: 12, fontWeight: '600' },

  //Controls
  controls: { position: 'absolute', right: 14, gap: 9 },
  controlBtn: {
    width: 42, height: 42, borderRadius: 11, backgroundColor: Colors.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18, shadowRadius: 4, elevation: 4,
  },
  controlBtnActive: { backgroundColor: Colors.burgundy },

  //Filters
  filtersPanel: {
    position: 'absolute', right: 66, backgroundColor: Colors.white,
    borderRadius: 14, padding: 14, minWidth: 200,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 7,
  },
  filterTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.dark,
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 9 },
  filterLabel: { flex: 1, fontSize: 13, color: Colors.darkBrown },
  toggle: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: Colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },

  //Bottom sheet
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 9,
    paddingTop: 6,
  },
  closeBtn: { alignSelf: 'flex-end', padding: 8, marginRight: 10 },

  //Error
  errorBanner: {
    position: 'absolute', left: 14, right: 66,
    backgroundColor: Colors.burgundy + 'CC',
    borderRadius: 9, padding: 8,
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  errorText: { color: Colors.white, fontSize: 12, flex: 1 },

  //Offline banner
  offlineBanner: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warmGray + 'EE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  offlineText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
