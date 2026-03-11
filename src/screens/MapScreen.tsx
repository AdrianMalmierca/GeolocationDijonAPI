/**
 * MapScreen.tsx
 * Vista principal — sin MapView nativo (causa crashes)
 * Muestra los lugares en cards con distancia y botón de navegación
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Linking, Platform, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLocation } from '../hooks/useLocation';
import { usePlaces } from '../hooks/usePlaces';
import { LoadingScreen } from '../components/LoadingScreen';
import { Colors, API } from '../constants';
import { Cave } from '../types';
import { formatDistance } from '../services/dijonApi';

const CATEGORY_CONFIG = {
  cave: { icon: 'wine' as const, label: 'Cave', color: Colors.burgundy },
  commerce: { icon: 'storefront' as const, label: 'Commerce', color: Colors.brown },
  restaurant: { icon: 'restaurant' as const, label: 'Restaurant', color: Colors.gold },
  equipement: { icon: 'business' as const, label: 'Équipement', color: Colors.warmGray },
};

function PlaceRow({ cave, onNavigate }: { cave: Cave; onNavigate: (cave: Cave) => void }) {
  const config = CATEGORY_CONFIG[cave.category] ?? CATEGORY_CONFIG.commerce;
  return (
    <View style={styles.placeRow}>
      <View style={[styles.placeIcon, { backgroundColor: config.color + '22' }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
      </View>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName} numberOfLines={1}>{cave.name}</Text>
        <Text style={styles.placeAddress} numberOfLines={1}>{cave.address}</Text>
        {cave.distance != null && (
          <Text style={styles.placeDistance}>
            <Ionicons name="navigate-outline" size={11} color={Colors.warmGray} /> {formatDistance(cave.distance)}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.navBtn} onPress={() => onNavigate(cave)}>
        <Ionicons name="navigate" size={18} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<Cave['category'] | 'all'>('all');

  const { location, loading: locationLoading } = useLocation();
  const { filteredPlaces, loading: placesLoading, refresh } = usePlaces(
    location?.latitude,
    location?.longitude
  );

  const isLoading = locationLoading || placesLoading;

  const openInMaps = (cave: Cave) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(cave.name)}@${cave.latitude},${cave.longitude}`,
      android: `geo:${cave.latitude},${cave.longitude}?q=${encodeURIComponent(cave.name)}`,
    });
    if (url) Linking.openURL(url);
  };

  const openAllInMaps = () => {
    const lat = location?.latitude ?? API.CENTER.latitude;
    const lng = location?.longitude ?? API.CENTER.longitude;
    const url = Platform.select({
      ios: `maps:${lat},${lng}?q=caves+vins+Dijon`,
      android: `geo:${lat},${lng}?q=caves+vins+Dijon`,
    });
    if (url) Linking.openURL(url);
  };

  if (isLoading) return <LoadingScreen message="Recherche des caves..." />;

  const categories: { key: Cave['category'] | 'all'; label: string; icon: any }[] = [
    { key: 'all', label: 'Tous', icon: 'grid' },
    { key: 'cave', label: 'Caves', icon: 'wine' },
    { key: 'restaurant', label: 'Restos', icon: 'restaurant' },
    { key: 'commerce', label: 'Shops', icon: 'storefront' },
  ];

  const displayed = activeCategory === 'all'
    ? filteredPlaces
    : filteredPlaces.filter(p => p.category === activeCategory);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <Ionicons name="wine" size={22} color={Colors.gold} />
            <Text style={styles.headerTitle}>Dijon Vin & Terroir</Text>
          </View>
          <TouchableOpacity style={styles.mapsBtn} onPress={openAllInMaps}>
            <Ionicons name="map" size={16} color={Colors.white} />
            <Text style={styles.mapsBtnText}>Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Localisation */}
        <View style={styles.locationRow}>
          <Ionicons name="locate" size={14} color={Colors.gold} />
          <Text style={styles.locationText}>
            {location
              ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
              : 'Dijon centre (par défaut)'}
          </Text>
        </View>

        {/* Categorías */}
        <View style={styles.categoryTabs}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryTab, activeCategory === cat.key && styles.categoryTabActive]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon}
                size={13}
                color={activeCategory === cat.key ? Colors.white : Colors.warmGray}
              />
              <Text style={[
                styles.categoryTabText,
                activeCategory === cat.key && styles.categoryTabTextActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{displayed.length}</Text>
          </View>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={displayed}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PlaceRow cave={item} onNavigate={openInMaps} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={placesLoading}
            onRefresh={() => refresh(location?.latitude, location?.longitude)}
            tintColor={Colors.burgundy}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="wine-outline" size={56} color={Colors.lightGray} />
            <Text style={styles.emptyText}>Aucun lieu trouvé</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: Colors.cream, fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.burgundy,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mapsBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  locationText: { color: Colors.warmGray, fontSize: 12 },
  categoryTabs: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.darkBrown,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryTabActive: { backgroundColor: Colors.burgundy },
  categoryTabText: { color: Colors.warmGray, fontSize: 12, fontWeight: '600' },
  categoryTabTextActive: { color: Colors.white },
  countBadge: {
    marginLeft: 'auto',
    backgroundColor: Colors.darkBrown,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: { color: Colors.warmGray, fontSize: 12, fontWeight: '700' },
  listContent: { paddingVertical: 8, paddingBottom: 32 },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  placeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 2 },
  placeAddress: { fontSize: 12, color: Colors.warmGray, marginBottom: 2 },
  placeDistance: { fontSize: 12, color: Colors.warmGray },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.burgundy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: { height: 1, backgroundColor: Colors.lightGray, marginLeft: 72 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: Colors.warmGray, fontSize: 16, fontWeight: '600' },
});
