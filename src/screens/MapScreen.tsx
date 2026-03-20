/**
 * MapScreen.tsx — Con react-native-maps
 * Requiere EAS Build — no funciona con Expo Go
 */

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

const CATEGORY_CONFIG = {
  cave:       { icon: 'wine'       as const, color: Colors.burgundy },
  commerce:   { icon: 'storefront' as const, color: Colors.brown    },
  restaurant: { icon: 'restaurant' as const, color: Colors.gold     },
  equipement: { icon: 'business'   as const, color: Colors.warmGray },
};

function MapMarkerView({ cave, selected }: { cave: Cave; selected: boolean }) {
  const config = CATEGORY_CONFIG[cave.category] ?? CATEGORY_CONFIG.commerce;
  return (
    <View style={[styles.markerContainer, selected && styles.markerSelected]}>
      <View style={[styles.markerBubble, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon} size={14} color={Colors.white} />
      </View>
      <View style={[styles.markerTail, { borderTopColor: config.color }]} />
    </View>
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [selectedCave, setSelectedCave] = useState<Cave | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const bottomAnim = useRef(new Animated.Value(0)).current;

  const { location, loading: locLoading, error: locError } = useLocation();
  const { filteredPlaces, loading: placesLoading, filters, setFilters, refresh } = usePlaces(
    location?.latitude, location?.longitude
  );

  const isLoading = locLoading || placesLoading;

  const handleMarkerPress = useCallback((cave: Cave) => {
    setSelectedCave(cave);
    Animated.spring(bottomAnim, {
      toValue: 1, useNativeDriver: true, tension: 60, friction: 10,
    }).start();
    mapRef.current?.animateToRegion({
      latitude: cave.latitude - 0.004,
      longitude: cave.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 400);
  }, [bottomAnim]);

  const handleClose = useCallback(() => {
    Animated.timing(bottomAnim, {
      toValue: 0, duration: 200, useNativeDriver: true,
    }).start(() => setSelectedCave(null));
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

  const bottomTranslate = bottomAnim.interpolate({
    inputRange: [0, 1], outputRange: [320, 0],
  });

  return (
    <View style={styles.container}>
      {/* MAPA */}
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
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {filteredPlaces.map(cave => (
          <Marker
            key={cave.id}
            coordinate={{ latitude: cave.latitude, longitude: cave.longitude }}
            onPress={() => handleMarkerPress(cave)}
            tracksViewChanges={false}
          >
            <MapMarkerView cave={cave} selected={selectedCave?.id === cave.id} />
          </Marker>
        ))}
      </MapView>

      {/* HEADER */}
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

      {/* CONTROLES */}
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

      {/* FILTROS */}
      {showFilters && (
        <View style={[styles.filtersPanel, { top: insets.top + 68 }]}>
          <Text style={styles.filterTitle}>Filtres</Text>
          {[
            { key: 'showCaves',       label: 'Caves',       icon: 'wine'       as const, color: Colors.burgundy },
            { key: 'showRestaurants', label: 'Restaurants', icon: 'restaurant' as const, color: Colors.gold     },
            { key: 'showCommerces',   label: 'Commerces',   icon: 'storefront' as const, color: Colors.brown    },
          ].map(f => (
            <TouchableOpacity
              key={f.key}
              style={styles.filterRow}
              onPress={() => setFilters({ ...filters, [f.key]: !filters[f.key as keyof typeof filters] })}
            >
              <Ionicons name={f.icon} size={16} color={f.color} />
              <Text style={styles.filterLabel}>{f.label}</Text>
              <View style={[
                styles.toggle,
                !!filters[f.key as keyof typeof filters] && { backgroundColor: f.color }
              ]}>
                {filters[f.key as keyof typeof filters] && (
                  <Ionicons name="checkmark" size={11} color={Colors.white} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* BOTTOM SHEET */}
      {selectedCave && (
        <Animated.View style={[
          styles.bottomSheet,
          { paddingBottom: insets.bottom + 16 },
          { transform: [{ translateY: bottomTranslate }] },
        ]}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Ionicons name="close" size={20} color={Colors.warmGray} />
          </TouchableOpacity>
          <CaveCard cave={selectedCave} />
        </Animated.View>
      )}

      {/* ERROR BANNER */}
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

  // Marcadores
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

  // Header
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

  // Controles
  controls: { position: 'absolute', right: 14, gap: 9 },
  controlBtn: {
    width: 42, height: 42, borderRadius: 11, backgroundColor: Colors.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18, shadowRadius: 4, elevation: 4,
  },
  controlBtnActive: { backgroundColor: Colors.burgundy },

  // Filtros
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

  // Bottom sheet
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 9,
    paddingTop: 6,
  },
  closeBtn: { alignSelf: 'flex-end', padding: 8, marginRight: 10 },

  // Error
  errorBanner: {
    position: 'absolute', left: 14, right: 66,
    backgroundColor: Colors.burgundy + 'CC',
    borderRadius: 9, padding: 8,
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  errorText: { color: Colors.white, fontSize: 12, flex: 1 },
});
